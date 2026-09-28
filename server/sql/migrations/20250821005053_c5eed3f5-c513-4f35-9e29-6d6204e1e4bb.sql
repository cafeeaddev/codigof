-- Remove any existing default policies that might allow public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Review and ensure our existing policies are correct and secure
-- The existing policies should be:
-- 1. Users can view their own profile (authenticated only)
-- 2. Admins can view all profiles (authenticated admins only)
-- 3. Users can insert/update their own profile (authenticated only)
-- 4. Special policy for linking profiles by email when user_id is NULL

-- Let's check that we don't have any overly permissive policies
-- by recreating the secure policies to ensure they're correct

-- Drop and recreate policies to ensure they're secure
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can link profile by email" ON public.profiles;

-- Recreate secure policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can link profile by email when user_id is NULL" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING ((user_id IS NULL) AND (auth.email() = email))
WITH CHECK (user_id = auth.uid());

-- Ensure no public access is allowed
-- RLS is enabled and only authenticated users with proper conditions can access data