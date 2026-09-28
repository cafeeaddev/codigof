-- Fix security vulnerability: Ensure profiles table is only accessible to authenticated users
-- The current policies use role 'public' which allows unauthenticated access

-- First, drop existing policies that use 'public' role
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Vincular profile pelo email quando sem user_id" ON public.profiles;

-- Create new secure policies that explicitly require authentication
-- Admin can view all profiles (only when authenticated)
CREATE POLICY "Authenticated admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own profile (only when authenticated)
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile (only when authenticated)
CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile (only when authenticated)
CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Special policy to link profile by email when user_id is null (only when authenticated)
-- This is needed for the authentication flow
CREATE POLICY "Authenticated users can link profile by email" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING ((user_id IS NULL) AND (auth.email() = email))
WITH CHECK (user_id = auth.uid());

-- Verify that RLS is enabled (it should already be, but let's be explicit)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;