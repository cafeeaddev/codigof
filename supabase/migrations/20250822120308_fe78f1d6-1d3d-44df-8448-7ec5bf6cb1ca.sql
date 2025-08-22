-- Fix security warnings from the previous migration

-- 1. Fix function search path for mask_cpf function
CREATE OR REPLACE FUNCTION public.mask_cpf(cpf_value text)
RETURNS text AS $$
BEGIN
  -- Return masked CPF: XXX.XXX.XXX-XX becomes XXX.XXX.***-**
  IF cpf_value IS NULL OR length(cpf_value) < 11 THEN
    RETURN cpf_value;
  END IF;
  
  -- For formatted CPF (XXX.XXX.XXX-XX)
  IF position('.' in cpf_value) > 0 THEN
    RETURN substring(cpf_value from 1 for 7) || '***-**';
  END IF;
  
  -- For unformatted CPF (XXXXXXXXXXX)
  RETURN substring(cpf_value from 1 for 7) || '****';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix function search path for log_profile_modification function
CREATE OR REPLACE FUNCTION public.log_profile_modification()
RETURNS trigger AS $$
BEGIN
  -- Log modifications to profile data
  INSERT INTO public.profile_audit_log (
    user_id, 
    accessed_profile_id, 
    action_type,
    accessed_at
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Drop the problematic security definer view and create a standard view
DROP VIEW IF EXISTS public.profiles_secure_view;

-- Create standard view without SECURITY DEFINER to avoid the security warning
CREATE VIEW public.profiles_secure_view AS
SELECT 
  id,
  user_id,
  nome,
  email,
  public.mask_cpf(cpf) as cpf_masked,
  cargo,
  area,
  area_id,
  created_at,
  updated_at
FROM public.profiles;

-- 4. Enable RLS on the view properly
ALTER TABLE public.profiles_secure_view ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the secure view
CREATE POLICY "Admins can view secure profile view"
ON public.profiles_secure_view
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own secure profile"
ON public.profiles_secure_view
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);