/**
 * Carrega um backup gerado por `npm run db:backup` no banco configurado em server/.env.
 * O banco já deve ter a estrutura (rode `npm run db:migrate` antes).
 *
 * Os dados atuais do app e os usuários de login são APAGADOS antes da carga.
 * Uso: npm run db:restore -- caminho/do/arquivo.sql
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { config } from '../src/config.js';

const pgBin = (name: string) => (process.env.PG_BIN_DIR ? path.join(process.env.PG_BIN_DIR, name) : name);

const file = process.argv[2] ? path.resolve(process.argv[2]) : '';
if (!file || !fs.existsSync(file)) {
  console.error('Informe o arquivo de backup: npm run db:restore -- caminho/do/arquivo.sql');
  process.exit(1);
}

const appUrl = new URL(config.databaseUrl());
const target = new URL(config.adminDatabaseUrl());
target.pathname = appUrl.pathname;

// 1. Limpa os dados atuais (sem disparar triggers nem checar FKs)
const db = new pg.Client({ connectionString: target.toString() });
await db.connect();
try {
  await db.query('BEGIN');
  await db.query('SET LOCAL session_replication_role = replica');
  const tables = await db.query<{ t: string }>(
    `SELECT format('public.%I', tablename) AS t FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (tables.rowCount) await db.query(`TRUNCATE ${tables.rows.map((r) => r.t).join(', ')} CASCADE`);
  await db.query('TRUNCATE auth.users CASCADE');
  await db.query('COMMIT');
} catch (err) {
  await db.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await db.end();
}

// 2. Carrega o arquivo numa transação só: se algo falhar, nada é gravado
console.log(`Carregando ${path.basename(file)} em ${appUrl.pathname.slice(1)}...`);
execFileSync(pgBin('psql'), ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '--single-transaction', '-f', file, target.toString()], {
  stdio: ['ignore', 'ignore', 'inherit'],
  env: { ...process.env, PGOPTIONS: '-c session_replication_role=replica' },
});

const check = new pg.Client({ connectionString: target.toString() });
await check.connect();
const { rows } = await check.query<{ users: string; profiles: string }>(
  `SELECT (SELECT count(*) FROM auth.users) AS users, (SELECT count(*) FROM public.profiles) AS profiles`,
);
await check.end();
console.log(`Restauração concluída: ${rows[0].users} usuários de login, ${rows[0].profiles} perfis.`);
