export type ProfileName = 'Beginner' | 'Beginner +' | 'Explorer' | 'Pro-Player' | 'Ninja';

export const getDigitalProfile = (totalScore: number) => {
  if (totalScore >= 57) return { profile: 'Ninja' as const, sublevel: 'Ninja Raiz™ 😎' };
  if (totalScore >= 52) return { profile: 'Ninja' as const, sublevel: 'Consolidação' };
  if (totalScore >= 42) return { profile: 'Pro-Player' as const, sublevel: 'Transição → Ninja' };
  if (totalScore >= 37) return { profile: 'Pro-Player' as const, sublevel: 'Início/Consolidado' };
  if (totalScore >= 31) return { profile: 'Explorer' as const, sublevel: 'Transição → Pro-Player' };
  if (totalScore >= 25) return { profile: 'Explorer' as const, sublevel: 'Início' };
  if (totalScore >= 18) return { profile: 'Beginner +' as const, sublevel: 'Transição → Explorer' };
  return { profile: 'Beginner' as const, sublevel: 'Início' };
};

export const getProfileColor = (profile: ProfileName) => {
  switch (profile) {
    case 'Beginner': return 'hsl(var(--profile-beginner))';
    case 'Beginner +': return 'hsl(var(--profile-beginner-plus))';
    case 'Explorer': return 'hsl(var(--profile-explorer))';
    case 'Pro-Player': return 'hsl(var(--profile-pro-player))';
    case 'Ninja': return 'hsl(var(--profile-ninja))';
    default: return 'hsl(var(--muted-foreground))';
  }
};

export const getProfilePhrase = (profile: ProfileName, sublevel: string) => {
  // Frases baseadas nas ideias fornecidas
  const map: Record<ProfileName, Record<string, string>> = {
    'Beginner': {
      'Início': '🟡 Nível 0 – Início da jornada • Você ainda não está familiarizado com o universo digital e prefere seguir com os métodos que conhece. As mudanças tecnológicas estão acontecendo — conte conosco para apoiar seus primeiros passos no aprimoramento de competências digitais.',
    },
    'Beginner +': {
      'Transição → Explorer': '🟡 Nível 1 – Primeiros Passos • Você está começando sua relação com o universo digital. Observador(a) e reflexivo(a), constrói uma base sólida para evoluir. Conte conosco para apoiar seus primeiros passos no aprimoramento de competências digitais.',
    },
    'Explorer': {
      'Início': '🟡 Nível 1 – Explorador iniciante • Você demonstra curiosidade real por tecnologia e já experimenta com frequência. Está transformando testes em rotina. Conte conosco para apoiar seus passos no aprimoramento de competências digitais.',
      'Transição → Pro-Player': '🟠 Nível 2 – Transição para Pro-Player • Seu uso das ferramentas é cada vez mais natural e produtivo. Você aplica no dia a dia e começa a influenciar colegas. Conte conosco para apoiar seus passos no aprimoramento de competências digitais.'
    },
    'Pro-Player': {
      'Início/Consolidado': '🟡 Nível 1 – Consolidação técnica • Você usa tecnologia com confiança e consistência. Resolve problemas, automatiza rotinas e entrega com eficiência. Perfil claro: aplica com propósito e gera impacto direto.',
      'Transição → Ninja': '🟠 Nível 2 – Transição para Ninja • Seu domínio técnico vem acompanhado de visão de contexto. Você pensa no impacto coletivo e contribui para soluções além do seu escopo. Rumo ao protagonismo na transformação digital.'
    },
    'Ninja': {
      'Consolidação': '🟡 Nível 1 – Consolidação de liderança digital • Você atua com fluidez entre pessoas, processos e ferramentas. Seu impacto é coletivo: transforma, integra e inspira.',
      'Ninja Raiz™ 😎': '🔴 Nível 2 – Referência estratégica • Maturidade digital elevada. Você lidera mudanças com consciência, experimenta com responsabilidade e compartilha com generosidade.'
    }
  };

  const byProfile = map[profile] || {};
  return byProfile[sublevel] || Object.values(byProfile)[0] || '';
};
