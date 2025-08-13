// Centralized question bank for all missions

// Mission 1 (Quiz Digital) - 4 questions
export const mission1Questions = [
  {
    id: 1,
    question: "Quando uma nova ferramenta digital é lançada na empresa, você...",
    options: {
      A: { text: "Prefiro esperar orientações ou alguém usar primeiro antes de se envolver.", points: 0.0 },
      B: { text: "Me sinto inseguro, Gosta de entender como aquilo se conecta com o que já conhece.", points: 1.0 },
      C: { text: "Explora por conta própria para ver se tem utilidade.", points: 2.5 },
      D: { text: "Aplica em alguma tarefa e vê na prática se vale a pena.", points: 3.7 },
      E: { text: "Avalia se a novidade pode contribuir para processos mais consistentes no time.", points: 5.0 }
    }
  },
  {
    id: 2,
    question: "Ao ajudar um colega com uma ferramenta que você já usou...",
    options: {
      A: { text: "Nunca ajudei, geralmente prefiro que outra pessoa mais experiente oriente.", points: 0.0 },
      B: { text: "Tenta entender a dúvida e sugere um caminho para seguir.", points: 1.0 },
      C: { text: "Mostra rapidamente como você costuma usar e incentiva ele a tentar.", points: 2.5 },
      D: { text: "Explica detalhadamente, adaptando à necessidade específica dele.", points: 3.7 },
      E: { text: "Cria um guia ou template que pode ajudar não só ele, mas outros colegas.", points: 5.0 }
    }
  },
  {
    id: 3,
    question: "Quando precisa aprender algo novo e complexo...",
    options: {
      A: { text: "Fico um pouco travado no início e espero alguém mostrar como começar.", points: 0.0 },
      B: { text: "Procura alguém que já fez e tenta entender como aplicou.", points: 1.0 },
      C: { text: "Assiste vídeos, lê artigos e testa por conta própria.", points: 2.5 },
      D: { text: "Aplica direto em um projeto real para aprender fazendo.", points: 3.7 },
      E: { text: "Aprende, aplica e adapta para que outros também possam usar.", points: 5.0 }
    }
  },
  {
    id: 4,
    question: "Sobre ferramentas de IA como ChatGPT ou Copilot:",
    options: {
      A: { text: "Já ouvi falar, mas ainda não explorei por não saber exatamente como começar.", points: 0.0 },
      B: { text: "Ainda está conhecendo e prefere observar como outros usam.", points: 1.0 },
      C: { text: "Já experimentou para tarefas simples ou gerar ideias.", points: 2.5 },
      D: { text: "Usa regularmente para otimizar tarefas do seu trabalho.", points: 3.7 },
      E: { text: "Integra em processos importantes e compartilha métodos eficientes com o time.", points: 5.0 }
    }
  }
];

// Mission 2 (Práticas Digitais) - 3 questions
export const mission2Questions = [
  {
    id: 1,
    question: "Quando você precisa organizar informações ou dados no trabalho:",
    options: {
      A: { text: "Ainda uso métodos manuais (papel, caderno, ou arquivos simples).", points: 0 },
      B: { text: "Uso ferramentas básicas como Word ou Excel, mas de forma bem simples.", points: 1 },
      C: { text: "Combino diferentes ferramentas e crio templates ou estruturas organizadas.", points: 2.5 },
      D: { text: "Uso ferramentas avançadas com automações, filtros ou integrações.", points: 3.7 },
      E: { text: "Crio sistemas estruturados que facilitam o trabalho de toda a equipe.", points: 5 }
    }
  },
  {
    id: 2,
    question: "Sobre comunicação e colaboração digital:",
    options: {
      A: { text: "Prefiro conversas presenciais ou por telefone na maioria das situações.", points: 0 },
      B: { text: "Uso e-mail e WhatsApp, mas de forma bem básica.", points: 1 },
      C: { text: "Uso múltiplos canais (Teams, Slack, etc.) e organizo conversas por temas.", points: 2.5 },
      D: { text: "Facilito reuniões virtuais e uso ferramentas colaborativas em tempo real.", points: 3.7 },
      E: { text: "Lidero iniciativas digitais e otimizo processos de comunicação da equipe.", points: 5 }
    }
  },
  {
    id: 3,
    question: "Quando se trata de automatizar tarefas repetitivas:",
    options: {
      A: { text: "Faço tudo manualmente, não costumo pensar em automação.", points: 0 },
      B: { text: "Já pensei em automatizar, mas ainda não sei por onde começar.", points: 1 },
      C: { text: "Uso alguns atalhos ou funcionalidades automáticas básicas.", points: 2.5 },
      D: { text: "Criou fluxos automatizados simples que poupam tempo no dia a dia.", points: 3.7 },
      E: { text: "Implementa automações complexas e ensina outros a fazer o mesmo.", points: 5 }
    }
  }
];

