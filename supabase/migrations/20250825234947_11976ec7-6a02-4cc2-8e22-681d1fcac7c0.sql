-- Update existing users who have submitted fast track responses but don't have missao_5_completed set to true
UPDATE user_progress 
SET missao_5_completed = true, updated_at = now()
WHERE user_id IN (
  SELECT user_id 
  FROM fast_track_responses 
  WHERE user_id IS NOT NULL
) 
AND (missao_5_completed IS NULL OR missao_5_completed = false);