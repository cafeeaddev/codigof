-- Criar perfil para o admin principal
INSERT INTO public.profiles (user_id, nome, email, cpf, area, cargo)
VALUES (
  '256049fe-e7d4-41ef-9b29-77fb377db379',
  'Administrador',
  'cafeead@cafeead.com.br',
  '00000000000',
  'Administração',
  'Administrador'
)
ON CONFLICT (user_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  area = EXCLUDED.area,
  cargo = EXCLUDED.cargo;

-- Garantir que tenha role de admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('256049fe-e7d4-41ef-9b29-77fb377db379', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;