-- Add columns to track game progress and time spent
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS current_position TEXT DEFAULT 'inicio',
ADD COLUMN IF NOT EXISTS total_play_time INTEGER DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS session_start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for better performance on frequent updates
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_last_saved ON public.user_progress(user_id, last_saved_at);