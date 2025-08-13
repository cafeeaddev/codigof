-- Criar tabela para armazenar perguntas da Missão 4
CREATE TABLE public.mission4_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple-choice', 'star-rating')),
  target_areas TEXT[], -- Array de áreas alvo (ex: ['AUDITORIA'], ['TI', 'MARKETING'])
  options JSONB, -- Para perguntas múltipla escolha: {A: {text: "...", points: 0}, B: {...}}
  softwares TEXT[], -- Para perguntas star-rating: ['Data Sniper', 'Mica', ...]
  star_legends JSONB, -- Para perguntas star-rating: {1: {text: "...", points: 0}, ...}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mission4_questions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Anyone can view mission 4 questions" 
ON public.mission4_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify mission 4 questions" 
ON public.mission4_questions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_mission4_questions_updated_at
BEFORE UPDATE ON public.mission4_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perguntas universais (para todas as áreas exceto AUDITORIA)
INSERT INTO public.mission4_questions (question_id, question_text, question_type, target_areas, options) VALUES
(1, 'Microsoft Word', 'multiple-choice', '{}', '{"A": {"text": "Uso o Word para o básico, como escrever textos simples.", "points": 0.0}, "B": {"text": "Uso para textos simples, como cartas e relatórios curtos.", "points": 1.0}, "C": {"text": "Sei usar estilos, sumário automático e recursos de formatação mais avançados.", "points": 2.5}, "D": {"text": "Utilizo recursos como mala direta, controle de alterações e formatação corporativa.", "points": 3.7}, "E": {"text": "Crio modelos profissionais, configurando normas e recursos avançados para equipes.", "points": 5.0}}'),
(2, 'Microsoft PowerPoint', 'multiple-choice', '{}', '{"A": {"text": "Consigo fazer apresentações simples", "points": 0.0}, "B": {"text": "Crio apresentações com textos e imagens.", "points": 1.0}, "C": {"text": "Uso animações, transições e layouts personalizados.", "points": 2.5}, "D": {"text": "Desenvolvo apresentações estruturadas para reuniões, com vídeos e gráficos.", "points": 3.7}, "E": {"text": "Crio templates institucionais, apresentações narrativas e visual storytelling.", "points": 5.0}}'),
(3, 'Microsoft Excel', 'multiple-choice', '{}', '{"A": {"text": "Uso o Excel para tarefas simples, como organizar dados sem usar fórmulas.", "points": 0.0}, "B": {"text": "Conheço fórmulas básicas e formatação de tabelas.", "points": 1.0}, "C": {"text": "Uso funções intermediárias, filtros, gráficos e validações.", "points": 2.5}, "D": {"text": "Crio dashboards com PROC/VLOOKUP, tabelas dinâmicas e Power Query.", "points": 3.7}, "E": {"text": "Desenvolvo modelos automatizados, macros e soluções para múltiplos usuários.", "points": 5.0}}'),
(4, 'Power BI', 'multiple-choice', '{}', '{"A": {"text": "Já ouvi falar do Power BI, mas ainda não usei nem explorei a ferramenta.", "points": 0.0}, "B": {"text": "Conheço o nome ou assisti apresentações feitas com ele.", "points": 1.0}, "C": {"text": "Já criei relatórios simples com dados importados.", "points": 2.5}, "D": {"text": "Desenvolvo dashboards com DAX, filtros e visualizações interativas.", "points": 3.7}, "E": {"text": "Integro múltiplas fontes de dados e compartilho relatórios para tomada de decisão.", "points": 5.0}}'),
(5, 'Power Automate', 'multiple-choice', '{}', '{"A": {"text": "Nunca ouvi falar sobre essa ferramenta", "points": 0.0}, "B": {"text": "Nunca usei ou só ouvi falar.", "points": 1.0}, "C": {"text": "Testei fluxos simples, como alertas ou aprovações.", "points": 2.5}, "D": {"text": "Automatizei processos reais do meu trabalho.", "points": 3.7}, "E": {"text": "Crio fluxos conectando múltiplas ferramentas e oriento colegas.", "points": 5.0}}'),
(6, 'SharePoint', 'multiple-choice', '{}', '{"A": {"text": "Nunca acessei ao SharePoint.", "points": 0.0}, "B": {"text": "Já acessei páginas ou documentos, mas com uso pontual.", "points": 1.0}, "C": {"text": "Participo de equipes e bibliotecas compartilhadas.", "points": 2.5}, "D": {"text": "Organizo conteúdos, permissões e estrutura de sites.", "points": 3.7}, "E": {"text": "Administro ambientes SharePoint com fluxos, listas e integrações.", "points": 5.0}}'),
(7, 'Power Apps', 'multiple-choice', '{}', '{"A": {"text": "Ainda não ouvi falar sobre a ferramenta.", "points": 0.0}, "B": {"text": "Nunca usei ou só ouvi falar.", "points": 1.0}, "C": {"text": "Já explorei aplicativos prontos ou modelos.", "points": 2.5}, "D": {"text": "Criei apps simples para uso interno ou pessoal.", "points": 3.7}, "E": {"text": "Desenvolvo e publico aplicativos integrados com dados e processos da equipe.", "points": 5.0}}'),
(8, 'Banco de Dados / SQL', 'multiple-choice', '{}', '{"A": {"text": "Nunca tive contato com banco de dados/SQL.", "points": 0.0}, "B": {"text": "Já ouvi falar e tenho interesse em aprender mais.", "points": 1.0}, "C": {"text": "Já fiz consultas simples (SELECT, filtros, joins básicos).", "points": 2.5}, "D": {"text": "Realizo análises com queries intermediárias e múltiplas tabelas.", "points": 3.7}, "E": {"text": "Crio estruturas, mantenho bases e otimizações com SQL avançado.", "points": 5.0}}'),
(9, 'ChatGPT / IA', 'multiple-choice', '{}', '{"A": {"text": "Ainda não conheço nenhuma ferramenta de IA.", "points": 0.0}, "B": {"text": "Ainda não faz parte do meu dia a dia, mas já experimentei pelo menos uma IA.", "points": 1.0}, "C": {"text": "Uso para consultas ou inspiração.", "points": 2.5}, "D": {"text": "Aplico com foco em produtividade real.", "points": 3.7}, "E": {"text": "Crio fluxos ou soluções que combinam IA com outras ferramentas.", "points": 5.0}}');

