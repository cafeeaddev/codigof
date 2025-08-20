-- Corrigir migração do sistema de perguntas

-- 1. Renomear tabela mission4_questions para questions
ALTER TABLE mission4_questions RENAME TO questions;

-- 2. Adicionar campos necessários para todas as missões
ALTER TABLE questions ADD COLUMN mission_number integer NOT NULL DEFAULT 4;
ALTER TABLE questions ADD COLUMN order_position integer NOT NULL DEFAULT 1;
ALTER TABLE questions ADD COLUMN is_active boolean NOT NULL DEFAULT true;
ALTER TABLE questions ADD COLUMN points_mapping jsonb;

-- 3. Renomear campos para padronizar - primeiro torná-lo nullable
ALTER TABLE questions ALTER COLUMN question_id DROP NOT NULL;
ALTER TABLE questions RENAME COLUMN question_id TO legacy_question_id;

-- 4. Inserir perguntas da Missão 1
INSERT INTO questions (mission_number, order_position, question_text, question_type, options, points_mapping, is_active) VALUES
(1, 1, 'Quando uma nova ferramenta digital é lançada na empresa, você...', 'multiple-choice', 
 '{"A": "Prefiro esperar orientações ou alguém usar primeiro antes de se envolver.", "B": "Me sinto inseguro, Gosta de entender como aquilo se conecta com o que já conhece.", "C": "Explora por conta própria para ver se tem utilidade.", "D": "Aplica em alguma tarefa e vê na prática se vale a pena.", "E": "Avalia se a novidade pode contribuir para processos mais consistentes no time."}',
 '{"A": 0.0, "B": 1.0, "C": 2.5, "D": 3.7, "E": 5.0}', true),

(1, 2, 'Ao ajudar um colega com uma ferramenta que você já usou...', 'multiple-choice',
 '{"A": "Nunca ajudei, geralmente prefiro que outra pessoa mais experiente oriente.", "B": "Tenta entender a dúvida e sugere um caminho para seguir.", "C": "Mostra rapidamente como você costuma usar e incentiva ele a tentar.", "D": "Explica detalhadamente, adaptando à necessidade específica dele.", "E": "Cria um guia ou template que pode ajudar não só ele, mas outros colegas."}',
 '{"A": 0.0, "B": 1.0, "C": 2.5, "D": 3.7, "E": 5.0}', true),

(1, 3, 'Quando precisa aprender algo novo e complexo...', 'multiple-choice',
 '{"A": "Fico um pouco travado no início e espero alguém mostrar como começar.", "B": "Procura alguém que já fez e tenta entender como aplicou.", "C": "Assiste vídeos, lê artigos e testa por conta própria.", "D": "Aplica direto em um projeto real para aprender fazendo.", "E": "Aprende, aplica e adapta para que outros também possam usar."}',
 '{"A": 0.0, "B": 1.0, "C": 2.5, "D": 3.7, "E": 5.0}', true),

(1, 4, 'Sobre ferramentas de IA como ChatGPT ou Copilot:', 'multiple-choice',
 '{"A": "Já ouvi falar, mas ainda não explorei por não saber exatamente como começar.", "B": "Ainda está conhecendo e prefere observar como outros usam.", "C": "Já experimentou para tarefas simples ou gerar ideias.", "D": "Usa regularmente para otimizar tarefas do seu trabalho.", "E": "Integra em processos importantes e compartilha métodos eficientes com o time."}',
 '{"A": 0.0, "B": 1.0, "C": 2.5, "D": 3.7, "E": 5.0}', true),