// Mission 3 (Desafios e Inovação) - 5 questions  
export const mission3Questions = [
  {
    id: 8,
    question: "Quando você enfrenta um problema complexo no trabalho:",
    options: {
      A: { text: "Costumo seguir processos já estabelecidos ou pedir ajuda.", points: 0 },
      B: { text: "Analiso o problema e busco soluções baseadas em experiências anteriores.", points: 1 },
      C: { text: "Exploro diferentes abordagens e testo algumas alternativas.", points: 2.5 },
      D: { text: "Desenvolvo soluções criativas e implemento rapidamente.", points: 3.7 },
      E: { text: "Crio metodologias inovadoras que podem ser replicadas em outros contextos.", points: 5 }
    }
  },
  {
    id: 9,
    question: "Sobre trabalhar com dados e análises:",
    options: {
      A: { text: "Tenho dificuldade com análise de dados e prefiro relatórios prontos.", points: 0 },
      B: { text: "Consigo interpretar relatórios básicos e extrair informações simples.", points: 1 },
      C: { text: "Analiso dados, identifico padrões e tiro conclusões práticas.", points: 2.5 },
      D: { text: "Uso dados para fundamentar decisões estratégicas e criar insights.", points: 3.7 },
      E: { text: "Transformo dados em narrativas convincentes que orientam mudanças organizacionais.", points: 5 }
    }
  },
  {
    id: 10,
    question: "Quando precisa aprender algo completamente novo:",
    options: {
      A: { text: "Fico ansioso e prefiro que alguém me ensine passo a passo.", points: 0 },
      B: { text: "Busco cursos estruturados ou treinamentos formais.", points: 1 },
      C: { text: "Combino diferentes fontes de aprendizado e pratico por conta própria.", points: 2.5 },
      D: { text: "Aprendo experimentando e aplicando em projetos reais.", points: 3.7 },
      E: { text: "Rapidamente absorvo novos conceitos e os adapto para criar soluções inovadoras.", points: 5 }
    }
  },
  {
    id: 11,
    question: "Sobre liderar mudanças e inovações:",
    options: {
      A: { text: "Prefiro seguir mudanças propostas por outros.", points: 0 },
      B: { text: "Apoio mudanças quando vejo que fazem sentido.", points: 1 },
      C: { text: "Sugiro melhorias e participo ativamente de processos de mudança.", points: 2.5 },
      D: { text: "Lidero iniciativas de melhoria e engajo outros na implementação.", points: 3.7 },
      E: { text: "Sou reconhecido como agente de transformação e mentor de inovação.", points: 5 }
    }
  },
  {
    id: 12,
    question: "Em relação ao futuro do trabalho e tecnologia:",
    options: {
      A: { text: "Me preocupo com as mudanças e prefiro manter o que já conheço.", points: 0 },
      B: { text: "Acompanho as tendências mas com certa cautela.", points: 1 },
      C: { text: "Me mantenho atualizado e adapto gradualmente minhas práticas.", points: 2.5 },
      D: { text: "Antecipo tendências e me preparo proativamente para mudanças.", points: 3.7 },
      E: { text: "Sou visionário, influencio direções estratégicas e inspiro outros para o futuro.", points: 5 }
    }
  }
];

