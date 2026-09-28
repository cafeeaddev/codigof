# Histórico — Migração do Lovable/Supabase para Postgres local

Última atualização: 2026-09-28

## Objetivo
Rodar o app inteiro internamente, sem Lovable nem Supabase: backend próprio + PostgreSQL local,
com os dados copiados da produção (`rbjfnuzbrotruqpoermr`).

## Decisão (2026-09-24)
O Docker não está mais instalado na máquina, mas há um **PostgreSQL 18 nativo** (serviço
`postgresql-x64-18`). Escolhido: **Postgres puro + backend próprio**, em vez de Supabase local
via Docker.

## O que foi feito (branch `migracao-postgres-local`, ainda sem commit)
- `server/`: backend Node/Express (API REST estilo PostgREST com RLS, auth JWT, RPC,
  realtime por WebSocket, porte das 5 edge functions). Detalhes no README.
- `src/integrations/supabase/client.ts`: substituído por cliente próprio com a mesma API;
  nenhuma tela precisou mudar. Removidos `@supabase/supabase-js` e a CLI `supabase`.
- `vite.config.ts`: proxy `/api` → `localhost:3001`. `npm run dev` sobe web + API.
- Scripts: `db:pull-schema`, `db:migrate`, `db:import`.
- `server/.env` já criado com `JWT_SECRET` e senha do `app_server` geradas.
  **Faltam** `ADMIN_DATABASE_URL` e `SOURCE_DATABASE_URL`.

## Descobertas
- As migrations do Lovable **não reconstroem o banco**: `profiles`, `fast_track_responses`,
  `mission5_settings`, `respostas_missao5`, `form_submissions` e `update_updated_at_column()`
  nunca aparecem nelas, e há migrations que falhariam (trigger duplicado etc.).
  → O schema oficial passa a ser o dump da produção (`server/sql/schema.sql`).
- O `origin` do git (`cafeeaddev/vaporwave-dreamscape-forge`) retorna "Repository not found".

## Testes feitos (cluster Postgres temporário, schema aproximado)
- 35/35 testes da API: login, refresh, CPF, RLS, embeds, filtros, upsert, RPC, reset de senha,
  realtime (postgres_changes + broadcast), proteção contra injeção.
- Cliente do frontend exercitado com as mesmas cadeias usadas nas telas: tudo ok.
- Fluxo `db:pull-schema` → `db:migrate` → `db:import` validado (cópia idêntica à origem).
- `tsc` (app e server) e `vite build` ok.

## 2026-09-28 — banco local com dados de produção
- Senha do `postgres` local redefinida e senha do banco de produção
  resetada no Supabase; ambas em `server/.env`.
- `PG_BIN_DIR` no `.env` estava corrompido (barras invertidas viraram caracteres de controle);
  agora usa `C:/Program Files/PostgreSQL/18/bin`.
- O driver `pg` do Node trata `sslmode=require` como `verify-full` e recusa a CA do pooler do
  Supabase. Criado `config.sourceDatabaseUrlForNode()` (adiciona `uselibpqcompat=true`, mesma
  semântica do pg_dump), usado em `pull-schema.ts` e `import-data.ts`.
- `db:pull-schema` → `db:migrate` → `db:import` rodados. Baseline: `20260318183321`; a migration
  `20260319185003` (4 profiles) foi aplicada, mas esses usuários já existiam na produção e o import
  sobrescreveu tudo. Contagem de linhas idêntica à produção nas 39 tabelas + `auth.users` (849).
- `npm run dev` no ar (web :8080, API :3001). Falta o teste no navegador.

## 2026-09-28 — bug no login (também em produção)
- 66 e-mails têm 2+ linhas em `profiles` (135 perfis, mesmo CPF entre as cópias). Nenhum deles
  tinha login: na produção o `.maybeSingle()` da edge function `auth-with-cpf` falha com várias
  linhas (500); no backend local o `UPDATE ... WHERE email` batia em `profiles_user_id_unique`.
- Correção (local e na edge function): usa o profile mais antigo e vincula só ele (`WHERE id`).
- `AuthContext`: respostas 4xx agora mostram o motivo (CPF incorreto etc.) em vez de "Erro interno".
- Pendente: decidir se os perfis duplicados devem ser mesclados/apagados.

## Próximos passos
1. ~~Senha do `postgres` local~~ (feito em 2026-09-28). (desconhecida). Para redefinir (PowerShell **como administrador**):
   ```
   # 1. trocar scram-sha-256 por trust nas linhas "host ... 127.0.0.1/32" e "::1/128"
   notepad "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
   Restart-Service postgresql-x64-18
   # 2. definir a nova senha
   & "C:\Program Files\PostgreSQL\18\bin\psql" -h localhost -U postgres -c "ALTER USER postgres PASSWORD '<nova senha>'"
   # 3. voltar o pg_hba.conf para scram-sha-256 e reiniciar de novo
   Restart-Service postgresql-x64-18
   ```
   Depois preencher `ADMIN_DATABASE_URL` em `server/.env`.
2. ~~Connection string da produção~~ (feito em 2026-09-28).: Supabase → Project Settings → Database → Connection
   string (Session pooler) → `SOURCE_DATABASE_URL` em `server/.env`.
3. ~~Rodar db:pull-schema / db:migrate / db:import~~ (feito em 2026-09-28). Falta commitar
   `server/sql/schema.sql` + `schema.baseline`.
4. `npm run dev` e testar os fluxos no navegador (login por CPF, admin, quizzes ao vivo).
5. Opcional: `OPENAI_API_KEY` (narração do tutorial) e `USERS_API_TOKEN` (API externa).
