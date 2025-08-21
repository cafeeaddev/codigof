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
import { useMissionQuestions } from '@/hooks/useMissionQuestions';


interface QuizQuestion {
  id: number;
  question: string;
  options: {
    letter: string;
    text: string;
    points: number;
  }[];
}


interface QuizDigitalProps {
  onClose: () => void;
  userId?: string;
}

export const QuizDigital = ({ onClose, userId }: QuizDigitalProps) => {
  const { user: authUser, profile } = useAuth();
  const { questions: dbQuestions, isLoading: questionsLoading } = useMissionQuestions(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Converter dados do banco para o formato do QuizDigital
  const quizQuestions: QuizQuestion[] = dbQuestions.map(q => ({
    id: q.id,
    question: q.question_text,
    options: q.options.map(opt => ({
      letter: opt.option_letter,
      text: opt.option_text,
      points: Number(opt.points)
    }))
  }));

  // Carregar progresso salvo ao iniciar
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const currentUserId = authUser?.id || userId;
        console.log('[QuizDigital] Loading progress for userId:', currentUserId);
        
        if (currentUserId && !questionsLoading && quizQuestions.length > 0) {
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
        title: "Medalha conquistada: Satélite",
        description: "Você lançou seu primeiro satélite. A jornada começou!"
      });
      onClose();


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

  if (isLoading || questionsLoading || quizQuestions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-spin">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Carregando quiz...</p>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  
  // Verificação adicional para garantir que currentQuestionData existe
  if (!currentQuestionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
        <p className="text-sm text-muted-foreground">Erro ao carregar pergunta atual.</p>
        <Button onClick={() => setCurrentQuestion(0)} variant="outline">
          Voltar ao início
        </Button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizQuestions.length) * 100;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex flex-col max-w-4xl mx-auto w-full p-3 pb-24 min-h-full">
          {/* Progress Header */}
          <div className="mb-3 sticky top-0 bg-background z-10 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Pergunta {currentQuestion + 1} de {quizQuestions.length}
              </span>
            </div>
            
            {/* Progress Bar with gradient */}
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="flex-1 min-h-0">
            <Card className="border shadow-sm">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-base md:text-lg font-medium text-foreground mb-4 leading-relaxed">
                  {currentQuestionData.question}
                </h3>

                <RadioGroup
                  value={answers[currentQuestionData.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.letter} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-colors duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.letter)}
                    >
                      <RadioGroupItem
                        value={option.letter}
                        id={`q${currentQuestionData.id}-${option.letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${currentQuestionData.id}-${option.letter}`}
                        className="text-sm md:text-base text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-medium mr-2">{option.letter})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Navigation Buttons */}
      <div className="border-t bg-background p-4 mt-auto">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <Button
            type="button"
            onClick={() => goToPreviousQuestion()}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex items-center space-x-2 min-w-[100px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          {currentQuestion === quizQuestions.length - 1 ? (
            <Button
              type="button"
              onClick={() => submitQuiz()}
              disabled={!answers[currentQuestionData.id] || isSubmitting}
              className="flex items-center space-x-2 min-w-[100px]"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => goToNextQuestion()}
              disabled={!answers[currentQuestionData.id]}
              className="flex items-center space-x-2 min-w-[100px]"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};