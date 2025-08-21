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

interface MissaoDoisProps {
  onComplete: () => void;
  userId?: string;
}

export const MissaoDois = ({ onComplete, userId }: MissaoDoisProps) => {
  const { user: authUser, profile } = useAuth();
  const { questions, isLoading: questionsLoading, error: questionsError } = useMissionQuestions(2);
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
            .select('*')
            .eq('user_id', currentUserId)
            .maybeSingle();

          if (progress) {
            console.log('[MissaoDois] Progress loaded:', progress);
            setCurrentQuestion(progress.missao_2_current_question || 0);
            setAnswers((progress.missao_2_answers as Record<number, string>) || {});
            setIsCompleted(progress.missao_2_completed || false);
          }
        }
      } catch (error) {
        console.error('[MissaoDois] Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!questionsLoading) {
      loadProgress();
    }
  }, [authUser?.id, userId, questionsLoading]);

  // Salvar progresso automaticamente
  const saveProgress = async () => {
    try {
      const currentUserId = authUser?.id || userId;
      if (!currentUserId) return;

      console.log('[MissaoDois] Saving progress:', {
        currentQuestion,
        answers,
        userId: currentUserId
      });

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          missao_2_current_question: currentQuestion,
          missao_2_answers: answers,
          last_saved_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('[MissaoDois] Progress saved successfully');
    } catch (error) {
      console.error('[MissaoDois] Error saving progress:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    console.log('[MissaoDois] Answer selected:', { questionId, answer });
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    saveProgress();
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
      const currentUserId = authUser?.id || userId;

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

      console.log('[MissaoDois] Submitting quiz:', responseData);

      // Buscar informações do perfil
      const userProfile = profile || (await supabase
        .from('profiles')
        .select('nome, email')
        .eq('user_id', currentUserId)
        .maybeSingle()).data;

      if (!userProfile) {
        throw new Error('Profile not found');
      }

      // Salvar respostas na tabela de respostas
      const { error: responseError } = await supabase
        .from('respostas_missao2')
        .insert({
          user_id: currentUserId,
          nome: userProfile.nome || 'Nome não informado',
          email: userProfile.email || 'Email não informado',
          respostas: responseData
        });

      if (responseError) throw responseError;

      // Atualizar progresso do usuário - marcar missão 2 como completada e dar XP
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          missao_2_completed: true,
          total_xp: 125, // XP acumulado (100 missão 1 + 25 missão 2)
          missao_2_current_question: currentQuestion,
          missao_2_answers: answers,
          last_saved_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      setIsCompleted(true);
      
      toast({
        title: "Práticas Digitais concluída!",
        description: "Você ganhou 25 XP. Parabéns!",
      });

      onComplete();
    } catch (error) {
      console.error('[MissaoDois] Error submitting quiz:', error);
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
        <div className="flex flex-col max-w-4xl mx-auto w-full p-3 pb-20 min-h-full">
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Práticas Digitais Concluída!</h3>
                <p className="text-green-700">Você completou todas as perguntas com sucesso.</p>
              </div>
            </div>
          )}

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
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option) => (
                    <div 
                      key={option.option_letter} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-purple-500/20 cursor-pointer transition-colors duration-200" 
                      onClick={() => handleAnswerSelect(currentQuestionData.id, option.option_letter)}
                    >
                      <RadioGroupItem
                        value={option.option_letter}
                        id={`${currentQuestionData.id}-${option.option_letter}`}
                        className="mt-1 h-4 w-4"
                      />
                      <Label
                        htmlFor={`${currentQuestionData.id}-${option.option_letter}`}
                        className="text-sm md:text-base text-foreground cursor-pointer flex-1 leading-relaxed"
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
      <div className="border-t bg-background p-4 mt-auto">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 min-w-[100px]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting || isCompleted || !answers[currentQuestionData.id]}
              className="flex items-center space-x-2 min-w-[100px]"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={!answers[currentQuestionData.id]}
              className="flex items-center space-x-2 min-w-[100px]"
            >
              <span>Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};