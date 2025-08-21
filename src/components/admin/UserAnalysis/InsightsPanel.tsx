import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProgress, UserProfile } from '@/types/admin';
import { Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface InsightsPanelProps {
  user: UserProgress;
  userProfile: UserProfile;
  totalScore: number;
  profile: { profile: string; sublevel: string };
  allResponses: {
    missao1: any[];
    missao2: any[];
    missao3: any[];
    missao4: any[];
  };
}

export const InsightsPanel = ({
  user,
  userProfile,
  totalScore,
  profile,
  allResponses
}: InsightsPanelProps) => {
  // Análise das respostas
  const getUserResponse = (responses: any[], userId: string, email: string) => {
    return responses.find(r => r.user_id === userId || r.email === email);
  };

  const mission1Response = getUserResponse(allResponses.missao1, user.user_id, userProfile.email || '');
  const mission2Response = getUserResponse(allResponses.missao2, user.user_id, userProfile.email || '');
  const mission3Response = getUserResponse(allResponses.missao3, user.user_id, userProfile.email || '');

  // Analisar padrões de resposta
  const analyzeResponsePattern = (responses: any) => {
    if (!responses) return { A: 0, B: 0, C: 0 };
    const pattern = { A: 0, B: 0, C: 0 };
    Object.values(responses).forEach((answer: any) => {
      if (answer === 'A' || answer === 'B' || answer === 'C') {
        pattern[answer]++;
      }
    });
    return pattern;
  };

  const mission1Pattern = analyzeResponsePattern(mission1Response?.respostas);
  const mission2Pattern = analyzeResponsePattern(mission2Response?.respostas);
  const mission3Pattern = analyzeResponsePattern(mission3Response?.respostas);

  // Identificar tendências comportamentais
  const getTotalPattern = () => {
    return {
      A: mission1Pattern.A + mission2Pattern.A + mission3Pattern.A,
      B: mission1Pattern.B + mission2Pattern.B + mission3Pattern.B,
      C: mission1Pattern.C + mission2Pattern.C + mission3Pattern.C
    };
  };

  const totalPattern = getTotalPattern();
  const dominantPattern = Object.entries(totalPattern).reduce((a, b) => totalPattern[a[0] as keyof typeof totalPattern] > totalPattern[b[0] as keyof typeof totalPattern] ? a : b)[0];

  // Gerar insights baseados no perfil e padrões
  const generateInsights = () => {
    const insights = [];

    // Análise do perfil digital
    if (profile.profile === 'Beginner') {
      insights.push({
        type: 'profile',
        title: 'Perfil Iniciante',
        description: 'Demonstra uma abordagem cautelosa em relação à transformação digital. Há grande potencial de crescimento com treinamento adequado.',
        icon: Target,
        color: 'hsl(var(--profile-beginner))'
      });
    } else if (profile.profile === 'Ninja') {
      insights.push({
        type: 'profile',
        title: 'Perfil Avançado',
        description: 'Demonstra excelente compreensão e aplicação de conceitos digitais. Pode ser um mentor para outros colaboradores.',
        icon: CheckCircle,
        color: 'hsl(var(--profile-ninja))'
      });
    }

    // Análise de padrões comportamentais
    if (dominantPattern === 'A') {
      insights.push({
        type: 'behavior',
        title: 'Abordagem Conservadora',
        description: 'Prefere métodos tradicionais e pode resistir a mudanças. Recomenda-se acompanhamento próximo na implementação de novas tecnologias.',
        icon: AlertTriangle,
        color: 'hsl(var(--profile-beginner))'
      });
    } else if (dominantPattern === 'C') {
      insights.push({
        type: 'behavior',
        title: 'Mentalidade Inovadora',
        description: 'Demonstra abertura para inovação e mudanças. Pode liderar iniciativas de transformação digital.',
        icon: Lightbulb,
        color: 'hsl(var(--profile-ninja))'
      });
    }

    // Análise de progresso
    const completedMissions = [user.missao_1_completed, user.missao_2_completed, user.missao_3_completed, user.missao_4_completed].filter(Boolean).length;
    if (completedMissions === 4) {
      insights.push({
        type: 'progress',
        title: 'Jornada Completa',
        description: 'Concluiu todas as missões, demonstrando comprometimento com o desenvolvimento digital.',
        icon: CheckCircle,
        color: 'hsl(var(--primary))'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Gerar recomendações
  const generateRecommendations = () => {
    const recommendations = [];

    if (totalScore < 14) {
      recommendations.push({
        priority: 'high',
        title: 'Capacitação Fundamental',
        description: 'Recomenda-se treinamento básico em transformação digital e ferramentas essenciais.',
        actions: ['Workshop sobre mindset digital', 'Treinamento em ferramentas básicas', 'Mentoria individualizada']
      });
    } else if (totalScore < 21) {
      recommendations.push({
        priority: 'medium',
        title: 'Desenvolvimento Intermediário',
        description: 'Foco em aplicação prática e desenvolvimento de competências específicas.',
        actions: ['Projetos práticos supervisionados', 'Cursos avançados', 'Participação em grupos de trabalho']
      });
    } else {
      recommendations.push({
        priority: 'low',
        title: 'Liderança e Mentoria',
        description: 'Aproveitar conhecimentos para liderar iniciativas e apoiar outros colaboradores.',
        actions: ['Liderar projetos de transformação', 'Mentorar novos colaboradores', 'Participar de comitês estratégicos']
      });
    }

    if (dominantPattern === 'A') {
      recommendations.push({
        priority: 'medium',
        title: 'Gestão de Mudanças',
        description: 'Acompanhamento especializado para facilitar a adaptação a novas tecnologias.',
        actions: ['Sessões de coaching', 'Implementação gradual', 'Suporte técnico dedicado']
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'hsl(var(--destructive))';
      case 'medium': return 'hsl(var(--profile-explorer))';
      case 'low': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Média Prioridade';
      case 'low': return 'Baixa Prioridade';
      default: return 'Prioridade';
    }
  };

  return (
    <div className="space-y-6">
      {/* Insights Comportamentais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Insights Comportamentais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {insights.map((insight, idx) => {
              const IconComponent = insight.icon;
              return (
                <div key={idx} className="flex gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: insight.color + '20' }}
                    >
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: insight.color }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Padrão de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Padrões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { letter: 'A', label: 'Conservador', count: totalPattern.A, color: 'hsl(var(--profile-beginner))' },
                { letter: 'B', label: 'Moderado', count: totalPattern.B, color: 'hsl(var(--profile-explorer))' },
                { letter: 'C', label: 'Progressivo', count: totalPattern.C, color: 'hsl(var(--profile-ninja))' }
              ].map(pattern => (
                <div key={pattern.letter} className="text-center p-3 border rounded-lg">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: pattern.color }}
                  >
                    {pattern.letter}
                  </div>
                  <p className="text-sm font-medium">{pattern.label}</p>
                  <p className="text-lg font-bold">{pattern.count}</p>
                  <p className="text-xs text-muted-foreground">respostas</p>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm">
                <strong>Padrão Dominante:</strong> {dominantPattern === 'A' ? 'Conservador' : dominantPattern === 'B' ? 'Moderado' : 'Progressivo'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado no conjunto de respostas das missões 1, 2 e 3.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Plano de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: getPriorityColor(rec.priority),
                      color: getPriorityColor(rec.priority)
                    }}
                  >
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ações Recomendadas:</p>
                  <ul className="text-sm space-y-1">
                    {rec.actions.map((action, actionIdx) => (
                      <li key={actionIdx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pontos Fortes e Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {user.missao_4_completed && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Completou avaliação de competências técnicas
                </li>
              )}
              {totalScore > 20 && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Pontuação acima da média esperada
                </li>
              )}
              {totalPattern.C > totalPattern.A && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Demonstra mentalidade aberta para inovação
                </li>
              )}
              <li className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Participação ativa no processo de avaliação
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Target className="w-5 h-5" />
              Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {totalScore < 18 && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Desenvolvimento de mindset digital
                </li>
              )}
              {totalPattern.A > totalPattern.C && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Redução de resistência a mudanças
                </li>
              )}
              {!user.missao_4_completed && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Completar avaliação de competências técnicas
                </li>
              )}
              <li className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Aplicação prática de conhecimentos adquiridos
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};