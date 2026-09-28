-- Emula o mínimo do ambiente Supabase num PostgreSQL puro, para que as
-- migrations em supabase/migrations rodem sem alterações.
-- Idempotente: pode ser executado mais de uma vez.

-- Roles usadas pelas policies de RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- Schema auth
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS auth.users (
  instance_id uuid,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aud varchar(255) DEFAULT 'authenticated',
  role varchar(255) DEFAULT 'authenticated',
  email varchar(255),
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb DEFAULT '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  banned_until timestamptz,
  deleted_at timestamptz,
  is_anonymous boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON auth.users (lower(email));

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens (user_id);

-- Mesmas funções do Supabase: leem as claims do JWT que o servidor
-- injeta via set_config('request.jwt.claims', ...) em cada transação.
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ), ''
  )::uuid
$$;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT nullif(
    coalesce(
      current_setting('request.jwt.claim.role', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
    ), ''
  )::text
$$;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT nullif(
    coalesce(
      current_setting('request.jwt.claim.email', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
    ), ''
  )::text
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO service_role;

-- Publicação usada pelas migrations (ALTER PUBLICATION supabase_realtime ADD TABLE ...).
-- Aqui ela só serve de registro: o servidor anexa triggers de NOTIFY às tabelas dela.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Controle das migrations já aplicadas
CREATE SCHEMA IF NOT EXISTS _meta;
CREATE TABLE IF NOT EXISTS _meta.migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
