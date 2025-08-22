-- Corrigir especificamente o tempo da Andreia com o user_id correto
UPDATE user_progress 
SET total_play_time = 120, -- 2 minutos conforme relatado pelo usuário
    session_start_time = now(),
    last_saved_at = now(),
    updated_at = now()
WHERE user_id = (
  SELECT user_id FROM profiles 
  WHERE nome = 'Andreia' AND email = 'andreia.goeten@forvismazars.com' 
  AND user_id IS NOT NULL
  LIMIT 1
);