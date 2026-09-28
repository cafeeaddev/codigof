-- Fix security vulnerability: Remove policy that allows viewing unlinked profiles by email
-- This prevents unauthorized access to personal data (emails, names, CPF numbers)

DROP POLICY "Users can view their profile by email when not linked" ON public.profiles;

-- The remaining policies ensure secure access:
-- 1. "Admins can view all profiles" - Only admins can view all profiles  
-- 2. "Usuários podem ver seu próprio perfil" - Users can only see their own linked profile (user_id = auth.uid())
-- 3. "Vincular profile pelo email quando sem user_id" - Allows linking unlinked profiles (UPDATE only, not SELECT)
-- 4. "Usuários podem atualizar seu próprio perfil" - Users can update their own profile
-- 5. "Usuários podem inserir seu próprio perfil" - Users can insert their own profile