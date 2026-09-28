/**
 * Cria o banco local e aplica o schema:
 *   1. cria o database e a role app_server (usada pelo servidor em runtime)
 *   2. server/sql/00_bootstrap.sql  (roles anon/authenticated, schema auth)
 *   3. schema do app, de uma destas fontes:
 *      - server/sql/schema.sql (dump do schema de produção, gerado por `npm run db:pull-schema`):
 *        é a fonte fiel. As migrations existentes ficam marcadas como aplicadas.
 *      - senão, reexecuta server/sql/migrations/*.sql desde o início. O histórico do
 *        Lovable não é 100% reproduzível; use --tolerant para pular comandos que falham.
 *   4. migrations novas em server/sql/migrations (posteriores ao schema base)
 *   5. server/sql/90_realtime.sql   (triggers de NOTIFY para o realtime)
 *
 * Uso: npm run db:migrate [-- --reset] [-- --tolerant]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { config } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '../..');
const reset = process.argv.includes('--reset');
const tolerant = process.argv.includes('--tolerant');
const schemaFile = path.join(root, 'server/sql/schema.sql');
const migrationsDir = path.join(root, 'server/sql/migrations');

// Tabelas assinadas via realtime no frontend que podem não estar na publicação
const REALTIME_EXTRA_TABLES = [
  'quiz2_submissions', 'quiz3_session_state', 'quiz3_participants', 'quiz3_answers',
  'quiz5_submissions', 'fluxo_cliente_submissions', 'mission_questions',
];

const appUrl = new URL(config.databaseUrl());
const dbName = appUrl.pathname.slice(1);
const appUser = decodeURIComponent(appUrl.username);
const appPassword = decodeURIComponent(appUrl.password);

const adminUrl = new URL(config.adminDatabaseUrl());
const adminOnTarget = new URL(adminUrl);
adminOnTarget.pathname = `/${dbName}`;

const ident = (s: string) => `"${s.replace(/"/g, '""')}"`;
const literal = (s: string) => `'${s.replace(/'/g, "''")}'`;
const pgBin = (name: string) => (process.env.PG_BIN_DIR ? path.join(process.env.PG_BIN_DIR, name) : name);

/** Roda um arquivo SQL com psql (necessário para dumps do pg_dump 18, que usam \restrict). */
function psql(file: string, opts: { strict: boolean }): { ok: boolean; errors: string[] } {
  const args = ['-q', '-X', '-v', `ON_ERROR_STOP=${opts.strict ? 1 : 0}`, '-f', file, adminOnTarget.toString()];
  if (opts.strict) args.unshift('--single-transaction');
  const result = spawnSync(pgBin('psql'), args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  const errors = (result.stderr ?? '').split(/\r?\n/).filter((l) => /ERROR|ERRO/.test(l));
  return { ok: result.status === 0 && errors.length === 0, errors };
}

async function prepareDatabase() {
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    if (reset) {
      console.log(`Apagando o banco ${dbName}...`);
      await admin.query(`DROP DATABASE IF EXISTS ${ident(dbName)} WITH (FORCE)`);
    }
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (!exists.rowCount) {
      console.log(`Criando o banco ${dbName}...`);
      await admin.query(`CREATE DATABASE ${ident(dbName)}`);
    }
    const role = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [appUser]);
    const verb = role.rowCount ? 'ALTER' : 'CREATE';
    // BYPASSRLS só vale para consultas internas do servidor; nas requisições
    // ele troca para anon/authenticated (SET ROLE) e a RLS volta a valer.
    await admin.query(`${verb} ROLE ${ident(appUser)} LOGIN BYPASSRLS PASSWORD ${literal(appPassword)}`);
  } finally {
    await admin.end();
  }
}

async function applySchema() {
  const db = new pg.Client({ connectionString: adminOnTarget.toString() });
  await db.connect();
  try {
    await db.query(fs.readFileSync(path.join(root, 'server/sql/00_bootstrap.sql'), 'utf8'));

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    const firstRun = !(await db.query('SELECT 1 FROM _meta.migrations LIMIT 1')).rowCount;

    if (firstRun && fs.existsSync(schemaFile)) {
      console.log('Aplicando schema de produção (server/sql/schema.sql)...');
      const { ok, errors } = psql(schemaFile, { strict: true });
      if (!ok) {
        console.error(`Falha ao aplicar schema.sql:\n  ${errors.join('\n  ')}`);
        process.exit(1);
      }
      // O dump já contém o efeito de todas as migrations existentes
      const baseline = fs.readFileSync(path.join(root, 'server/sql/schema.baseline'), 'utf8').trim();
      await db.query(
        `INSERT INTO _meta.migrations (name) SELECT unnest($1::text[]) ON CONFLICT DO NOTHING`,
        [files.filter((f) => f <= baseline)],
      );
    } else if (firstRun) {
      await db.query(fs.readFileSync(path.join(root, 'server/sql/01_prelude.sql'), 'utf8'));
    }

    const applied = new Set(
      (await db.query<{ name: string }>('SELECT name FROM _meta.migrations')).rows.map((r) => r.name),
    );
    let count = 0;
    let skipped = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const full = path.join(migrationsDir, file);
      let result = psql(full, { strict: true });
      if (!result.ok && tolerant) {
        // Reexecuta comando a comando, ignorando os que falham
        result = psql(full, { strict: false });
        skipped += result.errors.length;
        console.warn(`  ${file}: ${result.errors.length} comando(s) ignorado(s)`);
        result.errors.forEach((e) => console.warn(`    ${e.replace(/^.*?(ERRO|ERROR)/, '$1')}`));
      } else if (!result.ok) {
        console.error(`\nFalha na migration ${file}:\n  ${result.errors.join('\n  ')}`);
        console.error('\nUse `npm run db:pull-schema` (recomendado) ou rode com -- --tolerant.');
        process.exit(1);
      }
      await db.query('INSERT INTO _meta.migrations (name) VALUES ($1)', [file]);
      count++;
    }
    console.log(
      `Migrations: ${count} aplicadas, ${applied.size} já estavam aplicadas` +
        (skipped ? `, ${skipped} comandos ignorados (modo tolerante)` : '') + '.',
    );

    await db.query(`
      GRANT anon, authenticated, service_role TO ${ident(appUser)};
      GRANT USAGE ON SCHEMA auth, public TO ${ident(appUser)};
      GRANT ALL ON ALL TABLES IN SCHEMA auth TO ${ident(appUser)};
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
    `);

    await db.query(fs.readFileSync(path.join(root, 'server/sql/90_realtime.sql'), 'utf8'));
    const tables = await db.query<{ t: string }>('SELECT realtime.sync_triggers($1) AS t', [REALTIME_EXTRA_TABLES]);
    console.log(`Realtime ativo em: ${tables.rows.map((r) => r.t).join(', ')}`);
  } finally {
    await db.end();
  }
}

await prepareDatabase();
await applySchema();
console.log('Banco pronto.');
