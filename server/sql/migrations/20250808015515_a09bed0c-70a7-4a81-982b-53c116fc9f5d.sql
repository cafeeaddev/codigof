-- Adicionar colunas para armazenar progresso intermediário das missões
ALTER TABLE user_progress 
ADD COLUMN missao_1_current_question integer DEFAULT 1,
ADD COLUMN missao_1_answers jsonb DEFAULT '{}',
ADD COLUMN missao_2_current_question integer DEFAULT 1,
ADD COLUMN missao_2_answers jsonb DEFAULT '{}',
ADD COLUMN missao_3_current_question integer DEFAULT 1,
ADD COLUMN missao_3_answers jsonb DEFAULT '{}',
ADD COLUMN missao_4_current_question integer DEFAULT 1,
ADD COLUMN missao_4_answers jsonb DEFAULT '{}';