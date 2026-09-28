/**
 * Gera um backup dos DADOS do banco local (usuários de login + todas as tabelas do app),
 * para ser carregado em outro servidor com `npm run db:restore`.
 *
 * A estrutura do banco não vai no arquivo: ela vem do repositório (`npm run db:migrate`).
 * O arquivo contém dados pessoais e hashes de senha: não commitar, enviar por canal seguro.
 *
 * Uso: npm run db:backup [-- caminho/do/arquivo.sql]
 *      (padrão: server/.data/codigof-backup-AAAA-MM-DD.sql)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../src/config.js';

const root = path.resolve(import.meta.dirname, '../..');
const pgBin = (name: string) => (process.env.PG_BIN_DIR ? path.join(process.env.PG_BIN_DIR, name) : name);

const appUrl = new URL(config.databaseUrl());
const source = new URL(config.adminDatabaseUrl());
source.pathname = appUrl.pathname;

const file = path.resolve(
  process.argv[2] ?? path.join(root, 'server/.data', `codigof-backup-${new Date().toISOString().slice(0, 10)}.sql`),
);
fs.mkdirSync(path.dirname(file), { recursive: true });

console.log(`Gerando backup de ${appUrl.pathname.slice(1)}...`);
execFileSync(
  pgBin('pg_dump'),
  [
    '--data-only', '--no-owner', '--no-privileges',
    // -t inclui as sequences do public, então os contadores (ids) vão junto
    '--table=public.*', '--table=auth.users',
    '--file', file, source.toString(),
  ],
  { stdio: 'inherit' },
);
console.log(`Backup salvo em ${file} (${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB)`);
