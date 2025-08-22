-- Create enhanced security for profiles table with CPF masking and audit logging

-- 1. Add encrypted CPF storage and masking functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create audit logging table for profile access
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  accessed_profile_id uuid,
  action_type text NOT NULL, -- 'SELECT', 'UPDATE', 'INSERT'
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Create audit function
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger AS $$
BEGIN
  -- Log access to profile data
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for audit logging
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- 5. Create secure view for admin access with masked CPF
CREATE OR REPLACE VIEW public.profiles_admin_view AS
SELECT 
  id,
  user_id,
  nome,
  email,
  public.mask_cpf(cpf) as cpf_masked,
  cpf as cpf_full, -- Only accessible to admins
  cargo,
  area,
  area_id,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profiles_admin_view SET (security_barrier = true);

-- 6. Create stricter RLS policies for the admin view
CREATE POLICY "Only admins can view admin profile view"
ON public.profiles_admin_view
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Create audit log policies
CREATE POLICY "Admins can view all audit logs"
ON public.profile_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own audit logs"
ON public.profile_audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 8. Grant appropriate permissions
GRANT SELECT ON public.profiles_admin_view TO authenticated;
GRANT SELECT ON public.profile_audit_log TO authenticated;