// Mission 4 (Ferramentas Digitais) - General questions (for all users)
export const mission4GeneralQuestions = [
  {
    id: 1,
    question: "Microsoft Excel/Google Sheets",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Uso básico (inserir dados, somas simples)", points: 1 },
      C: { text: "Uso intermediário (fórmulas, gráficos básicos)", points: 2.5 },
      D: { text: "Uso avançado (funções complexas, tabelas dinâmicas)", points: 3.7 },
      E: { text: "Especialista (macros, automações, análises avançadas)", points: 5 }
    }
  },
  {
    id: 2,
    question: "PowerPoint/Google Slides",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Uso básico (slides simples com texto)", points: 1 },
      C: { text: "Uso intermediário (imagens, transições, formatação)", points: 2.5 },
      D: { text: "Uso avançado (templates customizados, animações)", points: 3.7 },
      E: { text: "Especialista (apresentações interativas, design profissional)", points: 5 }
    }
  },
  {
    id: 3,
    question: "Microsoft Teams/Zoom/Google Meet",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Participo de reuniões apenas", points: 1 },
      C: { text: "Organizo reuniões e uso recursos básicos", points: 2.5 },
      D: { text: "Uso recursos avançados (breakout rooms, gravação, compartilhamento)", points: 3.7 },
      E: { text: "Especialista (integração com outras ferramentas, webinars, treinamentos)", points: 5 }
    }
  },
  {
    id: 4,
    question: "WhatsApp Business/Telegram",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Uso pessoal apenas", points: 1 },
      C: { text: "Uso para comunicação de trabalho", points: 2.5 },
      D: { text: "Uso recursos profissionais (grupos organizados, broadcast)", points: 3.7 },
      E: { text: "Especialista (automação, bots, integração com sistemas)", points: 5 }
    }
  },
  {
    id: 5,
    question: "Google Drive/OneDrive/Dropbox",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Armazeno arquivos básicos", points: 1 },
      C: { text: "Organizo pastas e compartilho arquivos", points: 2.5 },
      D: { text: "Uso colaborativamente com controle de versões", points: 3.7 },
      E: { text: "Especialista (sincronização avançada, integração com workflows)", points: 5 }
    }
  },
  {
    id: 6,
    question: "ChatGPT/Claude/Gemini (IA)",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Experimentei algumas vezes", points: 1 },
      C: { text: "Uso ocasionalmente para tarefas simples", points: 2.5 },
      D: { text: "Uso regularmente para trabalho", points: 3.7 },
      E: { text: "Integro IA em workflows complexos", points: 5 }
    }
  },
  {
    id: 7,
    question: "Canva/Adobe/Figma (Design)",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Uso templates prontos", points: 1 },
      C: { text: "Crio designs básicos", points: 2.5 },
      D: { text: "Desenvolvo materiais profissionais", points: 3.7 },
      E: { text: "Designer avançado com projetos complexos", points: 5 }
    }
  },
  {
    id: 8,
    question: "Trello/Asana/Monday (Gestão de Projetos)",
    type: 'geral',
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Acompanho tarefas atribuídas", points: 1 },
      C: { text: "Organizo meus próprios projetos", points: 2.5 },
      D: { text: "Gerencio projetos de equipe", points: 3.7 },
      E: { text: "Implemento metodologias ágeis complexas", points: 5 }
    }
  },
  {
    id: 9,
    question: "LinkedIn/Redes Sociais Profissionais",
    type: 'geral',
    options: {
      A: { text: "Não tenho perfil", points: 0 },
      B: { text: "Tenho perfil mas uso pouco", points: 1 },
      C: { text: "Atualizo regularmente e interajo", points: 2.5 },
      D: { text: "Publico conteúdo e faço networking ativo", points: 3.7 },
      E: { text: "Influenciador/especialista reconhecido", points: 5 }
    }
  }
];

