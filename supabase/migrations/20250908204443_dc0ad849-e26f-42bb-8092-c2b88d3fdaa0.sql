-- Add missing RLS policies for fast_track_responses table
CREATE POLICY "Users can view their own fast track responses"
ON public.fast_track_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fast track responses"
ON public.fast_track_responses
FOR UPDATE
USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate user_progress entries
ALTER TABLE public.user_progress
ADD CONSTRAINT unique_user_progress_per_user UNIQUE (user_id);

-- Create trigger to prevent duplicate user_progress inserts
CREATE OR REPLACE FUNCTION public.prevent_duplicate_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already has progress
  IF EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = NEW.user_id) THEN
    -- Update existing record instead of inserting
    UPDATE public.user_progress 
    SET updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NULL; -- Cancel the insert
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_user_progress
  BEFORE INSERT ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_user_progress();