import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCodigoFQuiz } from './useCodigoFQuiz';
import { CodigoFTimer } from './CodigoFTimer';
import { CodigoFQRCode } from './CodigoFQRCode';
import { CodigoFStats } from './CodigoFStats';
import { Loader2, ArrowRight } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';

export const CodigoFQuizHost = () => {
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();
  const navigate = useNavigate();
  
  const {
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    startSession,
    nextQuestion,
    showExplanation,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    totalQuestions
  } = useCodigoFQuiz();

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();

  // Redirecionar se não for admin
  useEffect(() => {
    if (!isLoadingRole && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoadingRole, navigate]);

  // Auto-transição de pergunta para explicação após 30 segundos
  useEffect(() => {
    if (sessionState?.current_phase === 'question' && sessionState.question_started_at) {
      const timer = setTimeout(() => {
        showExplanation();
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [sessionState?.current_phase, sessionState?.question_started_at, showExplanation]);

  if (isLoadingRole || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin" />
      </div>
    );
  }

  const participantUrl = `${window.location.origin}/codigo-f-quiz`;

  // Fase: Waiting (7 minutos de entrada)
  if (!sessionState || sessionState.current_phase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold">Código F</h1>
              <p className="text-3xl text-muted-foreground">Mito ou Verdade sobre Transformação Digital</p>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Escaneie o QR Code para participar</h2>
              <CodigoFQRCode url={participantUrl} participantCount={participantCount} />
            </div>

            {sessionState?.session_started_at && (
              <CodigoFTimer
                startTime={sessionState.session_started_at}
                duration={420} // 7 minutos
                onComplete={startSession}
              />
            )}

            <Button
              size="lg"
              onClick={startSession}
              className="text-2xl px-12 py-8 h-auto"
            >
              Iniciar Quiz Agora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fase: Question
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Pergunta {questionIndex}/{totalQuestions}</h2>
            <CodigoFTimer
              startTime={sessionState.question_started_at}
              duration={30}
              onComplete={showExplanation}
            />
          </div>

          <div className="bg-card p-12 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-center leading-tight">
              {currentQuestion.question_text}
            </h1>
          </div>

          <div className="text-center text-2xl text-muted-foreground">
            <p>📊 {answerStats.total} de {participantCount} responderam</p>
          </div>
        </div>
      </div>
    );
  }

  // Fase: Explanation
  if (sessionState.current_phase === 'explanation' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Resultados - Pergunta {questionIndex}/{totalQuestions}</h2>
            
            <CodigoFStats
              stats={answerStats}
              correctAnswer={currentQuestion.correct_answer}
            />
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">✅</span>
              <h3 className="text-3xl font-bold">Resposta Correta: {currentQuestion.correct_answer}</h3>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-xl leading-relaxed text-center">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={nextQuestion}
              className="text-2xl px-12 py-8 h-auto"
            >
              {questionIndex < totalQuestions ? (
                <>
                  Próxima Pergunta <ArrowRight className="ml-2 w-8 h-8" />
                </>
              ) : (
                'Finalizar Quiz'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fase: Ended
  if (sessionState.current_phase === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          <div className="text-8xl">🎉</div>
          <h1 className="text-6xl font-bold">Quiz Finalizado!</h1>
          <p className="text-3xl text-muted-foreground">
            Obrigado aos {participantCount} participantes!
          </p>
          <p className="text-xl text-muted-foreground">
            Continue aprendendo sobre transformação digital!
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CodigoFQuizHost;
