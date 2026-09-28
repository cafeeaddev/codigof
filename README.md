# Código F

Aplicação React (Vite + shadcn) originalmente criada no Lovable. Hoje roda **sem Supabase**:
um backend Node próprio (`server/`) sobre um **PostgreSQL** local.

## Arquitetura

```
navegador ──/api──▶ server/ (Express + WebSocket) ──▶ PostgreSQL
```

- **Frontend** (`src/`): inalterado. `src/integrations/supabase/client.ts` agora é um cliente
  próprio com a mesma API do supabase-js (`from().select().eq()`, `auth`, `rpc`,
  `functions.invoke`, `channel`), falando com `/api`.
- **Backend** (`server/src/`):
  - `query.ts`: traduz as consultas para SQL parametrizado (como o PostgREST)
  - `db.ts`: cada requisição roda com a role `anon`/`authenticated` e as claims do JWT,
    então **as policies de RLS originais continuam valendo** (`auth.uid()` funciona igual)
  - `auth.ts`: login com JWT + refresh token; aceita os hashes bcrypt importados do Supabase
  - `functions.ts`: porte das Edge Functions (`auth-with-cpf`, `reset-password`,
    `create-admin-user`, `tutorial-narration`, `users-api`)
  - `realtime.ts`: `postgres_changes` via triggers + `LISTEN/NOTIFY`, e broadcast, por WebSocket
- **Banco**: `server/sql/00_bootstrap.sql` emula o necessário do Supabase (roles, schema `auth`,
  `auth.uid()`); o schema do app vem de `server/sql/schema.sql` (dump da produção).

## Primeira configuração

Requisitos: Node 20+ e PostgreSQL 15+ (com `psql`/`pg_dump` no PATH ou `PG_BIN_DIR` no `.env`).

```sh
npm install
cp server/.env.example server/.env   # e preencha (instruções no arquivo)

npm run db:pull-schema   # extrai o schema da produção -> server/sql/schema.sql (commitar)
npm run db:migrate       # cria o banco local e aplica o schema
npm run db:import        # copia os dados (e usuários) da produção
```

Sem acesso à produção, `npm run db:migrate -- --tolerant` reconstrói um schema **aproximado** a
partir de `server/sql/migrations` (o histórico do Lovable tem lacunas: tabelas como `profiles`
foram criadas fora das migrations).

## Desenvolvimento

```sh
npm run dev        # Vite (http://localhost:8080) + API (http://localhost:3001)
```

## Produção / servidor interno

```sh
npm run build      # gera dist/
npm start          # a API também serve o dist/ na porta PORT
```

## Mudanças de schema

Crie um arquivo novo em `server/sql/migrations/` (ex.: `20261001120000_minha_mudanca.sql`) e rode
`npm run db:migrate`. Migrations já aplicadas ficam registradas em `_meta.migrations`.
Tabela nova que precise de realtime: `SELECT realtime.sync_triggers(ARRAY['nome_da_tabela']);`
(ou adicione-a à publicação `supabase_realtime` na migration).
