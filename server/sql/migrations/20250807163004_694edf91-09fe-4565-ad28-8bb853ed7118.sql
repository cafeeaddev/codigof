-- Create table for quiz responses
CREATE TABLE public.respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quiz_id TEXT NOT NULL,
  pergunta_numero INTEGER NOT NULL,
  resposta TEXT NOT NULL,
  pontuacao DECIMAL(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own quiz responses" 
ON public.respostas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz responses" 
ON public.respostas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz responses" 
ON public.respostas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_respostas_updated_at
BEFORE UPDATE ON public.respostas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_respostas_user_quiz ON public.respostas(user_id, quiz_id);