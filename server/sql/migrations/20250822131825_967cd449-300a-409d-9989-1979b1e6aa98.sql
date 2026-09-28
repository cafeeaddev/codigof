-- Desativar a questão 4 da Missão 3 (ID 63)
UPDATE questions 
SET is_active = false, updated_at = now()
WHERE id = 63 AND mission_number = 3;

-- Reordenar as questões restantes da Missão 3
-- A questão 5 (order_position = 5) vira questão 4 (order_position = 4)
UPDATE questions 
SET order_position = 4, updated_at = now()
WHERE mission_number = 3 AND order_position = 5 AND is_active = true;