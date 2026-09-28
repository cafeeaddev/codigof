-- Add database constraints to prevent absurd time values
-- This migration adds constraints to user_progress table to prevent data corruption

-- Add constraint to ensure total_play_time is reasonable (max 24 hours = 86400 seconds)
ALTER TABLE public.user_progress 
ADD CONSTRAINT check_reasonable_play_time 
CHECK (total_play_time >= 0 AND total_play_time <= 86400);

-- Add constraint to ensure session times are reasonable 
ALTER TABLE public.user_progress
ADD CONSTRAINT check_session_start_time_not_future
CHECK (session_start_time <= NOW() + INTERVAL '1 hour');

-- Create function to fix corrupted time data
CREATE OR REPLACE FUNCTION public.fix_corrupted_time_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected_rows INTEGER := 0;
BEGIN
  -- Reset any absurd play times (more than 8 hours) to 0
  UPDATE public.user_progress 
  SET total_play_time = 0,
      updated_at = NOW()
  WHERE total_play_time > 28800; -- 8 hours in seconds
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the fix
  RAISE NOTICE 'Fixed % user records with corrupted time data', affected_rows;
  
  RETURN affected_rows;
END;
$$;

-- Run the fix function immediately
SELECT public.fix_corrupted_time_data();