-- 5. Inserir perguntas da Missão 2  
(2, 1, 'Quando você precisa organizar informações ou dados no trabalho:', 'multiple-choice',
 '{"A": "Ainda uso métodos manuais (papel, caderno, ou arquivos simples).", "B": "Uso ferramentas básicas como Word ou Excel, mas de forma bem simples.", "C": "Combino diferentes ferramentas e crio templates ou estruturas organizadas.", "D": "Uso ferramentas avançadas com automações, filtros ou integrações.", "E": "Crio sistemas estruturados que facilitam o trabalho de toda a equipe."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(2, 2, 'Sobre comunicação e colaboração digital:', 'multiple-choice',
 '{"A": "Prefiro conversas presenciais ou por telefone na maioria das situações.", "B": "Uso e-mail e WhatsApp, mas de forma bem básica.", "C": "Uso múltiplos canais (Teams, Slack, etc.) e organizo conversas por temas.", "D": "Facilito reuniões virtuais e uso ferramentas colaborativas em tempo real.", "E": "Lidero iniciativas digitais e otimizo processos de comunicação da equipe."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(2, 3, 'Quando se trata de automatizar tarefas repetitivas:', 'multiple-choice',
 '{"A": "Faço tudo manualmente, não costumo pensar em automação.", "B": "Já pensei em automatizar, mas ainda não sei por onde começar.", "C": "Uso alguns atalhos ou funcionalidades automáticas básicas.", "D": "Criou fluxos automatizados simples que poupam tempo no dia a dia.", "E": "Implementa automações complexas e ensina outros a fazer o mesmo."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

-- 6. Inserir perguntas da Missão 3
(3, 1, 'Quando você enfrenta um problema complexo no trabalho:', 'multiple-choice',
 '{"A": "Costumo seguir processos já estabelecidos ou pedir ajuda.", "B": "Analiso o problema e busco soluções baseadas em experiências anteriores.", "C": "Exploro diferentes abordagens e testo algumas alternativas.", "D": "Desenvolvo soluções criativas e implemento rapidamente.", "E": "Crio metodologias inovadoras que podem ser replicadas em outros contextos."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(3, 2, 'Sobre trabalhar com dados e análises:', 'multiple-choice',
 '{"A": "Tenho dificuldade com análise de dados e prefiro relatórios prontos.", "B": "Consigo interpretar relatórios básicos e extrair informações simples.", "C": "Analiso dados, identifico padrões e tiro conclusões práticas.", "D": "Uso dados para fundamentar decisões estratégicas e criar insights.", "E": "Transformo dados em narrativas convincentes que orientam mudanças organizacionais."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(3, 3, 'Quando precisa aprender algo completamente novo:', 'multiple-choice',
 '{"A": "Fico ansioso e prefiro que alguém me ensine passo a passo.", "B": "Busco cursos estruturados ou treinamentos formais.", "C": "Combino diferentes fontes de aprendizado e pratico por conta própria.", "D": "Aprendo experimentando e aplicando em projetos reais.", "E": "Rapidamente absorvo novos conceitos e os adapto para criar soluções inovadoras."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(3, 4, 'Sobre liderar mudanças e inovações:', 'multiple-choice',
 '{"A": "Prefiro seguir mudanças propostas por outros.", "B": "Apoio mudanças quando vejo que fazem sentido.", "C": "Sugero melhorias e participo ativamente de processos de mudança.", "D": "Lidero iniciativas de melhoria e engajo outros na implementação.", "E": "Sou reconhecido como agente de transformação e mentor de inovação."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true),

(3, 5, 'Em relação ao futuro do trabalho e tecnologia:', 'multiple-choice',
 '{"A": "Me preocupo com as mudanças e prefiro manter o que já conheço.", "B": "Acompanho as tendências mas com certa cautela.", "C": "Me mantenho atualizado e adapto gradualmente minhas práticas.", "D": "Antecipo tendências e me preparo proativamente para mudanças.", "E": "Sou visionário, influencio direções estratégicas e inspiro outros para o futuro."}',
 '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}', true);

-- 7. Atualizar perguntas existentes da Missão 4 para incluir points_mapping
UPDATE questions 
SET points_mapping = '{"A": 0, "B": 1, "C": 2.5, "D": 3.7, "E": 5}'::jsonb,
    order_position = COALESCE(legacy_question_id, id)
WHERE mission_number = 4;