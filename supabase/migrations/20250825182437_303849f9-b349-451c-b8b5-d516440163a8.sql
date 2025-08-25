-- Correção para usuários com XP zerado devido ao bug
-- Identifica usuários que completaram o jogo mas têm XP zerado/corrompido
UPDATE user_progress 
SET 
  game_base_xp = CASE 
    WHEN missao_1_completed AND missao_2_completed AND missao_3_completed AND missao_4_completed THEN 100
    WHEN missao_1_completed AND missao_2_completed AND missao_3_completed THEN 75
    WHEN missao_1_completed AND missao_2_completed THEN 50
    WHEN missao_1_completed THEN 25
    ELSE 0
  END,
  total_xp = CASE 
    WHEN missao_1_completed AND missao_2_completed AND missao_3_completed AND missao_4_completed THEN 100 + COALESCE(time_bonus_xp, 0)
    WHEN missao_1_completed AND missao_2_completed AND missao_3_completed THEN 75 + COALESCE(time_bonus_xp, 0)
    WHEN missao_1_completed AND missao_2_completed THEN 50 + COALESCE(time_bonus_xp, 0)
    WHEN missao_1_completed THEN 25 + COALESCE(time_bonus_xp, 0)
    ELSE COALESCE(time_bonus_xp, 0)
  END
WHERE 
  (final_score IS NOT NULL AND (game_base_xp IS NULL OR game_base_xp = 0))
  OR (total_xp = 0 AND (missao_1_completed OR missao_2_completed OR missao_3_completed OR missao_4_completed));