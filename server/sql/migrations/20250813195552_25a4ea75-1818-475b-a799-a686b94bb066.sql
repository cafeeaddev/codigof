-- Remover a coluna target_areas que se tornou desnecessária
-- Agora usamos apenas target_area_ids que referencia a tabela areas por ID
-- Isso elimina redundância e mantém consistência referencial

ALTER TABLE mission4_questions 
DROP COLUMN target_areas;