-- Create user roles table with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create game events table  
CREATE TABLE public.game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user sessions table
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_number integer NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration_seconds integer,
  last_activity timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user attempts table
CREATE TABLE public.user_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  mission_number integer NOT NULL,
  responses jsonb NOT NULL,
  duration_seconds integer,
  xp_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for game_events  
CREATE POLICY "Admins can manage game events" ON public.game_events
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view game events" ON public.game_events
  FOR SELECT USING (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions  
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_attempts
CREATE POLICY "Users can manage their own attempts" ON public.user_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.user_attempts
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to calculate bonus XP
CREATE OR REPLACE FUNCTION public.calculate_bonus_xp()
RETURNS integer AS $$
DECLARE
  game_start_date date;
  days_since_start integer;
BEGIN
  -- Get the most recent game start date
  SELECT (event_data->>'start_date')::date INTO game_start_date
  FROM public.game_events
  WHERE event_type = 'game_start_date'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no start date set, return 0
  IF game_start_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate days since start
  days_since_start := CURRENT_DATE - game_start_date;
  
  -- Return bonus based on days
  IF days_since_start = 0 THEN
    RETURN 150; -- Same day
  ELSIF days_since_start = 1 THEN
    RETURN 100; -- 1 day after
  ELSIF days_since_start = 2 THEN
    RETURN 100; -- 2 days after
  ELSE
    RETURN 0; -- No bonus after 3+ days
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;