// Mission 4 - Area-specific questions
export const mission4AreaQuestions = [
  // TI/TI & TRANSFORMAÇÃO DIGITAL
  {
    id: 100,
    question: "GitHub/GitLab (Controle de Versão)",
    type: 'area-specific',
    criteria: { areas: ['TI', 'TI & TRANSFORMAÇÃO DIGITAL'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Conhecimento básico (clone, commit)", points: 1 },
      C: { text: "Uso intermediário (branches, merge, pull requests)", points: 2.5 },
      D: { text: "Uso avançado (workflows, CI/CD, code review)", points: 3.7 },
      E: { text: "Especialista (administração, estratégias de branching)", points: 5 }
    }
  },
  {
    id: 101,
    question: "Docker/Kubernetes (Containerização)",
    type: 'area-specific',
    criteria: { areas: ['TI', 'TI & TRANSFORMAÇÃO DIGITAL'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Conceitos básicos", points: 1 },
      C: { text: "Uso Docker para desenvolvimento", points: 2.5 },
      D: { text: "Deploy em produção com orquestração", points: 3.7 },
      E: { text: "Arquitetura completa de microserviços", points: 5 }
    }
  },
  // MARKETING
  {
    id: 200,
    question: "Google Analytics/Google Ads",
    type: 'area-specific',
    criteria: { areas: ['MARKETING'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Visualizo relatórios básicos", points: 1 },
      C: { text: "Configuração e análise intermediária", points: 2.5 },
      D: { text: "Campanhas otimizadas e segmentação avançada", points: 3.7 },
      E: { text: "Estratégias complexas de marketing digital", points: 5 }
    }
  },
  {
    id: 201,
    question: "HubSpot/Salesforce (CRM)",
    type: 'area-specific',
    criteria: { areas: ['MARKETING'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Visualização de contatos e deals", points: 1 },
      C: { text: "Gestão de pipeline e automações básicas", points: 2.5 },
      D: { text: "Workflows complexos e integrações", points: 3.7 },
      E: { text: "Customização avançada e estratégia de CRM", points: 5 }
    }
  },
  // JURIDICO
  {
    id: 300,
    question: "Sistemas Jurídicos (SAJ, Projuris, etc.)",
    type: 'area-specific',
    criteria: { areas: ['JURIDICO'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Consulta básica de processos", points: 1 },
      C: { text: "Gestão de prazos e controle processual", points: 2.5 },
      D: { text: "Automação de petições e relatórios", points: 3.7 },
      E: { text: "Configuração e otimização do sistema", points: 5 }
    }
  },
  {
    id: 301,
    question: "E-Social/SPED (Obrigações Acessórias)",
    type: 'area-specific',
    criteria: { areas: ['JURIDICO'] },
    options: {
      A: { text: "Nunca trabalhei", points: 0 },
      B: { text: "Conhecimento básico dos sistemas", points: 1 },
      C: { text: "Envio de informações e consultas", points: 2.5 },
      D: { text: "Análise e correção de inconsistências", points: 3.7 },
      E: { text: "Otimização de processos e compliance", points: 5 }
    }
  },
  // FINANCIAL ADVISORY/CONTROLADORIA
  {
    id: 400,
    question: "SAP/Oracle (ERP Financeiro)",
    type: 'area-specific',
    criteria: { areas: ['FINANCIAL ADVISORY', 'CONTROLADORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Consulta de relatórios básicos", points: 1 },
      C: { text: "Lançamentos e conciliações", points: 2.5 },
      D: { text: "Configuração de processos e workflows", points: 3.7 },
      E: { text: "Customização e otimização do ERP", points: 5 }
    }
  },
  {
    id: 401,
    question: "Tableau/QlikView (BI Financeiro)",
    type: 'area-specific',
    criteria: { areas: ['FINANCIAL ADVISORY', 'CONTROLADORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Consumo dashboards prontos", points: 1 },
      C: { text: "Criação de relatórios básicos", points: 2.5 },
      D: { text: "Dashboards interativos e KPIs", points: 3.7 },
      E: { text: "Modelagem de dados e visualizações complexas", points: 5 }
    }
  },
  // BPO/TAX
  {
    id: 500,
    question: "Domínio/Alterdata (Sistemas Contábeis)",
    type: 'area-specific',
    criteria: { areas: ['BPO', 'TAX'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Operação básica", points: 1 },
      C: { text: "Escrituração e apurações", points: 2.5 },
      D: { text: "Configuração e parametrização", points: 3.7 },
      E: { text: "Otimização e automação de processos", points: 5 }
    }
  },
  {
    id: 501,
    question: "SPED Fiscal/Contábil",
    type: 'area-specific',
    criteria: { areas: ['BPO', 'TAX'] },
    options: {
      A: { text: "Nunca trabalhei", points: 0 },
      B: { text: "Conhecimento básico", points: 1 },
      C: { text: "Geração e validação", points: 2.5 },
      D: { text: "Análise e correção de erros", points: 3.7 },
      E: { text: "Auditoria e otimização", points: 5 }
    }
  },
  // CONSULTORIA
  {
    id: 600,
    question: "Miro/Lucidchart (Diagramação)",
    type: 'area-specific',
    criteria: { areas: ['CONSULTORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Criação básica de diagramas", points: 1 },
      C: { text: "Fluxogramas e mapas de processo", points: 2.5 },
      D: { text: "Workshops colaborativos", points: 3.7 },
      E: { text: "Facilitação de design thinking", points: 5 }
    }
  },
  {
    id: 601,
    question: "Metodologias Ágeis (Scrum, Kanban)",
    type: 'area-specific',
    criteria: { areas: ['CONSULTORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Conhecimento teórico", points: 1 },
      C: { text: "Participação em projetos ágeis", points: 2.5 },
      D: { text: "Facilitação de cerimônias", points: 3.7 },
      E: { text: "Coach/Scrum Master certificado", points: 5 }
    }
  },
  // AUDITORIA
  {
    id: 700,
    question: "TeamMate/AuditBoard (Auditoria)",
    type: 'area-specific',
    criteria: { areas: ['AUDITORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Acesso básico para consultas", points: 1 },
      C: { text: "Documentação de achados", points: 2.5 },
      D: { text: "Planejamento e execução", points: 3.7 },
      E: { text: "Configuração e administração", points: 5 }
    }
  },
  {
    id: 701,
    question: "ACL/IDEA (Análise de Dados)",
    type: 'area-specific',
    criteria: { areas: ['AUDITORIA'] },
    options: {
      A: { text: "Nunca usei", points: 0 },
      B: { text: "Conhecimento básico", points: 1 },
      C: { text: "Análises simples de dados", points: 2.5 },
      D: { text: "Scripts e automações", points: 3.7 },
      E: { text: "Análises forenses avançadas", points: 5 }
    }
  }
];

// Combined mission 4 questions (legacy for backward compatibility)
export const mission4Questions = mission4GeneralQuestions;

// Helper function to get questions for Mission 4 based on user area
export const getMission4QuestionsForUser = (userArea?: string) => {
  const generalQuestions = mission4GeneralQuestions;
  
  if (!userArea) {
    return generalQuestions;
  }
  
  // Get area-specific questions for the user's area
  const areaQuestions = mission4AreaQuestions.filter(q => 
    q.criteria?.areas?.some(area => area.toLowerCase() === userArea.toLowerCase())
  );
  
  return [...generalQuestions, ...areaQuestions];
};

// Helper function to get question by mission type and question ID
export const getQuestionById = (missionType: string, questionId: number) => {
  switch (missionType) {
    case 'mission1':
      return mission1Questions.find(q => q.id === questionId);
    case 'mission2':
      return mission2Questions.find(q => q.id === questionId);
    case 'mission3':
      return mission3Questions.find(q => q.id === questionId);
    case 'mission4':
      return mission4Questions.find(q => q.id === questionId);
    default:
      return null;
  }
};

// Helper function to get option text by mission type, question ID and option letter
export const getOptionText = (missionType: string, questionId: number, optionLetter: string) => {
  const question = getQuestionById(missionType, questionId);
  return question?.options[optionLetter as keyof typeof question.options]?.text || `Opção ${optionLetter}`;
};