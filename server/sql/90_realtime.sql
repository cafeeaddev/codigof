-- Substitui o Supabase Realtime: cada INSERT/UPDATE/DELETE nas tabelas
-- publicadas vira um NOTIFY no canal 'realtime', que o servidor repassa
-- aos clientes via WebSocket. Roda depois das migrations (idempotente).

CREATE SCHEMA IF NOT EXISTS realtime;

CREATE OR REPLACE FUNCTION realtime.notify_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  rec jsonb := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
  old_rec jsonb := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  payload text;
BEGIN
  payload := jsonb_build_object(
    'schema', TG_TABLE_SCHEMA,
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'commit_timestamp', now(),
    'record', rec,
    'old_record', old_rec
  )::text;

  -- NOTIFY aceita no máximo ~8000 bytes: manda só o id e o servidor relê a linha
  IF octet_length(payload) > 7800 THEN
    payload := jsonb_build_object(
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'type', TG_OP,
      'commit_timestamp', now(),
      'truncated', true,
      'record', CASE WHEN rec IS NOT NULL THEN jsonb_build_object('id', rec -> 'id') END,
      'old_record', CASE WHEN old_rec IS NOT NULL THEN jsonb_build_object('id', old_rec -> 'id') END
    )::text;
  END IF;

  PERFORM pg_notify('realtime', payload);
  RETURN NULL;
END $$;

-- Anexa o trigger a todas as tabelas da publicação supabase_realtime
-- e às tabelas extras informadas (assinadas pelo frontend).
CREATE OR REPLACE FUNCTION realtime.sync_triggers(extra_tables text[] DEFAULT '{}')
RETURNS SETOF text LANGUAGE plpgsql AS $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
    UNION
    SELECT c.relname FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY(extra_tables)
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS realtime_notify ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER realtime_notify AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION realtime.notify_change()', t);
    RETURN NEXT t;
  END LOOP;
END $$;
