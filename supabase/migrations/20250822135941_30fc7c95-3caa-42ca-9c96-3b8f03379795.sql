-- Corrigir dados de tempo da Andreia
UPDATE user_progress 
SET total_play_time = 120, -- 2 minutos em segundos
    session_start_time = now(),
    last_saved_at = now(),
    updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM profiles 
  WHERE nome = 'Andreia' AND email = 'andreia.goeten@forvismazars.com'
);

-- Aplicar validação e correção para todos os usuários com tempo excessivo
UPDATE user_progress 
SET total_play_time = CASE 
  WHEN total_play_time > 86400 THEN 0  -- Mais de 24 horas = reset
  WHEN total_play_time < 0 THEN 0      -- Tempo negativo = reset
  ELSE total_play_time 
END,
session_start_time = now(),
last_saved_at = now(),
updated_at = now()
WHERE total_play_time > 86400 OR total_play_time < 0;