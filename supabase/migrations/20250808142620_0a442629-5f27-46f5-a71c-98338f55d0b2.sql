-- Primeiro, vamos verificar se existe algum trigger na tabela auth.users
-- que tenta criar automaticamente profiles

-- Desabilitar qualquer trigger existente que possa estar causando problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar uma função que só cria perfil se não existir um com o mesmo email
-- e se não tiver a flag skip_profile_creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
$$;

-- Recriar o trigger com a nova função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();