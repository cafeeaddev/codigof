-- Fix absurd play times in user_progress table
-- Reset any total_play_time values that are unreasonably high (more than 24 hours = 86400 seconds)
UPDATE user_progress 
SET total_play_time = 0,
    session_start_time = now(),
    last_saved_at = now()
WHERE total_play_time > 86400;

-- Add a comment to track this fix
COMMENT ON COLUMN user_progress.total_play_time IS 'Total play time in seconds. Maximum reasonable value enforced by application logic.';