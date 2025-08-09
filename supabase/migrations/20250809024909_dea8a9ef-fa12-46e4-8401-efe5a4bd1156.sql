-- Add user_id columns to all response tables with foreign key constraints
ALTER TABLE public.respostas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_missao2 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_missao3 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.respostas_missao4 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance on joins
CREATE INDEX idx_respostas_user_id ON public.respostas(user_id);
CREATE INDEX idx_respostas_missao2_user_id ON public.respostas_missao2(user_id);
CREATE INDEX idx_respostas_missao3_user_id ON public.respostas_missao3(user_id);
CREATE INDEX idx_respostas_missao4_user_id ON public.respostas_missao4(user_id);

-- Update RLS policies to use user_id instead of email/name comparisons

-- Drop old policies
DROP POLICY IF EXISTS "Permitir inserção pública de respostas" ON public.respostas;
DROP POLICY IF EXISTS "Permitir visualização pública de respostas" ON public.respostas;
DROP POLICY IF EXISTS "Anyone can insert mission 2 responses" ON public.respostas_missao2;
DROP POLICY IF EXISTS "Anyone can view mission 2 responses" ON public.respostas_missao2;
DROP POLICY IF EXISTS "Anyone can insert mission 3 responses" ON public.respostas_missao3;
DROP POLICY IF EXISTS "Anyone can view mission 3 responses" ON public.respostas_missao3;
DROP POLICY IF EXISTS "Anyone can insert mission 4 responses" ON public.respostas_missao4;
DROP POLICY IF EXISTS "Anyone can view mission 4 responses" ON public.respostas_missao4;

-- Create new secure RLS policies using user_id

-- Policies for respostas (mission 1)
CREATE POLICY "Users can insert their own responses" 
ON public.respostas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses" 
ON public.respostas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policies for respostas_missao2
CREATE POLICY "Users can insert their own mission 2 responses" 
ON public.respostas_missao2 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission 2 responses" 
ON public.respostas_missao2 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policies for respostas_missao3
CREATE POLICY "Users can insert their own mission 3 responses" 
ON public.respostas_missao3 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission 3 responses" 
ON public.respostas_missao3 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policies for respostas_missao4
CREATE POLICY "Users can insert their own mission 4 responses" 
ON public.respostas_missao4 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission 4 responses" 
ON public.respostas_missao4 
FOR SELECT 
USING (auth.uid() = user_id);