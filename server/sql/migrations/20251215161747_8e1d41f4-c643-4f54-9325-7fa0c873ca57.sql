-- Create questions table for Quiz Lógica Aplicada
CREATE TABLE public.logica_aplicada_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_position INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create participants table
CREATE TABLE public.logica_aplicada_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create answers table with timing for speed bonus
CREATE TABLE public.logica_aplicada_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES public.logica_aplicada_participants(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.logica_aplicada_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_taken_ms INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0
);

-- Create session state table
CREATE TABLE public.logica_aplicada_session_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_phase TEXT NOT NULL DEFAULT 'waiting' CHECK (current_phase IN ('waiting', 'question', 'ranking_parcial', 'ended')),
  current_question_id UUID REFERENCES public.logica_aplicada_questions(id),
  question_started_at TIMESTAMP WITH TIME ZONE,
  session_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.logica_aplicada_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logica_aplicada_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logica_aplicada_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logica_aplicada_session_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions (anyone can read, only admins can modify)
CREATE POLICY "Anyone can view logica aplicada questions" ON public.logica_aplicada_questions FOR SELECT USING (true);
CREATE POLICY "Only admins can modify logica aplicada questions" ON public.logica_aplicada_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for participants
CREATE POLICY "Anyone can view logica aplicada participants" ON public.logica_aplicada_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can register as logica aplicada participant" ON public.logica_aplicada_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete logica aplicada participants" ON public.logica_aplicada_participants FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for answers
CREATE POLICY "Anyone can view logica aplicada answers" ON public.logica_aplicada_answers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert logica aplicada answers" ON public.logica_aplicada_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete logica aplicada answers" ON public.logica_aplicada_answers FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for session state
CREATE POLICY "Anyone can view logica aplicada session state" ON public.logica_aplicada_session_state FOR SELECT USING (true);
CREATE POLICY "Only admins can modify logica aplicada session state" ON public.logica_aplicada_session_state FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for answers and session state
ALTER PUBLICATION supabase_realtime ADD TABLE public.logica_aplicada_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logica_aplicada_session_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logica_aplicada_participants;

-- Insert the 10 questions
INSERT INTO public.logica_aplicada_questions (order_position, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 'Durante o curso, usamos a ideia de "receita de bolo" para explicar um conceito de lógica. O que é um algoritmo, do jeito que vimos juntos?', 'Um tipo de software que automatiza processos', 'Uma linguagem de programação usada só por desenvolvedores', 'Um passo a passo organizado para chegar em um resultado', 'Um relatório de indicadores do processo', 'C'),
(2, 'Quando falamos de "montar um móvel com manual" e "se fizer fora de ordem não encaixa", estávamos falando principalmente de:', 'Variáveis', 'Sequência', 'Loop (repetição)', 'Função', 'B'),
(3, 'Na Missão do Ovo, o que a dinâmica queria mostrar sobre lógica e "robôs/sistemas"?', 'Que o robô é esperto e sempre corrige nossos erros', 'Que o robô/sistema só executa exatamente o que está escrito, e por isso a lógica precisa ser explícita', 'Que cozinhar é mais difícil do que fechar o mês contábil', 'Que a IA gosta mais de cozinha do que de processos de cliente', 'B'),
(4, 'No nosso "alfabeto do fluxo", qual é o papel do losango em um fluxograma?', 'Mostrar o início do processo', 'Representar uma ação/tarefa', 'Representar uma decisão de SIM ou NÃO, como "Documentação completa?"', 'Mostrar o fim do processo', 'C'),
(5, 'Qual destas frases foi usada como exemplo de loop/repetição, parecido com o que vimos em conciliação bancária?', 'Se o cliente estiver em dia, mostrar "Cliente em dia".', 'Registrar o pagamento do cliente no sistema.', 'Todo mês, enquanto houver lançamento pendente, continuar conciliando.', 'Encaminhar o caso para o jurídico.', 'C'),
(6, 'Falamos que variáveis são "caixinhas onde guardamos informações que mudam de caso pra caso". Qual das opções abaixo é um exemplo de variável na rotina de vocês?', 'O fluxograma desenhado no Miro', 'status_cliente (em dia / em atraso)', 'O desenho do ovo na frigideira', 'O logo do Código F', 'B'),
(7, 'Na Prompt Clinic, vimos um exemplo de pedido para a Cody assim: "Cody, monta uma proposta pro cliente, revisa um contrato, vê um imposto que talvez esteja errado e ainda faz um resumo pro comitê… tudo isso aí pra mim rapidinho." Como chamamos esse tipo de pedido?', 'Pedido com cara de Lógica (Tipo 3)', 'Pedido Contraditório', 'Pedido Caótico', 'Pedido Técnico', 'C'),
(8, 'O "Pedido com cara de Lógica" (Tipo 3), aquele que a Cody gosta, tinha qual característica principal?', 'Ser o mais curto possível, com no máximo 3 linhas', 'Pedir "faz tudo aí pra mim" sem muitos detalhes', 'Definir o papel da IA, explicar o contexto, listar entregas numeradas e dar limites de tamanho/tom', 'Ser escrito apenas com termos jurídicos e tributários', 'C'),
(9, 'O que é pseudo-código, da forma como usamos no curso?', 'Código pronto pra ser copiado e colado em qualquer linguagem de programação', 'Um desenho de fluxograma com símbolos de início, fim e decisões', 'Um "português organizado" que pensa como código, mas qualquer pessoa consegue ler', 'Um relatório de erros da IA depois de rodar o processo', 'C'),
(10, 'Por que insistimos tanto em desenhar o fluxo (fluxograma) antes de pedir algo pra TI ou pra IA?', 'Porque a legislação exige que todo processo tenha fluxograma', 'Porque fluxograma deixa a apresentação mais bonita pro cliente', 'Porque TI e IA só conseguem trabalhar bem quando o processo está claro: início, ações, decisões, loops e fim', 'Porque assim ninguém mais precisa conversar sobre o processo', 'C');