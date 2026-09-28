-- Corrigir total_xp baseado no número real de missões completadas
UPDATE user_progress 
SET total_xp = (
  CASE 
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 4 THEN 100
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 3 THEN 75
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 2 THEN 50
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 1 THEN 25
    ELSE 0
  END
),
game_base_xp = (
  CASE 
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 4 THEN 100
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 3 THEN 75
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 2 THEN 50
    WHEN missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int = 1 THEN 25
    ELSE 0
  END
),
updated_at = NOW()
WHERE total_xp != (missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int) * 25
   OR game_base_xp != (missao_1_completed::int + missao_2_completed::int + missao_3_completed::int + missao_4_completed::int) * 25;