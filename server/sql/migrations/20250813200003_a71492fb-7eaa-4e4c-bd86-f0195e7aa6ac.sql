-- Corrigir a pergunta 711 para ter o target_area_ids correto da área RISK&QUALITY
UPDATE mission4_questions 
SET target_area_ids = ARRAY['c4febbb3-608a-4083-b623-28dddcf133e0']
WHERE id = 711;