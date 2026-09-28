-- Adicionar constraint única na coluna user_id para permitir upsert
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id);