import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useMissionQuestions } from '@/hooks/useMissionQuestions';

interface MissaoUmProps {
  onComplete: () => void;
  userId?: string;
}

export const MissaoUm = ({ onComplete, userId }: MissaoUmProps) => {
  const { user: authUser, profile } = useAuth();
  const { questions, isLoading: questionsLoading, error: questionsError } = useMissionQuestions(1);
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
        console.log('[MissaoUm] Loading progress for userId:', currentUserId);
        
        if (currentUserId) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', currentUserId)
            .maybeSingle();

          if (progress) {
            console.log('[MissaoUm] Progress loaded:', progress);
            setCurrentQuestion(progress.missao_1_current_question || 0);
            setAnswers((progress.missao_1_answers as Record<number, string>) || {});
            setIsCompleted(progress.missao_1_completed || false);
          }
        }
      } catch (error) {
        console.error('[MissaoUm] Error loading progress:', error);
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

      console.log('[MissaoUm] Saving progress:', {
        currentQuestion,
        answers,
        userId: currentUserId
      });

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          missao_1_current_question: currentQuestion,
          missao_1_answers: answers,
          last_saved_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('[MissaoUm] Progress saved successfully');
    } catch (error) {
      console.error('[MissaoUm] Error saving progress:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    console.log('[MissaoUm] Answer selected:', { questionId, answer });
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

      console.log('[MissaoUm] Submitting quiz:', responseData);

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
        .from('respostas')
        .insert({
          user_id: currentUserId,
          nome: userProfile.nome || 'Nome não informado',
          email: userProfile.email || 'Email não informado',
          respostas: responseData
        });

      if (responseError) throw responseError;

      // Atualizar progresso do usuário - marcar missão 1 como completada e dar XP
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          missao_1_completed: true,
          total_xp: 100, // XP por completar missão 1
          missao_1_current_question: currentQuestion,
          missao_1_answers: answers,
          last_saved_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      setIsCompleted(true);
      
      toast({
        title: "Quiz Digital concluído!",
        description: "Você ganhou 100 XP. Parabéns!",
      });

      onComplete();
    } catch (error) {
      console.error('[MissaoUm] Error submitting quiz:', error);
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Quiz Digital Concluído!</h3>
            <p className="text-green-700">Você completou todas as perguntas com sucesso.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quiz Digital - Missão 1</h2>
          <div className="text-sm text-muted-foreground">
            Pergunta {currentQuestion + 1} de {questions.length}
          </div>
        </div>

        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-6 pr-4">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-medium mb-4">
              {currentQuestionData.question_text}
            </h3>

            <RadioGroup 
              value={answers[currentQuestionData.id] || ''} 
              onValueChange={(value) => handleAnswerSelect(currentQuestionData.id, value)}
              className="space-y-3"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.option_letter} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value={option.option_letter} id={`${currentQuestionData.id}-${option.option_letter}`} className="mt-1" />
                  <Label 
                    htmlFor={`${currentQuestionData.id}-${option.option_letter}`} 
                    className="text-xs md:text-sm cursor-pointer leading-relaxed"
                  >
                    <span className="font-medium mr-2">{option.option_letter})</span>
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-3 border-t">
        <Button 
          variant="outline" 
          onClick={goToPreviousQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>

        <div className="flex items-center space-x-2">
          {currentQuestion === questions.length - 1 ? (
            <Button 
              onClick={submitQuiz}
              disabled={isSubmitting || isCompleted || !answers[currentQuestionData.id]}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar Quiz'}
            </Button>
          ) : (
            <Button 
              onClick={goToNextQuestion}
              disabled={!answers[currentQuestionData.id]}
              className="flex items-center space-x-2"
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