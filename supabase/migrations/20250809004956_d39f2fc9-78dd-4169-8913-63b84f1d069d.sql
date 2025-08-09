-- Remover a constraint de unicidade do CPF
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cpf_key;

-- Atualizar todos os CPFs na tabela profiles para manter apenas os 4 últimos dígitos
UPDATE public.profiles 
SET cpf = RIGHT(REGEXP_REPLACE(cpf, '[^0-9]', '', 'g'), 4)
WHERE cpf IS NOT NULL AND LENGTH(cpf) > 4;