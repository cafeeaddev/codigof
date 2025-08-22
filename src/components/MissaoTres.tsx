import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useMissionQuestions } from '@/hooks/useMissionQuestions';


interface MissaoTresProps {
  onComplete: () => void;
}

export const MissaoTres = ({ onComplete }: MissaoTresProps) => {
  const { user: authUser, profile } = useAuth();
  const { questions, isLoading: questionsLoading, error: questionsError } = useMissionQuestions(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  

  // Carregar progresso inicial
  useEffect(() => {
    const loadProgress = async () => {
      const userId = authUser?.id;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('missao_3_current_question, missao_3_answers, missao_3_completed')
          .eq('user_id', userId)
          .maybeSingle();

        if (progress) {
          setCurrentQuestion(Math.max(0, (progress.missao_3_current_question || 1) - 1));
          setAnswers((progress.missao_3_answers as Record<number, string>) || {});
          setIsCompleted(progress.missao_3_completed || false);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!questionsLoading) {
      loadProgress();
    }
  }, [authUser, questionsLoading]);

  const handleAnswerSelect = (questionId: number, optionLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const currentUserId = authUser?.id;

      if (!currentUserId) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se todas as perguntas foram respondidas
      const unansweredQuestions = questions.filter(q => !answers[q.id]);
      if (unansweredQuestions.length > 0) {
        toast({
          title: "Perguntas não respondidas",
          description: `Você ainda precisa responder ${unansweredQuestions.length} pergunta(s).`,
          variant: "destructive"
        });
        return;
      }

      // Preparar dados das respostas
      const responseData = questions.map(question => {
        const selectedAnswer = answers[question.id];
        const points = question.options.find(opt => opt.option_letter === selectedAnswer)?.points || 0;
        
        return {
          questionId: question.id,
          question: question.question_text,
          selectedAnswer,
          selectedText: question.options.find(opt => opt.option_letter === selectedAnswer)?.option_text || '',
          points
        };
      });

      // Salvar respostas na tabela de respostas
      const { error: responseError } = await supabase
        .from('respostas_missao3')
        .insert({
          user_id: currentUserId,
          nome: profile?.nome || 'Nome não informado',
          email: profile?.email || 'Email não informado',
          respostas: responseData
        });

      if (responseError) throw responseError;

      // Buscar progresso existente para calcular XP corretamente
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      const currentXP = existingProgress?.total_xp || 0;

      // Atualizar progresso do usuário
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          missao_3_completed: true,
          total_xp: currentXP + 25, // Adicionar 25 XP da missão 3
          missao_3_current_question: currentQuestion + 1,
          missao_3_answers: answers,
          last_saved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (progressError) throw progressError;

      setIsCompleted(true);
      
      console.log("[MISSAO3] Triggering medal toast with correct text");
      toast({
        title: "Medalha conquistada: Estrela",
        description: "Você dominou uma estrela. Brilho de um verdadeiro mestre!",
        duration: 6000,
        className: "medal-toast-mission3",
      });
      console.log("[MISSAO3] Medal toast triggered successfully");

      onComplete();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Erro ao enviar quiz",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questionsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar perguntas: {questionsError}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p>Nenhuma pergunta disponível para esta missão.</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex flex-col max-w-4xl mx-auto w-full p-3 pb-[calc(100px+env(safe-area-inset-bottom,0px))] min-h-full">
          {/* Progress Header - mais compacto */}
          <div className="mb-4 sticky top-0 bg-background z-10 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
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
                  {currentQuestionData.question_text}
                </h3>

                <RadioGroup
                  value={answers[currentQuestionData.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
                  className="space-y-0.5"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.option_letter} 
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-colors duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.option_letter)}
                    >
                      <RadioGroupItem
                        value={option.option_letter}
                        id={`${currentQuestionData.id}-${option.option_letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`${currentQuestionData.id}-${option.option_letter}`}
                        className="text-xs md:text-sm text-foreground cursor-pointer flex-1 leading-relaxed"
                      >
                        <span className="font-medium mr-2">{option.option_letter})</span>
                        {option.option_text}
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
      <div 
        className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary/30 z-[100]"
        style={{ 
          minHeight: '90px',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4 px-4 py-4 h-full">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting || isCompleted || !answers[currentQuestionData.id]}
              className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={!answers[currentQuestionData.id]}
              className="flex items-center space-x-2 min-w-[120px] h-12 text-base font-medium bg-primary hover:bg-primary/90"
            >
              <span>Próxima</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

    </div>
  );
};