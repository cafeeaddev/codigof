-- Objetos que já existiam no projeto Supabase antes da primeira migration
-- versionada em supabase/migrations, e dos quais as migrations dependem.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
