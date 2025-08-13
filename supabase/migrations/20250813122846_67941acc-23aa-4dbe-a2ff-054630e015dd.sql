-- Fix critical privilege escalation in user_roles table
-- Add missing RLS policies to prevent unauthorized role modifications

-- Policy to prevent unauthorized role updates
CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  user_id = auth.uid()
);

-- Policy to prevent unauthorized role deletions
CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy to prevent unauthorized role insertions
CREATE POLICY "Only admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix database functions security by setting secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Só cria perfil se não tiver a flag skip_profile_creation
  -- e se não existir um perfil com o mesmo email
  IF (NEW.raw_user_meta_data ->> 'skip_profile_creation') IS NULL 
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = NEW.email) THEN
    
    INSERT INTO public.profiles (
      user_id, 
      nome, 
      email, 
      cpf
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data ->> 'nome', 
      NEW.email,
      NEW.raw_user_meta_data ->> 'cpf'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;