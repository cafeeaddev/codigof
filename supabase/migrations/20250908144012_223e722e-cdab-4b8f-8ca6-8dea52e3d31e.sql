-- Criar função para resetar progresso de usuário de forma segura
CREATE OR REPLACE FUNCTION public.reset_user_progress(_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  _admin_user_id := auth.uid();
  IF NOT has_role(_admin_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Verificar se o usuário alvo não é admin (admins não podem ter progresso resetado)
  IF has_role(_target_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Cannot reset progress of admin users';
  END IF;
  
  -- Verificar se existe progresso para o usuário
  IF NOT EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = _target_user_id) THEN
    RAISE EXCEPTION 'User progress not found';
  END IF;
  
  -- Resetar progresso mantendo dados essenciais
  UPDATE public.user_progress 
  SET 
    -- Resetar status das missões
    missao_1_completed = false,
    missao_2_completed = false, 
    missao_3_completed = false,
    missao_4_completed = false,
    missao_5_completed = false,
    
    -- Resetar perguntas atuais
    missao_1_current_question = 0,
    missao_2_current_question = 0,
    missao_3_current_question = 0,
    missao_4_current_question = 0,
    missao_5_current_question = 0,
    
    -- Limpar respostas
    missao_1_answers = '{}'::jsonb,
    missao_2_answers = '{}'::jsonb,
    missao_3_answers = '{}'::jsonb,
    missao_4_answers = '{}'::jsonb,
    missao_5_answers = '{}'::jsonb,
    
    -- Resetar XP e tempo
    total_xp = 0,
    game_base_xp = 0,
    time_bonus_xp = 0,
    total_play_time = 0,
    
    -- Resetar posição e perfil
    current_position = 'inicio',
    final_profile = NULL,
    final_score = NULL,
    game_end_date = NULL,
    
    -- Definir nova sessão
    session_start_time = now(),
    last_saved_at = now(),
    updated_at = now()
    
  WHERE user_id = _target_user_id;
  
  -- Log da ação de reset para auditoria
  INSERT INTO public.profile_audit_log (
    user_id, 
    accessed_profile_id,
    action_type,
    accessed_at
  ) VALUES (
    _admin_user_id,
    _target_user_id,
    'RESET_PROGRESS',
    now()
  );
  
  RETURN true;
END;
$$;