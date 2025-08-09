-- Migrar respostas da Missão 2 da tabela respostas para respostas_missao2
INSERT INTO respostas_missao2 (nome, email, respostas, created_at)
SELECT 
  nome, 
  email, 
  CASE 
    WHEN jsonb_typeof(respostas::jsonb) = 'object' AND respostas::jsonb ? 'missao'
    THEN (respostas::jsonb -> 'data')
    ELSE respostas::jsonb
  END as respostas,
  now() as created_at
FROM respostas 
WHERE email = 'nawana.santos@forvismazars.com' 
  AND (
    (jsonb_typeof(respostas::jsonb) = 'object' AND respostas::jsonb ->> 'missao' = '2')
    OR (jsonb_typeof(respostas::jsonb) = 'array' AND jsonb_array_length(respostas::jsonb) = 3)
  )
ORDER BY id DESC 
LIMIT 1;

-- Migrar respostas da Missão 3 da tabela respostas para respostas_missao3  
INSERT INTO respostas_missao3 (nome, email, respostas, created_at)
SELECT 
  nome, 
  email, 
  CASE 
    WHEN jsonb_typeof(respostas::jsonb) = 'object' AND respostas::jsonb ? 'missao'
    THEN (respostas::jsonb -> 'data')
    ELSE respostas::jsonb
  END as respostas,
  now() as created_at
FROM respostas 
WHERE email = 'nawana.santos@forvismazars.com' 
  AND (
    (jsonb_typeof(respostas::jsonb) = 'object' AND respostas::jsonb ->> 'missao' = '3')
    OR (jsonb_typeof(respostas::jsonb) = 'array' AND jsonb_array_length(respostas::jsonb) = 5)
  )
ORDER BY id DESC 
LIMIT 1;