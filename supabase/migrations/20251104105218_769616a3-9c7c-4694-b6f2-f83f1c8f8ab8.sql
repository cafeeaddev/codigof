-- Tabela de perguntas do Código F
CREATE TABLE public.codigo_f_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('MITO', 'VERDADE')),
  explanation text NOT NULL,
  order_position integer NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Inserir as 6 perguntas
INSERT INTO public.codigo_f_questions (question_text, correct_answer, explanation, order_position) VALUES
('Transformação digital é um projeto com começo e fim', 'MITO', 'Transformação digital é uma jornada contínua, não um destino. É um mindset de evolução constante, não um projeto com data de encerramento.', 1),
('IA vai substituir todos os empregos', 'MITO', 'IA é uma ferramenta que muda a natureza do trabalho, não elimina o trabalho humano. Substitui tarefas repetitivas, mas cria novas demandas por criatividade, empatia e decisão estratégica.', 2),
('Dados são o novo petróleo', 'VERDADE', 'Como o petróleo, dados brutos têm pouco valor. Precisam ser refinados (analisados) para gerar insights valiosos que movem decisões e inovação.', 3),
('Preciso ser programador para trabalhar com tecnologia', 'MITO', 'Alfabetização digital não é sobre código, é sobre entender como usar tecnologia para resolver problemas. Você não precisa construir o carro para dirigir.', 4),
('Automação sempre elimina postos de trabalho', 'MITO', 'Automação elimina tarefas, não necessariamente empregos. Libera humanos para trabalho de maior valor: estratégia, criatividade e relacionamento.', 5),
('A melhor tecnologia é a que o usuário usa', 'VERDADE', 'Tecnologia sofisticada que ninguém usa não gera valor. A melhor ferramenta é aquela que resolve problemas reais e é adotada pelas pessoas.', 6);

-- RLS para perguntas
ALTER TABLE public.codigo_f_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ler perguntas"
ON public.codigo_f_questions FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem modificar perguntas"
ON public.codigo_f_questions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.codigo_f_questions;

-- Tabela de estado da sessão
CREATE TABLE public.codigo_f_session_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_phase text NOT NULL DEFAULT 'waiting' 
    CHECK (current_phase IN ('waiting', 'question', 'explanation', 'ended')),
  current_question_id uuid REFERENCES public.codigo_f_questions(id),
  question_started_at timestamptz,
  session_started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Apenas uma sessão ativa por vez
CREATE UNIQUE INDEX idx_single_session ON public.codigo_f_session_state ((true));

-- RLS para session state
ALTER TABLE public.codigo_f_session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ler estado da sessão"
ON public.codigo_f_session_state FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem modificar estado da sessão"
ON public.codigo_f_session_state FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.codigo_f_session_state;

-- Tabela de participantes
CREATE TABLE public.codigo_f_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

-- RLS para participantes
ALTER TABLE public.codigo_f_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ler participantes"
ON public.codigo_f_participants FOR SELECT
USING (true);

CREATE POLICY "Qualquer um pode se registrar como participante"
ON public.codigo_f_participants FOR INSERT
WITH CHECK (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.codigo_f_participants;

-- Tabela de respostas
CREATE TABLE public.codigo_f_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES public.codigo_f_participants(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.codigo_f_questions(id) ON DELETE CASCADE,
  answer text NOT NULL CHECK (answer IN ('MITO', 'VERDADE')),
  answered_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, question_id)
);

-- Índices para performance
CREATE INDEX idx_answers_question ON public.codigo_f_answers(question_id);
CREATE INDEX idx_answers_participant ON public.codigo_f_answers(participant_id);

-- RLS para respostas
ALTER TABLE public.codigo_f_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ler respostas"
ON public.codigo_f_answers FOR SELECT
USING (true);

CREATE POLICY "Qualquer um pode enviar respostas"
ON public.codigo_f_answers FOR INSERT
WITH CHECK (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.codigo_f_answers;