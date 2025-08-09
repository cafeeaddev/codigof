-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles de usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política para admins visualizarem todas as respostas
CREATE POLICY "Admins can view all responses" 
ON public.respostas 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all mission 2 responses" 
ON public.respostas_missao2 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all mission 4 responses" 
ON public.respostas_missao4 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Criar tabela para respostas da missão 3 (que estava faltando)
CREATE TABLE public.respostas_missao3 (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    respostas JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela respostas_missao3
ALTER TABLE public.respostas_missao3 ENABLE ROW LEVEL SECURITY;

-- Políticas para respostas_missao3
CREATE POLICY "Anyone can insert mission 3 responses" 
ON public.respostas_missao3 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view mission 3 responses" 
ON public.respostas_missao3 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can view all mission 3 responses" 
ON public.respostas_missao3 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tornar a usuária atual admin (você pode mudar o email)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'nawana.santos@forvismazars.com'
ON CONFLICT (user_id, role) DO NOTHING;