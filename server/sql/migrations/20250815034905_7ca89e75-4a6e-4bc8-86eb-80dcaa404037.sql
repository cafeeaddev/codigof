-- Add final_score column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN final_score DECIMAL(10,2);