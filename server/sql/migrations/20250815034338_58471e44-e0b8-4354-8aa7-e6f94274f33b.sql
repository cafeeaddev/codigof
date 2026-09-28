-- Add final_profile column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN final_profile TEXT;