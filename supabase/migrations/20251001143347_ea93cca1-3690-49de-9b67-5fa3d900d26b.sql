-- Allow users to view and delete their own manual XP adjustments
-- This enables the WelcomeScreen hook to fetch and apply manual XP safely

-- Policy: Users can view their own manual XP adjustments
CREATE POLICY "Users can view their own manual XP adjustments"
ON public.manual_xp_adjustments
FOR SELECT
USING (auth.email() = email);

-- Policy: Users can delete their own manual XP adjustments after application
CREATE POLICY "Users can delete their own manual XP adjustments"
ON public.manual_xp_adjustments
FOR DELETE
USING (auth.email() = email);