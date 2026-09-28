-- Corrigir current_position para usuários que completaram a missão 5 mas têm position incorreto
UPDATE user_progress 
SET current_position = 'extra_mission_completed' 
WHERE missao_5_completed = true 
  AND (current_position = 'hero' OR current_position NOT LIKE 'extra_mission%');