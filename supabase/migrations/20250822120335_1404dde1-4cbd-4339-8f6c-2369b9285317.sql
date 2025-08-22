-- Fix security warnings and complete security enhancement

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

-- 3. Create a secure function to get masked profiles (instead of view)
CREATE OR REPLACE FUNCTION public.get_masked_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  nome text,
  email text,
  cpf_masked text,
  cargo text,
  area text,
  area_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  -- Only admins can access this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.nome,
    p.email,
    public.mask_cpf(p.cpf) as cpf_masked,
    p.cargo,
    p.area,
    p.area_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;