-- Atualizar area_id baseado no mapeamento entre o campo area da profiles e name da areas
UPDATE public.profiles 
SET area_id = areas.id
FROM public.areas 
WHERE profiles.area_id IS NULL 
  AND profiles.area IS NOT NULL 
  AND profiles.area = areas.name;

-- Log da atualização
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Atualizados % registros de profiles com area_id mapeado', updated_count;
END $$;