
-- Corrige políticas RLS da tabela public.profiles para permitir:
-- 1) SELECT para login (sem exigir user_id previamente vinculado)
-- 2) UPDATE para vincular user_id quando o usuário autenticado tem o mesmo e-mail do perfil e user_id está nulo

-- 1) Remover políticas de SELECT existentes para recriá-las como permissivas
do $$
begin
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Permitir consulta para login'
  ) then
    drop policy "Permitir consulta para login" on public.profiles;
  end if;

  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Usuários podem ver seu próprio perfil'
  ) then
    drop policy "Usuários podem ver seu próprio perfil" on public.profiles;
  end if;
end
$$;

-- 1.a) Política PERMISSIVA para login (permite consulta de perfis)
create policy "Permitir consulta para login"
  on public.profiles
  for select
  using (true);

-- 1.b) Política PERMISSIVA para leitura do próprio perfil (continua válida)
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- 2) Política para permitir VINCULAR o profile (preencher user_id) após login,
-- quando o registro ainda não tem user_id e o e-mail do registro coincide com auth.email()
create policy "Vincular profile pelo email quando sem user_id"
  on public.profiles
  for update
  using (
    user_id is null
    and auth.email() = email
  )
  with check (
    user_id = auth.uid()
  );
