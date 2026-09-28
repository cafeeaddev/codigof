-- Migrate respostas column from text to jsonb to standardize with other mission tables
ALTER TABLE public.respostas 
ALTER COLUMN respostas TYPE jsonb USING respostas::jsonb;