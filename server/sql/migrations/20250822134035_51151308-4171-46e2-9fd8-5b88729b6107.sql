-- Remove the insecure profiles_secure_view
-- This view was created without proper RLS policies and could expose sensitive data
DROP VIEW IF EXISTS public.profiles_secure_view;

-- The secure alternative is to use the existing get_masked_profiles() function
-- which properly checks admin privileges before returning any data.
-- This function already exists and is properly secured.

-- Add a comment to document the security decision
COMMENT ON FUNCTION public.get_masked_profiles() IS 
'Secure function to get masked profile data. Only accessible by admins. 
Replaces the insecure profiles_secure_view that was removed for security reasons.';