-- Remover registro duplicado do Yuri (mantendo o registro completo)
DELETE FROM public.profiles 
WHERE email = 'yuri.rumao@forvismazars.com' 
  AND nome = 'Yuri' 
  AND cargo = 'Estagiario';