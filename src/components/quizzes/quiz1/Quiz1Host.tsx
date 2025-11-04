import { useEffect } from 'react';
import { Quiz1Timer } from './Quiz1Timer';
import { Quiz1QRCode } from './Quiz1QRCode';
import { Quiz1Stats } from './Quiz1Stats';
import { Quiz1Ranking } from './Quiz1Ranking';
import { useQuiz1 } from './useQuiz1';
import { Loader2 } from 'lucide-react';

export const Quiz1Host = () => {
  const {
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    ranking,
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();
  const participantUrl = `${window.location.origin}/quiz/mito-verdade`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      {sessionState?.current_phase === 'waiting' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <h1 className="text-6xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            ⚡ MITO OU VERDADE ⚡
          </h1>
          <p className="text-3xl text-center mb-8 text-cyan-300">
            Transformação Digital em 30 segundos
          </p>
          <Quiz1QRCode url={participantUrl} participantCount={participantCount} />
          <p className="text-2xl text-center text-gray-400">
            Aguardando início...
          </p>
        </div>
      )}

      {sessionState?.current_phase === 'question' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <div className="text-center space-y-6">
            <div className="text-3xl font-semibold text-cyan-400">
              Pergunta {questionIndex}/6
            </div>
            <h2 className="text-6xl font-bold leading-tight max-w-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {currentQuestion.question_text}
            </h2>
          </div>

          <Quiz1Timer
            startTime={sessionState.question_started_at}
            duration={30}
            className="mt-8"
          />

          <div className="text-3xl text-gray-400">
            Aguardando respostas... <span className="text-cyan-400 font-bold">{answerStats.total}/{participantCount}</span> ({participantCount > 0 ? Math.round((answerStats.total / participantCount) * 100) : 0}%)
          </div>
        </div>
      )}

      {sessionState?.current_phase === 'explanation' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <div className="text-center space-y-6">
            <div className="text-3xl font-semibold text-cyan-400">
              Pergunta {questionIndex}/6
            </div>
            <h2 className="text-5xl font-bold mb-8 text-white">
              {currentQuestion.question_text}
            </h2>
          </div>

          <Quiz1Stats
            stats={answerStats}
            correctAnswer={currentQuestion.correct_answer}
          />

          <div className="bg-white/5 border border-cyan-500/30 backdrop-blur-md rounded-3xl p-8 max-w-4xl shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="text-4xl font-bold mb-4 text-cyan-400">
              Resposta: {currentQuestion.correct_answer} ✅
            </div>
            <p className="text-2xl leading-relaxed text-gray-300">
              {currentQuestion.explanation}
            </p>
          </div>
        </div>
      )}

      {sessionState?.current_phase === 'ranking' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <Quiz1Ranking ranking={ranking} />
        </div>
      )}

      {sessionState?.current_phase === 'ended' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <h1 className="text-7xl font-bold mb-8 animate-pulse bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            🎉 FIM DO QUIZ 🎉
          </h1>
          <p className="text-4xl text-center text-cyan-300">
            Parabéns a todos os <span className="text-fuchsia-400 font-bold">{participantCount}</span> participantes!
          </p>
        </div>
      )}
    </div>
  );
};
