-- Corrigir a estrutura das perguntas da Missão 4
-- Remover duplicações e padronizar o sistema

-- Primeiro, verificar se existe pergunta 710 para AUDITORIA (star-rating)
-- Se não existir, vamos manter a pergunta 19 como star-rating para AUDITORIA

-- Para MARKETING, manter pergunta 20 como star-rating específica

-- Atualizar target_area_ids para as perguntas específicas usando os IDs das áreas
-- AUDITORIA: b1058cb7-f65c-471e-978a-d17ad442b9cf  
-- MARKETING: 5a1e3723-6f4f-426a-8d0a-e9c1d8e26add

-- As perguntas universais (1-9) devem ter target_area_ids vazio ou null
UPDATE mission4_questions 
SET target_area_ids = NULL
WHERE id BETWEEN 1 AND 9;

-- Verificar se existem perguntas duplicadas entre 700-715 e removê-las se necessário
-- Estas parecem ser duplicações das perguntas 1-9 para AUDITORIA

-- Remover perguntas duplicadas se existirem
DELETE FROM mission4_questions 
WHERE id BETWEEN 700 AND 715 
AND id NOT IN (710, 711, 712);