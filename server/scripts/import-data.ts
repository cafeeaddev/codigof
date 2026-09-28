/**
 * Copia os dados do Supabase de produção para o Postgres local.
 * O schema local já deve existir (npm run db:migrate).
 *
 *   - auth.users: usuários e hashes de senha (bcrypt), para os logins continuarem valendo
 *   - public.*:   todos os dados, via pg_dump --data-only
 *
 * Os dados locais das tabelas public são APAGADOS antes da cópia.
 * Uso: npm run db:import
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { config } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '../..');
const dumpDir = path.join(root, 'server/.data');
const dumpFile = path.join(dumpDir, `public-data-${new Date().toISOString().slice(0, 10)}.sql`);

const AUTH_USER_COLUMNS = [
  'instance_id', 'id', 'aud', 'role', 'email', 'encrypted_password', 'email_confirmed_at',
  'last_sign_in_at', 'raw_app_meta_data', 'raw_user_meta_data', 'is_super_admin', 'created_at',
  'updated_at', 'phone', 'banned_until', 'deleted_at', 'is_anonymous',
];

const appUrl = new URL(config.databaseUrl());
const target = new URL(config.adminDatabaseUrl());
target.pathname = appUrl.pathname;
const sourceUrl = config.sourceDatabaseUrl();

function pgBin(name: string): string {
  const dir = process.env.PG_BIN_DIR;
  return dir ? path.join(dir, name) : name;
}

// 1. Dump dos dados do schema public da produção
fs.mkdirSync(dumpDir, { recursive: true });
console.log('Baixando dados de produção (pg_dump)...');
execFileSync(
  pgBin('pg_dump'),
  ['--data-only', '--schema=public', '--no-owner', '--no-privileges', '--file', dumpFile, sourceUrl],
  { stdio: 'inherit' },
);
console.log(`Dump salvo em ${path.relative(root, dumpFile)}`);

// 2. Limpa o destino e copia auth.users
const source = new pg.Client({ connectionString: config.sourceDatabaseUrlForNode() });
const db = new pg.Client({ connectionString: target.toString() });
await source.connect();
await db.connect();
try {
  const users = await source.query(`SELECT ${AUTH_USER_COLUMNS.join(', ')} FROM auth.users`);
  console.log(`Copiando ${users.rowCount} usuários de auth.users...`);

  await db.query('BEGIN');
  // replica: não dispara triggers (ex.: criação automática de profile) nem checa FKs
  await db.query('SET LOCAL session_replication_role = replica');
  const tables = await db.query<{ t: string }>(
    `SELECT format('public.%I', tablename) AS t FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (tables.rowCount) await db.query(`TRUNCATE ${tables.rows.map((r) => r.t).join(', ')} CASCADE`);
  await db.query('TRUNCATE auth.users CASCADE');

  for (const user of users.rows) {
    const values = AUTH_USER_COLUMNS.map((c) =>
      c.startsWith('raw_') && user[c] !== null ? JSON.stringify(user[c]) : user[c],
    );
    await db.query(
      `INSERT INTO auth.users (${AUTH_USER_COLUMNS.join(', ')})
       VALUES (${AUTH_USER_COLUMNS.map((_, i) => `$${i + 1}`).join(', ')})`,
      values,
    );
  }
  await db.query('COMMIT');
} catch (err) {
  await db.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await source.end();
  await db.end();
}

// 3. Restaura os dados public no banco local
console.log('Restaurando dados no Postgres local (psql)...');
execFileSync(pgBin('psql'), ['-v', 'ON_ERROR_STOP=1', '-q', '-f', dumpFile, target.toString()], {
  stdio: 'inherit',
  env: { ...process.env, PGOPTIONS: '-c session_replication_role=replica' },
});

console.log('Importação concluída.');