-- Inserir perguntas específicas para AUDITORIA
INSERT INTO public.mission4_questions (question_id, question_text, question_type, target_areas, options) VALUES
(700, 'Microsoft Word', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Uso o Word para o básico, como escrever textos simples.", "points": 0.0}, "B": {"text": "Uso para textos simples, como cartas e relatórios curtos.", "points": 1.0}, "C": {"text": "Sei usar estilos, sumário automático e recursos de formatação mais avançados.", "points": 2.5}, "D": {"text": "Utilizo recursos como mala direta, controle de alterações e formatação corporativa.", "points": 3.7}, "E": {"text": "Crio modelos profissionais, configurando normas e recursos avançados para equipes.", "points": 5.0}}'),
(701, 'Microsoft PowerPoint', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Consigo fazer apresentações simples", "points": 0.0}, "B": {"text": "Crio apresentações com textos e imagens.", "points": 1.0}, "C": {"text": "Uso animações, transições e layouts personalizados.", "points": 2.5}, "D": {"text": "Desenvolvo apresentações estruturadas para reuniões, com vídeos e gráficos.", "points": 3.7}, "E": {"text": "Crio templates institucionais, apresentações narrativas e visual storytelling.", "points": 5.0}}'),
(702, 'Microsoft Excel', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Uso o Excel para tarefas simples, como organizar dados sem usar fórmulas.", "points": 0.0}, "B": {"text": "Conheço fórmulas básicas e formatação de tabelas.", "points": 1.0}, "C": {"text": "Uso funções intermediárias, filtros, gráficos e validações.", "points": 2.5}, "D": {"text": "Crio dashboards com PROC/VLOOKUP, tabelas dinâmicas e Power Query.", "points": 3.7}, "E": {"text": "Desenvolvo modelos automatizados, macros e soluções para múltiplos usuários.", "points": 5.0}}'),
(703, 'Power BI', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Já ouvi falar do Power BI, mas ainda não usei nem explorei a ferramenta.", "points": 0.0}, "B": {"text": "Conheço o nome ou assisti apresentações feitas com ele.", "points": 1.0}, "C": {"text": "Já criei relatórios simples com dados importados.", "points": 2.5}, "D": {"text": "Desenvolvo dashboards com DAX, filtros e visualizações interativas.", "points": 3.7}, "E": {"text": "Integro múltiplas fontes de dados e compartilho relatórios para tomada de decisão.", "points": 5.0}}'),
(704, 'Power Automate', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Nunca ouvi falar sobre essa ferramenta", "points": 0.0}, "B": {"text": "Nunca usei ou só ouvi falar.", "points": 1.0}, "C": {"text": "Testei fluxos simples, como alertas ou aprovações.", "points": 2.5}, "D": {"text": "Automatizei processos reais do meu trabalho.", "points": 3.7}, "E": {"text": "Crio fluxos conectando múltiplas ferramentas e oriento colegas.", "points": 5.0}}'),
(705, 'SharePoint', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Nunca acessei ao SharePoint.", "points": 0.0}, "B": {"text": "Já acessei páginas ou documentos, mas com uso pontual.", "points": 1.0}, "C": {"text": "Participo de equipes e bibliotecas compartilhadas.", "points": 2.5}, "D": {"text": "Organizo conteúdos, permissões e estrutura de sites.", "points": 3.7}, "E": {"text": "Administro ambientes SharePoint com fluxos, listas e integrações.", "points": 5.0}}'),
(706, 'Power Apps', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Ainda não ouvi falar sobre a ferramenta.", "points": 0.0}, "B": {"text": "Nunca usei ou só ouvi falar.", "points": 1.0}, "C": {"text": "Já explorei aplicativos prontos ou modelos.", "points": 2.5}, "D": {"text": "Criei apps simples para uso interno ou pessoal.", "points": 3.7}, "E": {"text": "Desenvolvo e publico aplicativos integrados com dados e processos da equipe.", "points": 5.0}}'),
(707, 'Banco de Dados / SQL', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Nunca tive contato com banco de dados/SQL.", "points": 0.0}, "B": {"text": "Já ouvi falar e tenho interesse em aprender mais.", "points": 1.0}, "C": {"text": "Já fiz consultas simples (SELECT, filtros, joins básicos).", "points": 2.5}, "D": {"text": "Realizo análises com queries intermediárias e múltiplas tabelas.", "points": 3.7}, "E": {"text": "Crio estruturas, mantenho bases e otimizações com SQL avançado.", "points": 5.0}}'),
(708, 'ChatGPT / IA', 'multiple-choice', '{"AUDITORIA"}', '{"A": {"text": "Ainda não conheço nenhuma ferramenta de IA.", "points": 0.0}, "B": {"text": "Ainda não faz parte do meu dia a dia, mas já experimentei pelo menos uma IA.", "points": 1.0}, "C": {"text": "Uso para consultas ou inspiração.", "points": 2.5}, "D": {"text": "Aplico com foco em produtividade real.", "points": 3.7}, "E": {"text": "Crio fluxos ou soluções que combinam IA com outras ferramentas.", "points": 5.0}}');

-- Inserir pergunta 10 (star-rating) específica para AUDITORIA
INSERT INTO public.mission4_questions (question_id, question_text, question_type, target_areas, softwares, star_legends) VALUES
(710, 'Queremos conhecer um pouco mais do seu conhecimento nas ferramentas que você usa na sua área.', 'star-rating', '{"AUDITORIA"}', '{"Data Sniper", "Mica", "Consoreco", "Maple", "Signals", "Mazars Count", "Audit Report"}', '{"1": {"text": "Não utilizo/Não aplicável", "points": 0}, "2": {"text": "Nunca usei ou conheço muito pouco", "points": 1}, "3": {"text": "Sei o básico, consigo realizar tarefas simples", "points": 2}, "4": {"text": "Consigo usar funções intermediárias com segurança", "points": 3}, "5": {"text": "Sou expert e consigo ensinar e otimizar o uso da ferramenta", "points": 4}}');