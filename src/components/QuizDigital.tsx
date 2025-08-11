import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
    question: "Quando uma nova ferramenta digital é lançada na empresa, você...",
    options: [
      { letter: "A", text: "Prefiro esperar orientações ou alguém usar primeiro antes de se envolver.", points: 0.0 },
      { letter: "B", text: "Me sinto inseguro, Gosta de entender como aquilo se conecta com o que já conhece.", points: 1.0 },
      { letter: "C", text: "Explora por conta própria para ver se tem utilidade.", points: 2.5 },
      { letter: "D", text: "Aplica em alguma tarefa e vê na prática se vale a pena.", points: 3.7 },
      { letter: "E", text: "Avalia se a novidade pode contribuir para processos mais consistentes no time.", points: 5.0 }
    ]
  },
  {
    id: 2,
    question: "Ao ajudar um colega com uma ferramenta que você já usou...",
    options: [
      { letter: "A", text: "Nunca ajudei, geralmente prefiro que outra pessoa mais experiente oriente.", points: 0.0 },
      { letter: "B", text: "Tenta entender a dúvida e sugere um caminho para seguir.", points: 1.0 },
      { letter: "C", text: "Mostra rapidamente como você costuma usar e incentiva ele a tentar.", points: 2.5 },
      { letter: "D", text: "Explica detalhadamente, adaptando à necessidade específica dele.", points: 3.7 },
      { letter: "E", text: "Cria um guia ou template que pode ajudar não só ele, mas outros colegas.", points: 5.0 }
    ]
  },
  {
    id: 3,
    question: "Quando precisa aprender algo novo e complexo...",
    options: [
      { letter: "A", text: "Fico um pouco travado no início e espero alguém mostrar como começar.", points: 0.0 },
      { letter: "B", text: "Procura alguém que já fez e tenta entender como aplicou.", points: 1.0 },
      { letter: "C", text: "Assiste vídeos, lê artigos e testa por conta própria.", points: 2.5 },
      { letter: "D", text: "Aplica direto em um projeto real para aprender fazendo.", points: 3.7 },
      { letter: "E", text: "Aprende, aplica e adapta para que outros também possam usar.", points: 5.0 }
    ]
  },
  {
    id: 4,
    question: "Sobre ferramentas de IA como ChatGPT ou Copilot:",
    options: [
      { letter: "A", text: "Já ouvi falar, mas ainda não explorei por não saber exatamente como começar.", points: 0.0 },
      { letter: "B", text: "Ainda está conhecendo e prefere observar como outros usam.", points: 1.0 },
      { letter: "C", text: "Já experimentou para tarefas simples ou gerar ideias.", points: 2.5 },
      { letter: "D", text: "Usa regularmente para otimizar tarefas do seu trabalho.", points: 3.7 },
      { letter: "E", text: "Integra em processos importantes e compartilha métodos eficientes com o time.", points: 5.0 }
    ]
  }
];

interface QuizDigitalProps {
  onClose: () => void;
  userId?: string;
}

export const QuizDigital = ({ onClose, userId }: QuizDigitalProps) => {
  const { user: authUser, profile } = useAuth();
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
        console.log('[QuizDigital] Loading progress for userId:', currentUserId);
        
        if (currentUserId) {
          const { data: progress, error } = await supabase
            .from('user_progress')
            .select('missao_1_current_question, missao_1_answers')
            .eq('user_id', currentUserId)
            .maybeSingle();

          console.log('[QuizDigital] Loaded progress data:', progress, 'error:', error);
          
          if (progress) {
            const questionIndex = (progress.missao_1_current_question as number) - 1;
            const savedAnswers = (progress.missao_1_answers as Record<number, string>) || {};
            console.log('[QuizDigital] Setting question to:', questionIndex, 'answers:', savedAnswers);
            setCurrentQuestion(questionIndex);
            setAnswers(savedAnswers);
          }
        } else {
          console.log('[QuizDigital] No userId available for loading progress');
        }
      } catch (error) {
        console.error('[QuizDigital] Error loading quiz progress:', error);
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
      console.log('[QuizDigital] Saving progress for userId:', currentUserId, 'question:', questionIndex + 1, 'answers:', newAnswers);
      
      if (currentUserId) {
        const { data, error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: currentUserId,
            missao_1_current_question: questionIndex + 1,
            missao_1_answers: newAnswers
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('[QuizDigital] Error saving quiz progress:', error);
        } else {
          console.log('[QuizDigital] Progress saved successfully:', data);
        }
      } else {
        console.log('[QuizDigital] No userId found, cannot save progress');
      }
    } catch (error) {
      console.error('[QuizDigital] Error saving progress:', error);
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

      // Get user info from auth context
      const currentUser = {
        nome: profile?.nome || 'Usuário',
        email: profile?.email || authUser?.email || 'email@exemplo.com'
      };

      // Insert response record with user_id
      const currentUserId = authUser?.id || userId;
      if (!currentUserId) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('respostas')
        .insert({
          nome: profile?.nome || 'Usuário',
          email: profile?.email || authUser?.email || 'email@exemplo.com',
          user_id: currentUserId,
          respostas: responsesData
        });

      if (error) {
        console.error('Error saving quiz responses:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar suas respostas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Update user progress and add XP
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
              missao_1_completed: true,
              total_xp: existingProgress.total_xp + 25
            })
            .eq('user_id', currentUserId);
        } else {
          await supabase
            .from('user_progress')
            .insert({
              user_id: currentUserId,
              missao_1_completed: true,
              total_xp: 25
            });
        }
      }

      setIsCompleted(true);
      toast({
        title: "Missão 1 concluída! +25 XP",
        description: "Passando para a Missão 2...",
      });

      // Automatically progress to mission 2 after a delay
      setTimeout(() => {
        onClose(); // This will trigger showing mission 2
      }, 2000);

    } catch (error) {
      console.error('Error submitting quiz:', error);
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
            Quiz Concluído!
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
        <div className="p-2 pb-12">

          <div className="mb-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">
                Pergunta {currentQuestion + 1} de {quizQuestions.length}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-0.5">
              <div
                className="bg-primary h-0.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-2">
            <h4 className="text-sm font-medium text-foreground mb-1">
              {currentQuestionData.question}
            </h4>

            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
              className="space-y-2"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.letter} className="flex items-start space-x-2 p-1 rounded hover:bg-muted/20 cursor-pointer" onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}>
                  <RadioGroupItem
                    value={option.letter}
                    id={`q${currentQuestionData.id}-${option.letter}`}
                    className="border-secondary mt-0.5"
                  />
                  <Label
                    htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                    className="text-xs text-foreground cursor-pointer flex-1 leading-snug"
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
      
      <div className="flex justify-between p-2 border-t border-secondary/30 bg-background">
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
            {isSubmitting ? 'Enviando...' : 'Finalizar'}
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