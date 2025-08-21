-- Fix security warnings: Set search_path for existing functions

-- Fix the has_role function to have immutable search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix the handle_new_user function to have immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix the update_updated_at_column function to have immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;