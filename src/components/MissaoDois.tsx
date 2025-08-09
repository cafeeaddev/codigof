import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    letter: string;
    text: string;
    points: number;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Quando percebe uma tarefa repetitiva no trabalho...",
    options: [
      { letter: "A", text: "Costuma repetir manualmente, já que é algo rápido e está habituado a fazer assim.", points: 0.0 },
      { letter: "B", text: "Mantém como está, se for algo simples de repetir.", points: 1.0 },
      { letter: "C", text: "Usa fórmulas ou modelos prontos para agilizar.", points: 2.5 },
      { letter: "D", text: "Cria uma automação básica para facilitar o processo.", points: 3.7 },
      { letter: "E", text: "Estrutura soluções reutilizáveis que outros também possam aplicar.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "Ao lidar com dados e relatórios:",
    options: [
      { letter: "A", text: "Prefiro acompanhar análises feitas por colegas antes de tirar minhas conclusões.", points: 0.0 },
      { letter: "B", text: "Prefere acompanhar análises feitas por colegas, mas tento entender o básico para ajudar.", points: 1.0 },
      { letter: "C", text: "Monta gráficos ou tabelas para tomar decisões do dia a dia.", points: 2.5 },
      { letter: "D", text: "Cria dashboards úteis com base em dados relevantes.", points: 3.7 },
      { letter: "E", text: "Integra diferentes fontes de dados para apoiar decisões coletivas.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Diante de um curso online novo que amplie seu conhecimento técnico ou tecnologia:",
    options: [
      { letter: "A", text: "Prefiro esperar até realmente precisar para começar a fazer.", points: 0.0 },
      { letter: "B", text: "Guarda para fazer quando surgir uma necessidade específica.", points: 1.0 },
      { letter: "C", text: "Explora os tópicos que parecem mais úteis no momento.", points: 2.5 },
      { letter: "D", text: "Conclui o curso e aplica o que aprendeu em suas tarefas.", points: 3.7 },
      { letter: "E", text: "Além de fazer, discute os aprendizados com colegas para multiplicar o conhecimento.", points: 5.0 }
    ]
  }
];

interface MissaoDoisProps {
  onComplete: () => void;
  userId?: string;
}

export const MissaoDois = ({ onComplete, userId }: MissaoDoisProps) => {
  const { user: authUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar progresso salvo ao iniciar
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const currentUserId = authUser?.id || userId;
        console.log('[MissaoDois] Loading progress for userId:', currentUserId);
        
        if (currentUserId) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('missao_2_current_question, missao_2_answers')
            .eq('user_id', currentUserId)
            .maybeSingle();

          console.log('[MissaoDois] Loaded progress:', progress);
          if (progress) {
            setCurrentQuestion((progress.missao_2_current_question as number) - 1);
            setAnswers((progress.missao_2_answers as Record<number, string>) || {});
          }
        } else {
          console.log('[MissaoDois] No userId available for loading progress');
        }
      } catch (error) {
        console.error('[MissaoDois] Error loading mission 2 progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [authUser, userId]);

  // Salvar progresso quando resposta for selecionada
  const saveProgress = async (questionIndex: number, newAnswers: Record<number, string>) => {
    try {
      const currentUserId = authUser?.id || userId;
      console.log('[MissaoDois] Saving progress for userId:', currentUserId, 'question:', questionIndex + 1);
      
      if (currentUserId) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: currentUserId,
            missao_2_current_question: questionIndex + 1,
            missao_2_answers: newAnswers
          }, {
            onConflict: 'user_id'
          });
        console.log('[MissaoDois] Progress saved successfully');
      } else {
        console.log('[MissaoDois] No userId found, cannot save progress');
      }
    } catch (error) {
      console.error('[MissaoDois] Error saving mission 2 progress:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: optionLetter
    };
    setAnswers(newAnswers);
    saveProgress(currentQuestion, newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== quizQuestions.length) {
      toast({
        title: "Quiz incompleto",
        description: "Por favor, responda todas as perguntas antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare responses as JSON string
      const responsesData = quizQuestions.map(question => {
        const selectedOption = answers[question.id];
        const option = question.options.find(opt => opt.letter === selectedOption);
        
        return {
          pergunta: question.id,
          resposta: selectedOption,
          pontuacao: option?.points || 0
        };
      });

      // Get user info from localStorage or context (since we're using profile-based auth)
      const currentUser = {
        nome: 'Nawana De Oliveira Marques Dos Santos',
        email: 'nawana.santos@forvismazars.com'
      };

      // Insert response record for mission 2
      const { error } = await supabase
        .from('respostas_missao2')
        .insert({
          nome: currentUser.nome,
          email: currentUser.email,
          respostas: {
            missao: 2,
            data: responsesData
          }
        });

      if (error) {
        console.error('Error saving mission 2 responses:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar suas respostas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Update user progress and add XP
      const currentUserId = authUser?.id || userId;
      if (currentUserId) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (existingProgress) {
          await supabase
            .from('user_progress')
            .update({
              missao_2_completed: true,
              total_xp: existingProgress.total_xp + 25
            })
            .eq('user_id', currentUserId);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: currentUserId,
              missao_2_completed: true,
              total_xp: 25
            });
        }
      }

      setIsCompleted(true);
      toast({
        title: "Missão 2 concluída! +25 XP",
        description: "Parabéns! Suas respostas foram salvas.",
      });

      // Automatically complete after a delay
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error submitting mission 2 quiz:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-spin">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Carregando progresso...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h4 className="text-lg font-bold text-primary mb-1">
            Missão 2 Concluída!
          </h4>
          <p className="text-sm text-muted-foreground">
            Suas respostas foram salvas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground mb-1">O digital no seu dia a dia</h3>
            <p className="text-sm text-muted-foreground">Missão 2 - Avalie suas práticas digitais</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Pergunta {currentQuestion + 1} de {quizQuestions.length}
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
              className="space-y-2"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.letter} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/20">
                  <RadioGroupItem
                    value={option.letter}
                    id={`q${currentQuestionData.id}-${option.letter}`}
                    className="border-secondary mt-0.5"
                  />
                  <Label
                    htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                    className="text-xs text-foreground cursor-pointer flex-1 leading-relaxed"
                  >
                    <span className="font-medium text-primary mr-1">{option.letter})</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>
      
      <div className="flex justify-between p-4 pt-2 border-t border-secondary/30 bg-background">
        <Button
          onClick={goToPreviousQuestion}
          disabled={currentQuestion === 0}
          variant="outline"
          size="sm"
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          Anterior
        </Button>

        {currentQuestion === quizQuestions.length - 1 ? (
          <Button
            onClick={submitQuiz}
            disabled={!answers[currentQuestionData.id] || isSubmitting}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar Missão 2'}
          </Button>
        ) : (
          <Button
            onClick={goToNextQuestion}
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
  );
};