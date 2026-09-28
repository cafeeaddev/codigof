-- Create table for tracking user progress and XP
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  missao_1_completed BOOLEAN DEFAULT FALSE,
  missao_2_completed BOOLEAN DEFAULT FALSE,
  missao_3_completed BOOLEAN DEFAULT FALSE,
  missao_4_completed BOOLEAN DEFAULT FALSE,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create table for mission 4 responses
CREATE TABLE public.respostas_missao4 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  respostas JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.respostas_missao4 ENABLE ROW LEVEL SECURITY;

-- Create policies for mission 4 responses
CREATE POLICY "Anyone can insert mission 4 responses" 
ON public.respostas_missao4 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view mission 4 responses" 
ON public.respostas_missao4 
FOR SELECT 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_respostas_missao4_updated_at
BEFORE UPDATE ON public.respostas_missao4
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();