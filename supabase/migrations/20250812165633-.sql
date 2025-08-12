-- Fix RLS on profiles: remove public SELECT, add admin SELECT and safe self-access by email when not linked

-- Ensure table has RLS (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1) Drop overly permissive policy
DROP POLICY IF EXISTS "Permitir consulta para login" ON public.profiles;

-- 2) Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3) Allow users to view their own profile even before linking user_id (by matching email)
CREATE POLICY "Users can view their profile by email when not linked"
ON public.profiles
FOR SELECT
USING ((user_id IS NULL) AND (auth.email() = email));