-- Add columns to track game progress and time spent
ALTER TABLE public.user_progress 
ADD COLUMN current_position TEXT DEFAULT 'inicio',
ADD COLUMN total_play_time INTEGER DEFAULT 0, -- in seconds
ADD COLUMN session_start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for better performance on frequent updates
CREATE INDEX idx_user_progress_user_id_last_saved ON public.user_progress(user_id, last_saved_at);

-- Update the existing trigger to also update last_saved_at
CREATE OR REPLACE FUNCTION public.update_user_progress_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_saved_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for user_progress table
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_progress_timestamps();