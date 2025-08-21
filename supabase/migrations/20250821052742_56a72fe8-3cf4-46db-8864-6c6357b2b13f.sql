-- Fix default values for mission current_question columns to start at 0 instead of 1
-- This aligns the database defaults with frontend logic (0-based indexing)

-- Update default values for all mission current_question columns
ALTER TABLE user_progress 
ALTER COLUMN missao_1_current_question SET DEFAULT 0,
ALTER COLUMN missao_2_current_question SET DEFAULT 0,
ALTER COLUMN missao_3_current_question SET DEFAULT 0,
ALTER COLUMN missao_4_current_question SET DEFAULT 0;

-- Update existing records that have value 1 (which should be 0 for first question)
-- Only update if the mission is not completed yet
UPDATE user_progress 
SET 
  missao_1_current_question = 0
WHERE missao_1_current_question = 1 
  AND (missao_1_completed IS FALSE OR missao_1_completed IS NULL);

UPDATE user_progress 
SET 
  missao_2_current_question = 0
WHERE missao_2_current_question = 1 
  AND (missao_2_completed IS FALSE OR missao_2_completed IS NULL);

UPDATE user_progress 
SET 
  missao_3_current_question = 0
WHERE missao_3_current_question = 1 
  AND (missao_3_completed IS FALSE OR missao_3_completed IS NULL);

UPDATE user_progress 
SET 
  missao_4_current_question = 0
WHERE missao_4_current_question = 1 
  AND (missao_4_completed IS FALSE OR missao_4_completed IS NULL);