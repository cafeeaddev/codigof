import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProgress, UserProfile } from '@/types/admin';
import { CheckCircle, Clock, Target } from 'lucide-react';

interface MissionAnalysisProps {
  user: UserProgress;
  userProfile: UserProfile;
  allResponses: {
    missao1: any[];
    missao2: any[];
    missao3: any[];
    missao4: any[];
  };
  totalScore: number;
}

export const MissionAnalysis = ({
  user,
  userProfile,
  allResponses,
  totalScore
}: MissionAnalysisProps) => {

  // Encontrar respostas do usuário
  const getUserResponse = (responses: any[], userId: string, email: string) => {
    return responses.find(r => r.user_id === userId || r.email === email);
  };

  const mission1Response = getUserResponse(allResponses.missao1, user.user_id, userProfile.email || '');
  const mission2Response = getUserResponse(allResponses.missao2, user.user_id, userProfile.email || '');
  const mission3Response = getUserResponse(allResponses.missao3, user.user_id, userProfile.email || '');
  const mission4Response = getUserResponse(allResponses.missao4, user.user_id, userProfile.email || '');

  // Dados estáticos das missões - mais rápido e direto
  const missions = [
    {
      number: 1,
      title: 'Mindset Digital',
      description: 'Avaliação da mentalidade e visão sobre transformação digital',
      completed: user.missao_1_completed,
      currentQuestion: user.missao_1_current_question,
      totalQuestions: 4,
      response: mission1Response,
      maxScore: 10,
      questions: [
        { id: 53, text: 'Como você vê a transformação digital na sua organização?' },
        { id: 54, text: 'Qual sua atitude em relação a novas tecnologias?' },
        { id: 55, text: 'Como você lida com mudanças tecnológicas?' },
        { id: 56, text: 'Qual sua perspectiva sobre o futuro digital?' }
      ]
    },
    {
      number: 2,
      title: 'Comportamento',
      description: 'Análise de comportamentos digitais e adaptabilidade',
      completed: user.missao_2_completed,
      currentQuestion: user.missao_2_current_question,
      totalQuestions: 3,
      response: mission2Response,
      maxScore: 7.5,
      questions: [
        { id: 57, text: 'Como você se comporta diante de novos sistemas?' },
        { id: 58, text: 'Qual sua abordagem para aprender tecnologias?' },
        { id: 59, text: 'Como você colabora em ambientes digitais?' }
      ]
    },
    {
      number: 3,
      title: 'Aplicação Prática',
      description: 'Avaliação da aplicação prática de conhecimentos digitais',
      completed: user.missao_3_completed,
      currentQuestion: user.missao_3_current_question,
      totalQuestions: 5,
      response: mission3Response,
      maxScore: 12.5,
      questions: [
        { id: 60, text: 'Como você utiliza ferramentas digitais no trabalho?' },
        { id: 61, text: 'Qual sua experiência com análise de dados?' },
        { id: 62, text: 'Como você gerencia projetos digitais?' },
        { id: 63, text: 'Qual sua abordagem para solução de problemas?' },
        { id: 64, text: 'Como você implementa melhorias tecnológicas?' }
      ]
    },
    {
      number: 4,
      title: 'Competências Técnicas',
      description: 'Avaliação de competências específicas em softwares e ferramentas',
      completed: user.missao_4_completed,
      currentQuestion: user.missao_4_current_question,
      totalQuestions: 5,
      response: mission4Response,
      maxScore: null,
      questions: []
    }
  ];

  const getAnswerText = (answer: string) => {
    const answerMap: Record<string, string> = {
      'A': 'Opção A - Abordagem conservadora',
      'B': 'Opção B - Abordagem moderada', 
      'C': 'Opção C - Abordagem progressiva',
      'D': 'Opção D - Abordagem avançada',
      'E': 'Opção E - Abordagem especialista'
    };
    return answerMap[answer] || answer;
  };

  const getAnswerColor = (answer: string) => {
    const colorMap: Record<string, string> = {
      'A': 'hsl(var(--profile-beginner))',
      'B': 'hsl(var(--profile-explorer))',
      'C': 'hsl(var(--profile-ninja))',
      'D': 'hsl(var(--profile-pro-player))',
      'E': 'hsl(var(--primary))'
    };
    return colorMap[answer] || 'hsl(var(--muted-foreground))';
  };

  const calculateMissionScore = (missionNumber: number) => {
    let response = null;
    
    if (missionNumber === 1) response = mission1Response;
    else if (missionNumber === 2) response = mission2Response;
    else if (missionNumber === 3) response = mission3Response;
    
    if (!response || !response.respostas) return 0;
    
    // Se respostas for um array
    if (Array.isArray(response.respostas)) {
      return response.respostas.reduce((acc: number, item: any) => {
        return acc + (item.pontuacao || item.points || 0);
      }, 0);
    }
    
    // Se respostas for um objeto (formato antigo)
    return Object.values(response.respostas).reduce((acc: number, ans: any) => {
      if (ans === 'C') return acc + 2.5;
      if (ans === 'B') return acc + 1.5;
      if (ans === 'A') return acc + 0.5;
      return acc;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {missions.map((mission) => {
        const missionScore = mission.maxScore ? calculateMissionScore(mission.number) : null;
        
        return (
          <Card key={mission.number}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    mission.completed ? 'bg-green-500' : 'bg-muted'
                  }`}>
                    {mission.completed ? <CheckCircle className="w-4 h-4" /> : mission.number}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Missão {mission.number}: {mission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">
                      {mission.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {mission.completed ? (
                    <div className="space-y-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Concluída
                      </Badge>
                      {missionScore !== null && (
                        <p className="text-sm font-medium">
                          {(missionScore as number).toFixed(1)}/{mission.maxScore} pts
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Em andamento
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {mission.currentQuestion}/{mission.totalQuestions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {mission.completed && mission.response && mission.number <= 3 && (
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Respostas e Análise
                  </h4>
                  
                  <div className="grid gap-3">
                    {mission.questions.map((question, idx) => {
                      let answer = null;
                      let answerText = '';
                      let points = 0;
                      
                      if (mission.response?.respostas) {
                        if (Array.isArray(mission.response.respostas)) {
                          if (mission.number === 1) {
                            // Missão 1: estrutura com pergunta/resposta/pontuacao
                            const questionItem = mission.response.respostas.find((item: any) => 
                              item.pergunta === question.id
                            );
                            answer = questionItem?.resposta;
                            points = questionItem?.pontuacao || 0;
                            answerText = getAnswerText(answer);
                          } else {
                            // Missões 2 e 3: estrutura com selectedAnswer/selectedText
                            const questionItem = mission.response.respostas.find((item: any) => 
                              item.questionId === question.id
                            );
                            answer = questionItem?.selectedAnswer;
                            answerText = questionItem?.selectedText || getAnswerText(answer);
                            points = questionItem?.points || 0;
                          }
                        } else {
                          // Formato antigo de objeto
                          const questionKey = `pergunta${idx + 1}`;
                          answer = mission.response.respostas[questionKey];
                          answerText = getAnswerText(answer);
                          if (answer === 'C') points = 2.5;
                          else if (answer === 'B') points = 1.5;
                          else if (answer === 'A') points = 0.5;
                        }
                      }
                      
                      return (
                        <div key={idx} className="border rounded-lg p-4 space-y-2">
                          <p className="text-sm font-medium">
                            {idx + 1}. {question.text}
                          </p>
                          {answer && (
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: getAnswerColor(answer),
                                  color: getAnswerColor(answer)
                                }}
                              >
                                {answer}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex-1">
                                {answerText}
                              </span>
                              {points > 0 && (
                                <span className="text-xs font-medium text-primary">
                                  {points} pts
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                   {/* Análise do padrão de respostas */}
                  {mission.response && (
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <h5 className="font-medium mb-2">Padrão de Respostas</h5>
                      <div className="flex gap-4 text-sm">
                        {['A', 'B', 'C', 'D', 'E'].map(option => {
                          let count = 0;
                          
                           if (mission.response?.respostas) {
                             if (Array.isArray(mission.response.respostas)) {
                               // Contar respostas em array - diferentes estruturas por missão
                               if (mission.number === 1) {
                                 count = mission.response.respostas.filter((item: any) => item.resposta === option).length;
                               } else {
                                 // Missões 2 e 3: usar selectedAnswer
                                 count = mission.response.respostas.filter((item: any) => item.selectedAnswer === option).length;
                               }
                             } else {
                               // Contar respostas em objeto (formato antigo)
                               count = Object.values(mission.response.respostas).filter(ans => ans === option).length;
                             }
                           }
                          
                          if (count === 0) return null;
                          
                          return (
                            <div key={option} className="flex items-center gap-1">
                              <span 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getAnswerColor(option) }}
                              />
                              <span>{option}: {count}x</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}

            {mission.number === 4 && mission.completed && (
              <CardContent>
                <p className="text-muted-foreground">
                  Competências técnicas avaliadas através de sistema de estrelas. 
                  Veja a aba "Competências Técnicas" para análise detalhada.
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};