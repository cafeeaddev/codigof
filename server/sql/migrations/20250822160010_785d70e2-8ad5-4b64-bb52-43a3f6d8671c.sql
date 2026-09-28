-- Add extra mission release date column to game_settings table
ALTER TABLE public.game_settings 
ADD COLUMN extra_mission_release_date DATE;