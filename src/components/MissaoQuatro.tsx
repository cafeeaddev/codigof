import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface MissaoQuatroProps {
  onComplete: () => void;
}

const questions = [
  {
    id: 1,
    question: "Word",
    options: [
      { letter: "A", text: "Uso o Word para o básico, como escrever textos simples.", points: 0.0 },
      { letter: "B", text: "Uso para textos simples, como cartas e relatórios curtos.", points: 1.0 },
      { letter: "C", text: "Sei usar estilos, sumário automático e recursos de formatação mais avançados.", points: 2.5 },
      { letter: "D", text: "Utilizo recursos como mala direta, controle de alterações e formatação corporativa.", points: 3.7 },
      { letter: "E", text: "Crio modelos profissionais, configurando normas e recursos avançados para equipes.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "PowerPoint",
    options: [
      { letter: "A", text: "Consigo fazer apresentações simples", points: 0.0 },
      { letter: "B", text: "Crio apresentações com textos e imagens.", points: 1.0 },
      { letter: "C", text: "Uso animações, transições e layouts personalizados.", points: 2.5 },
      { letter: "D", text: "Desenvolvo apresentações estruturadas para reuniões, com vídeos e gráficos.", points: 3.7 },
      { letter: "E", text: "Crio templates institucionais, apresentações narrativas e visual storytelling.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Excel",
    options: [
      { letter: "A", text: "Uso o Excel para tarefas simples, como organizar dados sem usar fórmulas.", points: 0.0 },
      { letter: "B", text: "Conheço fórmulas básicas e formatação de tabelas.", points: 1.0 },
      { letter: "C", text: "Uso funções intermediárias, filtros, gráficos e validações.", points: 2.5 },
      { letter: "D", text: "Crio dashboards com PROC/VLOOKUP, tabelas dinâmicas e Power Query.", points: 3.7 },
      { letter: "E", text: "Desenvolvo modelos automatizados, macros e soluções para múltiplos usuários.", points: 5.0 }
    ]
  },
  {
    id: 4,
    question: "Power BI",
    options: [
      { letter: "A", text: "Já ouvi falar do Power BI, mas ainda não usei nem explorei a ferramenta.", points: 0.0 },
      { letter: "B", text: "Conheço o nome ou assisti apresentações feitas com ele.", points: 1.0 },
      { letter: "C", text: "Já criei relatórios simples com dados importados.", points: 2.5 },
      { letter: "D", text: "Desenvolvo dashboards com DAX, filtros e visualizações interativas.", points: 3.7 },
      { letter: "E", text: "Integro múltiplas fontes de dados e compartilho relatórios para tomada de decisão.", points: 5.0 }
    ]
  },
  {
    id: 5,
    question: "Power Automate",
    options: [
      { letter: "A", text: "Nunca ouvi falar sobre essa ferramenta", points: 0.0 },
      { letter: "B", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { letter: "C", text: "Testei fluxos simples, como alertas ou aprovações.", points: 2.5 },
      { letter: "D", text: "Automatizei processos reais do meu trabalho.", points: 3.7 },
      { letter: "E", text: "Crio fluxos conectando múltiplas ferramentas e oriento colegas.", points: 5.0 }
    ]
  },
  {
    id: 6,
    question: "SharePoint",
    options: [
      { letter: "A", text: "Nunca acessei ao SharePoint.", points: 0.0 },
      { letter: "B", text: "Já acessei páginas ou documentos, mas com uso pontual.", points: 1.0 },
      { letter: "C", text: "Participo de equipes e bibliotecas compartilhadas.", points: 2.5 },
      { letter: "D", text: "Organizo conteúdos, permissões e estrutura de sites.", points: 3.7 },
      { letter: "E", text: "Administro ambientes SharePoint com fluxos, listas e integrações.", points: 5.0 }
    ]
  },
  {
    id: 7,
    question: "Power Apps",
    options: [
      { letter: "A", text: "Ainda não ouvi falar sobre a ferramenta.", points: 0.0 },
      { letter: "B", text: "Nunca usei ou só ouvi falar.", points: 1.0 },
      { letter: "C", text: "Já explorei aplicativos prontos ou modelos.", points: 2.5 },
      { letter: "D", text: "Criei apps simples para uso interno ou pessoal.", points: 3.7 },
      { letter: "E", text: "Desenvolvo e publico aplicativos integrados com dados e processos da equipe.", points: 5.0 }
    ]
  },
  {
    id: 8,
    question: "Banco de Dados / SQL",
    options: [
      { letter: "A", text: "Nunca tive contato com banco de dados/SQL.", points: 0.0 },
      { letter: "B", text: "Já ouvi falar e tenho interesse em aprender mais.", points: 1.0 },
      { letter: "C", text: "Já fiz consultas simples (SELECT, filtros, joins básicos).", points: 2.5 },
      { letter: "D", text: "Realizo análises com queries intermediárias e múltiplas tabelas.", points: 3.7 },
      { letter: "E", text: "Crio estruturas, mantenho bases e otimizações com SQL avançado.", points: 5.0 }
    ]
  },
  {
    id: 9,
    question: "ChatGPT / IA",
    options: [
      { letter: "A", text: "Ainda não conheço nenhuma ferramenta de IA.", points: 0.0 },
      { letter: "B", text: "Ainda não faz parte do meu dia a dia, mas já experimentei pelo menos uma IA.", points: 1.0 },
      { letter: "C", text: "Uso para consultas ou inspiração.", points: 2.5 },
      { letter: "D", text: "Aplico com foco em produtividade real.", points: 3.7 },
      { letter: "E", text: "Crio fluxos ou soluções que combinam IA com outras ferramentas.", points: 5.0 }
    ]
  }
];

export const MissaoQuatro = ({ onComplete }: MissaoQuatroProps) => {
  const { profile, user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
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
        const option = question?.options.find(opt => opt.letter === answer);
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
        title: "Medalha conquistada: Galáxia",
        description: "Você explorou uma galáxia inteira. Imensidão sob controle!"
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

  const currentQuestionData = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="h-full flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="p-2 pb-28" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-base font-medium text-foreground mb-4">
              {currentQuestionData.question}
            </h4>

            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
              className="space-y-3"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.letter} className="flex items-start space-x-2 p-3 md:p-2 rounded hover:bg-muted/20 cursor-pointer" onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}>
                  <RadioGroupItem
                    value={option.letter}
                    id={`q${currentQuestionData.id}-${option.letter}`}
                    className="border-secondary mt-0.5 h-5 w-5 md:h-4 md:w-4"
                  />
                  <Label
                    htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                    className="text-base md:text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                  >
                    <span className="font-medium text-primary mr-1">{option.letter})</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-4 pt-2 flex justify-between items-center">
              <Button
                type="button"
                onClick={() => goToPreviousQuestion()}
                disabled={currentQuestion === 0}
                variant="outline"
                size="sm"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Anterior
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => submitQuiz()}
                  disabled={!answers[currentQuestionData.id] || isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Enviando...' : 'Finalizar Missão 4'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => goToNextQuestion()}
                  disabled={!answers[currentQuestionData.id]}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Próxima
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};