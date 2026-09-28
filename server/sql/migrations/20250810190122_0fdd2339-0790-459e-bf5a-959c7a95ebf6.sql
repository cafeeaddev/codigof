-- Fix existing users who completed Mission 4 but aren't marked as completed
-- Update user_progress for users who have mission 4 responses but aren't marked as completed

UPDATE public.user_progress 
SET 
  missao_4_completed = true,
  total_xp = COALESCE(total_xp, 0) + 25,
  updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT user_id 
  FROM public.respostas_missao4 
  WHERE user_id IS NOT NULL
) 
AND (missao_4_completed IS NULL OR missao_4_completed = false);