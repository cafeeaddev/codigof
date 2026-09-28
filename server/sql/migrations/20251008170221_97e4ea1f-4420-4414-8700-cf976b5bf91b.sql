-- Fix manual_xp_adjustments to use user_id based access control
-- This addresses MISSING_RLS_PROTECTION security finding

-- Add user_id column if it doesn't exist
ALTER TABLE public.manual_xp_adjustments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_manual_xp_adjustments_user_id 
ON public.manual_xp_adjustments(user_id);

-- Drop old email-based policies
DROP POLICY IF EXISTS "Users can view their own manual XP adjustments" ON public.manual_xp_adjustments;
DROP POLICY IF EXISTS "Users can delete their own manual XP adjustments" ON public.manual_xp_adjustments;

-- Create new user_id-based policies
CREATE POLICY "Users can view their manual XP adjustments by user_id"
ON public.manual_xp_adjustments
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can delete XP adjustments
-- Users should not be able to delete their own adjustments
CREATE POLICY "Only admins can delete manual XP adjustments"
ON public.manual_xp_adjustments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));