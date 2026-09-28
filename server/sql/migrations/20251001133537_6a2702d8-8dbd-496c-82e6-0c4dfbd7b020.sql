-- Converter todos os emails para minúsculo na tabela manual_xp_adjustments
UPDATE public.manual_xp_adjustments 
SET email = LOWER(email)
WHERE email != LOWER(email);