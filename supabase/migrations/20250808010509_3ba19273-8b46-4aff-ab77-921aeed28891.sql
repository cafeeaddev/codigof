-- Create admin role for the first user (replace with actual user ID)
-- You'll need to replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add trigger for profiles table updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for user_sessions table updated_at  
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for user_attempts table updated_at
CREATE TRIGGER update_user_attempts_updated_at
BEFORE UPDATE ON public.user_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for game_events table updated_at
CREATE TRIGGER update_game_events_updated_at
BEFORE UPDATE ON public.game_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();