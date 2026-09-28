-- ============================================
-- QUIZ 2: NUVEM DE TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.quiz2_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  keyword text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quiz2_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz2 submissions"
  ON public.quiz2_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view quiz2 submissions"
  ON public.quiz2_submissions FOR SELECT
  USING (true);

-- ============================================
-- QUIZ 3: SOLUÇÕES DIGITAIS
-- ============================================

CREATE TABLE IF NOT EXISTS public.quiz3_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_position integer NOT NULL UNIQUE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  feedback_correct text NOT NULL,
  feedback_incorrect text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz3_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz3_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES public.quiz3_participants(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.quiz3_questions(id) ON DELETE CASCADE,
  answer text NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  answered_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.quiz3_session_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_phase text NOT NULL DEFAULT 'waiting' 
    CHECK (current_phase IN ('waiting', 'question', 'explanation', 'ranking', 'ended')),
  current_question_id uuid REFERENCES public.quiz3_questions(id) ON DELETE SET NULL,
  question_started_at timestamptz,
  session_started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies para Quiz 3
ALTER TABLE public.quiz3_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz3_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz3_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz3_session_state ENABLE ROW LEVEL SECURITY;

-- Quiz 3 Questions
CREATE POLICY "Anyone can view quiz3 questions"
  ON public.quiz3_questions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify quiz3 questions"
  ON public.quiz3_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Quiz 3 Participants
CREATE POLICY "Anyone can register as quiz3 participant"
  ON public.quiz3_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view quiz3 participants"
  ON public.quiz3_participants FOR SELECT
  USING (true);

-- Quiz 3 Answers
CREATE POLICY "Anyone can insert quiz3 answers"
  ON public.quiz3_answers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view quiz3 answers"
  ON public.quiz3_answers FOR SELECT
  USING (true);

-- Quiz 3 Session State
CREATE POLICY "Anyone can view quiz3 session state"
  ON public.quiz3_session_state FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify quiz3 session state"
  ON public.quiz3_session_state FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir perguntas do Quiz 3
INSERT INTO public.quiz3_questions (order_position, question_text, option_a, option_b, option_c, option_d, correct_option, feedback_correct, feedback_incorrect) VALUES
(1, 'Precisa juntar informações de várias planilhas diferentes?', 'Criar uma automação', 'Analisar dados', 'Compartilhar arquivos', 'Fazer uma reunião', 'B', 'Boa! É um caso de análise de dados — cruzar informações e gerar conclusões.', 'Essa é uma situação de análise de dados, não de comunicação ou automação.'),
(2, 'Quer evitar tarefas manuais e repetitivas no trabalho?', 'Fazer uma reunião', 'Automatizar processos', 'Armazenar informações', 'Criar relatórios', 'B', 'Perfeito! Automatizar processos é o caminho para ganhar tempo e evitar erros.', 'Tarefas repetitivas pedem automação — é o movimento certo aqui.'),
(3, 'Precisa transformar informações brutas em algo visual e fácil de entender?', 'Comunicação', 'Visualização de dados', 'Armazenamento', 'Planejamento', 'B', 'Exato! Visualizar dados ajuda a contar histórias com números.', 'Aqui vale apostar em visualização — gráficos e dashboards.'),
(4, 'Quer organizar tarefas e acompanhar o que o time está fazendo?', 'Comunicação', 'Gestão de projetos', 'Automação', 'Criação de conteúdo', 'B', 'Isso! Gestão de projetos e tarefas mantém o time no ritmo certo.', 'O foco é organizar entregas, então gestão de projetos é a resposta.'),
(5, 'Deseja registrar ideias e anotações para lembrar depois?', 'Comunicação', 'Organização pessoal', 'Análise', 'Visualização', 'B', 'Boa! Organização pessoal é essencial para não perder boas ideias.', 'Essa é uma ação de organização pessoal.'),
(6, 'Vai apresentar resultados para o time de forma clara e envolvente?', 'Comunicação', 'Automação', 'Planejamento', 'Análise', 'A', 'Perfeito! Comunicação é o foco — apresentar de forma clara e visual.', 'O objetivo aqui é comunicar resultados com impacto.'),
(7, 'Quer entender o comportamento do público e gerar insights?', 'Organização', 'Criação de conteúdo', 'Análise de dados', 'Comunicação', 'C', 'Exato! Análise de dados revela padrões e oportunidades.', 'Esse é o papel da análise — olhar para os números e aprender com eles.'),
(8, 'Precisa coletar opiniões rápidas do time ou dos clientes?', 'Automação', 'Pesquisa e feedback', 'Comunicação', 'Organização', 'B', 'Perfeito! Ferramentas de pesquisa ajudam a ouvir rapidamente o público.', 'Essa é uma ação de pesquisa e coleta de feedback.'),
(9, 'Quer guardar e compartilhar arquivos de forma segura?', 'Planejamento', 'Armazenamento em nuvem', 'Comunicação', 'Análise', 'B', 'Isso! Armazenamento em nuvem garante acesso e segurança.', 'O foco é guardar e compartilhar, então a resposta é armazenamento.'),
(10, 'Precisa trabalhar com pessoas que estão em locais diferentes?', 'Organização pessoal', 'Colaboração online', 'Automação', 'Visualização', 'B', 'Certo! Colaboração online aproxima times à distância.', 'Essa situação pede ferramentas de colaboração.');

-- Inicializar estado da sessão do Quiz 3
INSERT INTO public.quiz3_session_state (current_phase) VALUES ('waiting');