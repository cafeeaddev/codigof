-- Corrigir area_id baseado no nome da área para todos os usuários
-- Mapeamento das áreas existentes

UPDATE public.profiles 
SET area_id = 'b1058cb7-f65c-471e-978a-d17ad442b9cf', updated_at = now()
WHERE area = 'AUDITORIA' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '377856a1-b600-4112-94c3-b0aceb8068cc', updated_at = now()
WHERE area = 'AUDITORIA - ADM' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '6c07e1f5-1ba0-4b7d-ba3f-2fa0ef860e20', updated_at = now()
WHERE area = 'BPO' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = 'd937d3f3-570d-429a-b40e-d1a2c4354aa7', updated_at = now()
WHERE area = 'COMEX' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '0101d553-13c0-4186-92ca-f1c616609df9', updated_at = now()
WHERE area = 'CONSULTORIA' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '35ca5105-691a-4776-884c-826975d26578', updated_at = now()
WHERE area = 'F.A.' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '5cb95c1e-4b44-476c-a926-9bc484d0ee10', updated_at = now()
WHERE area = 'TAX' AND area_id IS NULL;

-- Para outras áreas de backoffice, mapear para áreas correspondentes
UPDATE public.profiles 
SET area_id = 'b1058cb7-f65c-471e-978a-d17ad442b9cf', updated_at = now()
WHERE area = 'BACKOFFICE - AUDITORIA' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = 'd937d3f3-570d-429a-b40e-d1a2c4354aa7', updated_at = now()
WHERE area = 'BACKOFFICE - COMEX' AND area_id IS NULL;

UPDATE public.profiles 
SET area_id = '5cb95c1e-4b44-476c-a926-9bc484d0ee10', updated_at = now()
WHERE area = 'BACKOFFICE - TAX' AND area_id IS NULL;