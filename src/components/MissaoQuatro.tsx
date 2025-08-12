import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import { ScrollArea } from './ui/scroll-area';

interface MissaoQuatroProps {
  onComplete: () => void;
}

const questions = [
  {
    id: 1,
    question: "Word",
    options: [
      { value: "a", text: "Uso o Word para o básico, como escrever textos simples.", points: 0.0 },
      { value: "b", text: "Uso para textos simples, como cartas e relatórios curtos.", points: 1.0 },
      { value: "c", text: "Sei usar estilos, sumário automático e recursos de formatação mais avançados.", points: 2.5 },
      { value: "d", text: "Utilizo recursos como mala direta, controle de alterações e formatação corporativa.", points: 3.7 },
      { value: "e", text: "Crio modelos profissionais, configurando normas e recursos avançados para equipes.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "PowerPoint",
    options: [
      { value: "a", text: "Consigo fazer apresentações simples", points: 0.0 },
      { value: "b", text: "Crio apresentações com textos e imagens.", points: 1.0 },
      { value: "c", text: "Uso animações, transições e layouts personalizados.", points: 2.5 },
      { value: "d", text: "Desenvolvo apresentações estruturadas para reuniões, com vídeos e gráficos.", points: 3.7 },
      { value: "e", text: "Crio templates institucionais, apresentações narrativas e visual storytelling.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Excel",
    options: [
      { value: "a", text: "Uso o Excel para tarefas simples, como organizar dados sem usar fórmulas.", points: 0.0 },
      { value: "b", text: "Conheço fórmulas básicas e formatação de tabelas.", points: 1.0 },
      { value: "c", text: "Uso funções intermediárias, filtros, gráficos e validações.", points: 2.5 },
      { value: "d", text: "Crio dashboards com PROC/VLOOKUP, tabelas dinâmicas e Power Query.", points: 3.7 },
      { value: "e", text: "Desenvolvo modelos automatizados, macros e soluções para múltiplos usuários.", points: 5.0 }
    ]
  },
  {
    id: 4,
    question: "Power BI",
    options: [
      { value: "a", text: "Já ouvi falar do Power BI, mas ainda não usei nem explorei a ferramenta.", points: 0.0 },
      { value: "b", text: "Conheço o nome ou assisti apresentações feitas com ele.", points: 1.0 },
      { value: "c", text: "Já criei relatórios simples com dados importados.", points: 2.5 },
      { value: "d", text: "Desenvolvo dashboards com DAX, filtros e visualizações interativas.", points: 3.7 },
      { value: "e", text: "Integro múltiplas fontes de dados e compartilho relatórios para tomada de decisão.", points: 5.0 }
    ]
  },
  {
    id: 5,
    question: "Power Automate",
    options: [
      { value: "a", text: "Nunca ouvi falar sobre essa ferramenta", points: 0.0 },
      { value: "b", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { value: "c", text: "Testei fluxos simples, como alertas ou aprovações.", points: 2.5 },
      { value: "d", text: "Automatizei processos reais do meu trabalho.", points: 3.7 },
      { value: "e", text: "Crio fluxos conectando múltiplas ferramentas e oriento colegas.", points: 5.0 }
    ]
  },
  {
    id: 6,
    question: "SharePoint",
    options: [
      { value: "a", text: "Nunca acessei ao SharePoint.", points: 0.0 },
      { value: "b", text: "Já acessei páginas ou documentos, mas com uso pontual.", points: 1.0 },
      { value: "c", text: "Participo de equipes e bibliotecas compartilhadas.", points: 2.5 },
      { value: "d", text: "Organizo conteúdos, permissões e estrutura de sites.", points: 3.7 },
      { value: "e", text: "Administro ambientes SharePoint com fluxos, listas e integrações.", points: 5.0 }
    ]
  },
  {
    id: 7,
    question: "Power Apps",
    options: [
      { value: "a", text: "Ainda não ouvi falar sobre a ferramenta.", points: 0.0 },
      { value: "b", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { value: "c", text: "Já explorei aplicativos prontos ou modelos.", points: 2.5 },
      { value: "d", text: "Criei apps simples para uso interno ou pessoal.", points: 3.7 },
      { value: "e", text: "Desenvolvo e publico aplicativos integrados com dados e processos da equipe.", points: 5.0 }
    ]
  },
  {
    id: 8,
    question: "Banco de Dados / SQL",
    options: [
      { value: "a", text: "Nunca tive contato com banco de dados/SQL.", points: 0.0 },
      { value: "b", text: "Já ouvi falar e tenho interesse em aprender mais.", points: 1.0 },
      { value: "c", text: "Já fiz consultas simples (SELECT, filtros, joins básicos).", points: 2.5 },
      { value: "d", text: "Realizo análises com queries intermediárias e múltiplas tabelas.", points: 3.7 },
      { value: "e", text: "Crio estruturas, mantenho bases e otimizações com SQL avançado.", points: 5.0 }
    ]
  },
  {
    id: 9,
    question: "Access",
    options: [
      { value: "a", text: "Nunca ouvi falar dessa ferramenta.", points: 0.0 },
      { value: "b", text: "Já abri arquivos Access, mas não utilizei ativamente.", points: 1.0 },
      { value: "c", text: "Entendo a estrutura de tabelas e relações.", points: 2.5 },
      { value: "d", text: "Crio formulários, consultas e relatórios simples.", points: 3.7 },
      { value: "e", text: "Desenvolvo bancos relacionais e soluções personalizadas.", points: 5.0 }
    ]
  },
  {
    id: 10,
    question: "ChatGPT / IA",
    options: [
      { value: "a", text: "Ainda não conheço nenhuma ferramenta de IA.", points: 0.0 },
      { value: "b", text: "Ainda não faz parte do meu dia a dia, mas já experimentei pelo menos uma IA.", points: 1.0 },
      { value: "c", text: "Uso para consultas ou inspiração.", points: 2.5 },
      { value: "d", text: "Aplico com foco em produtividade real.", points: 3.7 },
      { value: "e", text: "Crio fluxos ou soluções que combinam IA com outras ferramentas.", points: 5.0 }
    ]
  }
];

export const MissaoQuatro = ({ onComplete }: MissaoQuatroProps) => {
  const { profile, user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total score
      let totalScore = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.points;
        }
      });

      // Get user info from auth context
      const currentUser = {
        nome: profile?.nome || 'Usuário',
        email: profile?.email || 'email@exemplo.com'
      };

      // Save responses to mission 4 table with user_id
      if (!user?.id) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      await supabase
        .from('respostas_missao4')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || 'email@exemplo.com',
          user_id: user.id,
          respostas: {
            answers: answers,
            totalScore: totalScore
          }
        });

      // Update user progress to mark mission 4 as completed and add XP
      if (user) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProgress) {
          await supabase
            .from('user_progress')
            .update({
              missao_4_completed: true,
              total_xp: (existingProgress.total_xp || 0) + 25
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              missao_4_completed: true,
              total_xp: 25
            });
        }
      }

      toast({
        title: "Medalha conquistada: Conhecedor de ferramentas",
      });
      onComplete();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar respostas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="h-full flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="w-full max-w-4xl mx-auto p-4 pb-20" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 56px)' }}>
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </span>
              </div>
              
              <Progress value={progress} className="w-full h-2 mb-3" />
              
              <CardTitle className="text-lg font-bold text-primary">
                {currentQ.id}. {currentQ.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="sticky top-0 z-[10000] bg-card/90 backdrop-blur-sm border-b border-secondary/30 py-2 px-1 flex justify-between items-center pointer-events-auto shadow-neon" role="toolbar">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                  disabled={currentQuestion === 0}
                  size="sm"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  Anterior
                </Button>
                {isLastQuestion ? (
                  <Button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                    disabled={!currentAnswer || isSubmitting}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Enviando..." : "Finalizar"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={!currentAnswer}
                    className="w-24"
                  >
                    Próxima
                  </Button>
                )}
              </div>
              <RadioGroup 
                value={currentAnswer || ""} 
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-4"
              >
                {currentQ.options.map((option) => (
                  <div 
                    key={option.value} 
                    className="flex items-start space-x-3 p-3 rounded-lg border border-secondary/30 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${currentQ.id}-${option.value}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`${currentQ.id}-${option.value}`}
                      className="flex-1 text-base md:text-sm leading-relaxed cursor-pointer"
                    >
                      <span className="font-semibold text-primary mr-2">
                        {option.value.toUpperCase()})
                      </span>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};