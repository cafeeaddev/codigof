-- Add Mission 5 fields to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN missao_5_completed boolean DEFAULT false,
ADD COLUMN missao_5_current_question integer DEFAULT 0,
ADD COLUMN missao_5_answers jsonb DEFAULT '{}'::jsonb;

-- Create mission5_settings table for admin control
CREATE TABLE public.mission5_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on mission5_settings
ALTER TABLE public.mission5_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for mission5_settings
CREATE POLICY "Everyone can view mission5 settings" 
ON public.mission5_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify mission5 settings" 
ON public.mission5_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create respostas_missao5 table
CREATE TABLE public.respostas_missao5 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  nome text NOT NULL,
  email text NOT NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on respostas_missao5
ALTER TABLE public.respostas_missao5 ENABLE ROW LEVEL SECURITY;

-- Create policies for respostas_missao5
CREATE POLICY "Admins can view all mission 5 responses" 
ON public.respostas_missao5 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own mission 5 responses" 
ON public.respostas_missao5 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission 5 responses" 
ON public.respostas_missao5 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create fast_track_responses table for detailed analytics
CREATE TABLE public.fast_track_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  accepted_terms boolean NOT NULL,
  interest_level text,
  time_commitment text,
  main_objective text,
  other_objective text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on fast_track_responses
ALTER TABLE public.fast_track_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for fast_track_responses
CREATE POLICY "Admins can view all fast track responses" 
ON public.fast_track_responses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own fast track responses" 
ON public.fast_track_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_mission5_settings_updated_at
BEFORE UPDATE ON public.mission5_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_respostas_missao5_updated_at
BEFORE UPDATE ON public.respostas_missao5
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default mission5 settings
INSERT INTO public.mission5_settings (release_date, is_active, created_by)
VALUES (CURRENT_DATE + INTERVAL '7 days', false, auth.uid());