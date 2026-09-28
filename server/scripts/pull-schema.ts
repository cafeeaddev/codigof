/**
 * Gera server/sql/schema.sql a partir do banco de produção (Supabase):
 *   - pg_dump --schema-only do schema public (tabelas, funções, policies de RLS, triggers)
 *   - triggers que o app mantém em auth.users (ex.: criação automática de profile)
 *   - tabelas da publicação supabase_realtime
 *
 * Também grava server/sql/schema.baseline com a última migration já incluída no dump.
 * Uso: npm run db:pull-schema   (depois: npm run db:migrate -- --reset)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { config } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '../..');
const schemaFile = path.join(root, 'server/sql/schema.sql');
const baselineFile = path.join(root, 'server/sql/schema.baseline');
const sourceUrl = config.sourceDatabaseUrl();
const pgBin = (name: string) => (process.env.PG_BIN_DIR ? path.join(process.env.PG_BIN_DIR, name) : name);

console.log('Extraindo schema public da produção (pg_dump)...');
const dump = execFileSync(
  pgBin('pg_dump'),
  ['--schema-only', '--schema=public', '--no-owner', '--no-privileges', '--no-comments', sourceUrl],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);

const source = new pg.Client({ connectionString: config.sourceDatabaseUrlForNode() });
await source.connect();
let extra = '';
let lastMigration = '';
try {
  // Nomes totalmente qualificados em pg_get_triggerdef (public.handle_new_user etc.)
  await source.query(`SET search_path = ''`);
  const triggers = await source.query<{ def: string }>(`
    SELECT pg_get_triggerdef(t.oid) AS def
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_proc p ON p.oid = t.tgfoid
      JOIN pg_namespace pn ON pn.oid = p.pronamespace
     WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal AND pn.nspname = 'public'`);
  const published = await source.query<{ tablename: string }>(`
    SELECT tablename FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' ORDER BY tablename`);
  const migrations = await source
    .query<{ version: string }>(`SELECT max(version) AS version FROM supabase_migrations.schema_migrations`)
    .catch(() => ({ rows: [{ version: '' }] }));
  lastMigration = migrations.rows[0]?.version ?? '';

  extra += '\n-- Triggers do app em auth.users\n';
  for (const t of triggers.rows) extra += `${t.def};\n`;
  extra += '\n-- Tabelas com realtime\n';
  for (const t of published.rows) extra += `ALTER PUBLICATION supabase_realtime ADD TABLE public.${JSON.stringify(t.tablename)};\n`;
} finally {
  await source.end();
}

// O schema public já existe no destino; o dump tenta criá-lo de novo
const body = dump
  .replace(/^CREATE SCHEMA public;$/m, '-- CREATE SCHEMA public; (já existe)')
  // Triggers do nosso realtime (se a origem já for um banco local); o db:migrate recria
  .replace(/^CREATE TRIGGER realtime_notify .*$/gm, '');
fs.writeFileSync(
  schemaFile,
  `-- Gerado por \`npm run db:pull-schema\` em ${new Date().toISOString()}. Não edite à mão.\n` + body + extra,
);

// Baseline: última migration local já refletida no dump
const files = fs.readdirSync(path.join(root, 'server/sql/migrations')).filter((f) => f.endsWith('.sql')).sort();
const baseline = lastMigration ? files.filter((f) => f.slice(0, 14) <= lastMigration).pop() ?? '' : files.at(-1) ?? '';
fs.writeFileSync(baselineFile, `${baseline}\n`);

console.log(`Schema salvo em ${path.relative(root, schemaFile)} (baseline: ${baseline || 'nenhuma'}).`);
