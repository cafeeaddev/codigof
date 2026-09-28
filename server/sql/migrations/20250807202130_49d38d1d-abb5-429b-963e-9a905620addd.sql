-- Create table for mission 2 responses
CREATE TABLE public.respostas_missao2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  respostas JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.respostas_missao2 ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Anyone can insert mission 2 responses" 
ON public.respostas_missao2 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view mission 2 responses" 
ON public.respostas_missao2 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_respostas_missao2_updated_at
BEFORE UPDATE ON public.respostas_missao2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();