-- Padronizar tabela respostas para seguir o mesmo padrão das outras tabelas respostas_missaox

-- Primeiro, adicionar as colunas que estão faltando
ALTER TABLE public.respostas 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar uma nova tabela com a estrutura correta
CREATE TABLE public.respostas_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrar dados existentes para a nova tabela
INSERT INTO public.respostas_new (user_id, nome, email, respostas, created_at, updated_at)
SELECT 
  user_id,
  nome,
  COALESCE(email, '') as email, -- Garante que email não seja null
  COALESCE(respostas, '{}'::jsonb) as respostas, -- Garante que respostas não seja null
  COALESCE(created_at, now()) as created_at,
  COALESCE(updated_at, now()) as updated_at
FROM public.respostas;

-- Remover a tabela antiga e renomear a nova
DROP TABLE public.respostas;
ALTER TABLE public.respostas_new RENAME TO respostas;

-- Aplicar as mesmas políticas RLS das outras tabelas
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS padronizadas
CREATE POLICY "Admins can view all responses" 
ON public.respostas 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own responses" 
ON public.respostas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses" 
ON public.respostas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_respostas_updated_at
BEFORE UPDATE ON public.respostas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();