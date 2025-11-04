import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Quiz1Timer } from '../quiz1/Quiz1Timer';
import { Quiz1QRCode } from '../quiz1/Quiz1QRCode';
import { Quiz3Stats } from './Quiz3Stats';
import { Quiz3Ranking } from './Quiz3Ranking';
import { useQuiz3 } from './useQuiz3';
import { Loader2 } from 'lucide-react';

export const Quiz3Host = () => {
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();
  const navigate = useNavigate();
  const {
    sessionState,
    participantCount,
    answerStats,
    ranking,
    isLoading,
    getCurrentQuestion,
    getCurrentQuestionIndex
  } = useQuiz3();

  useEffect(() => {
    if (!isLoadingRole && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoadingRole, navigate]);

  if (isLoadingRole || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-orange-700 to-yellow-600">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();
  const participantUrl = `${window.location.origin}/quiz/solucoes-digitais`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-700 to-yellow-600 text-white p-8">
      {sessionState?.current_phase === 'waiting' && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <h1 className="text-6xl font-bold mb-8 text-center">
            🎯 SOLUÇÕES DIGITAIS 🎯
          </h1>
          <p className="text-3xl text-center mb-8">
            Identifique a solução certa para cada situação
          </p>
          <Quiz1QRCode url={participantUrl} participantCount={participantCount} />
        </div>
      )}

      {sessionState?.current_phase === 'question' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <div className="text-center space-y-6">
            <div className="text-3xl font-semibold">
              Pergunta {questionIndex}/10
            </div>
            <h2 className="text-5xl font-bold leading-tight max-w-5xl">
              {currentQuestion.question_text}
            </h2>
          </div>

          <Quiz1Timer
            startTime={sessionState.question_started_at}
            duration={60}
            className="mt-8"
          />

          <div className="text-3xl">
            Aguardando respostas... {answerStats.total}/{participantCount}
          </div>
        </div>
      )}

      {sessionState?.current_phase === 'explanation' && currentQuestion && (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
          <Quiz3Stats
            stats={answerStats}
            correctOption={currentQuestion.correct_option}
            optionTexts={{
              a: currentQuestion.option_a,
              b: currentQuestion.option_b,
              c: currentQuestion.option_c,
              d: currentQuestion.option_d
            }}
          />
        </div>
      )}

      {sessionState?.current_phase === 'ranking' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Quiz3Ranking ranking={ranking} />
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
