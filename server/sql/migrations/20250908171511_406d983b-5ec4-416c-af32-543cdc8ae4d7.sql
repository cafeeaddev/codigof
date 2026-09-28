-- Adicionar coluna para justificativa de recusa
ALTER TABLE public.fast_track_terms_responses 
ADD COLUMN decline_reason text;