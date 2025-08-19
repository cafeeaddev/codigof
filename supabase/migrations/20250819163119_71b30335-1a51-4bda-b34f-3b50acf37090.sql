-- Create game_settings table for storing game configuration
CREATE TABLE public.game_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for game_settings
CREATE POLICY "Everyone can view game settings" 
ON public.game_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify game settings" 
ON public.game_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add time_bonus_xp field to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN time_bonus_xp INTEGER DEFAULT 0;

-- Create trigger for automatic timestamp updates on game_settings
CREATE TRIGGER update_game_settings_updated_at
BEFORE UPDATE ON public.game_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial game settings record (admin will update this)
INSERT INTO public.game_settings (game_start_date, created_by) 
VALUES (CURRENT_DATE, (SELECT id FROM auth.users LIMIT 1));