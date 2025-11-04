import { useEffect } from 'react';
import { Quiz1Timer } from './Quiz1Timer';
import { Quiz1QRCode } from './Quiz1QRCode';
import { Quiz1Stats } from './Quiz1Stats';
import { useQuiz1 } from './useQuiz1';
import { Loader2 } from 'lucide-react';

export const Quiz1Host = () => {
  const {
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    getCurrentQuestion,
    getCurrentQuestionIndex
  } = useQuiz1();

  useEffect(() => {
    if (sessionState?.current_phase === 'question') {
      const timer = setTimeout(() => {
        // Auto-transition to explanation after 30 seconds
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [sessionState?.current_phase, sessionState?.question_started_at]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();
  const participantUrl = `${window.location.origin}/quiz/mito-verdade`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 text-white p-8">
      {sessionState?.current_phase === 'waiting' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <h1 className="text-6xl font-bold mb-8 text-center">
            ⚡ MITO OU VERDADE ⚡
          </h1>
          <p className="text-3xl text-center mb-8">
            Transformação Digital em 30 segundos
          </p>
          <Quiz1QRCode url={participantUrl} participantCount={participantCount} />
          <p className="text-2xl text-center">
            Aguardando início...
          </p>
        </div>
      )}

      {sessionState?.current_phase === 'question' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <div className="text-center space-y-6">
            <div className="text-3xl font-semibold">
              Pergunta {questionIndex}/6
            </div>
            <h2 className="text-6xl font-bold leading-tight max-w-5xl">
              {currentQuestion.question_text}
            </h2>
          </div>

          <Quiz1Timer
            startTime={sessionState.question_started_at}
            duration={30}
            className="mt-8"
          />

          <div className="text-3xl">
            Aguardando respostas... {answerStats.total}/{participantCount} ({Math.round((answerStats.total / participantCount) * 100) || 0}%)
          </div>
        </div>
      )}

      {sessionState?.current_phase === 'explanation' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <div className="text-center space-y-6">
            <div className="text-3xl font-semibold">
              Pergunta {questionIndex}/6
            </div>
            <h2 className="text-5xl font-bold mb-8">
              {currentQuestion.question_text}
            </h2>
          </div>

          <Quiz1Stats
            stats={answerStats}
            correctAnswer={currentQuestion.correct_answer}
          />

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-4xl">
            <div className="text-4xl font-bold mb-4">
              Resposta: {currentQuestion.correct_answer} ✅
            </div>
            <p className="text-2xl leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        </div>
      )}

      {sessionState?.current_phase === 'ended' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <h1 className="text-7xl font-bold mb-8 animate-pulse">
            🎉 FIM DO QUIZ 🎉
          </h1>
          <p className="text-4xl text-center">
            Parabéns a todos os {participantCount} participantes!
          </p>
        </div>
      )}
    </div>
  );
};
