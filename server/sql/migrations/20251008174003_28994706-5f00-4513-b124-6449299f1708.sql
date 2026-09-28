-- Fix Profile Hijacking: Remove email-based linking policy and secure orphaned profiles
-- This prevents attackers from hijacking profiles that don't have user_id set

-- Drop the vulnerable policy that allows linking by email
DROP POLICY IF EXISTS "Users can link profile by email when user_id is NULL" ON public.profiles;

-- Create audit table for tracking hijacking attempts
CREATE TABLE IF NOT EXISTS public.profile_link_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_user_id UUID,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false
);

ALTER TABLE public.profile_link_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view link attempts
CREATE POLICY "Admins can view profile link attempts"
  ON public.profile_link_attempts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add CPF verification requirement for profile creation
-- This ensures only users with correct CPF can create profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS cpf_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_at TIMESTAMP WITH TIME ZONE;

-- Create secure profile linking function that requires CPF verification
CREATE OR REPLACE FUNCTION public.link_profile_with_cpf_verification(
  _email TEXT,
  _cpf TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_record RECORD;
  _current_user_id UUID;
BEGIN
  _current_user_id := auth.uid();
  
  -- Check if user already has a profile
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _current_user_id) THEN
    RAISE EXCEPTION 'User already has a linked profile';
  END IF;
  
  -- Find orphaned profile matching email AND CPF
  SELECT * INTO _profile_record
  FROM public.profiles
  WHERE email = _email
    AND cpf = _cpf
    AND user_id IS NULL
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.profile_link_attempts (email, attempted_user_id, success)
    VALUES (_email, _current_user_id, false);
    
    RETURN false;
  END IF;
  
  -- Link the profile
  UPDATE public.profiles
  SET user_id = _current_user_id,
      cpf_verified = true,
      linked_at = now(),
      updated_at = now()
  WHERE id = _profile_record.id;
  
  -- Log successful link
  INSERT INTO public.profile_link_attempts (email, attempted_user_id, success)
  VALUES (_email, _current_user_id, true);
  
  RETURN true;
END;
$$;

-- Add index for orphaned profiles query (admin use)
CREATE INDEX IF NOT EXISTS idx_profiles_orphaned 
  ON public.profiles(email, user_id) 
  WHERE user_id IS NULL;