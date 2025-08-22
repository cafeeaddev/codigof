-- Adicionar campo para data de fim do jogo
ALTER TABLE public.user_progress 
ADD COLUMN game_end_date timestamp with time zone;

-- Comentário explicativo do campo
COMMENT ON COLUMN public.user_progress.game_end_date IS 'Data quando o usuário finalizou completamente o jogo (todas as missões concluídas)';