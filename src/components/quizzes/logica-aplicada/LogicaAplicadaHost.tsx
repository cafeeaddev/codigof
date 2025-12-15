import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { useLogicaAplicada } from './useLogicaAplicada';
import { LogicaAplicadaTimer } from './LogicaAplicadaTimer';
import { LogicaAplicadaRanking } from './LogicaAplicadaRanking';
import { Users, Brain } from 'lucide-react';

export function LogicaAplicadaHost() {
  const { 
    sessionState, 
    participantCount, 
    ranking,
    questions,
    getCurrentQuestion, 
    getCurrentQuestionIndex,
    initializeSession,
    showRanking
  } = useLogicaAplicada();

  const participantUrl = `${window.location.origin}/quiz/logica-aplicada`;
  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Auto-show ranking when time is up
  const handleTimeUp = () => {
    if (sessionState?.current_phase === 'question') {
      showRanking();
    }
  };

  // Waiting phase
  if (!sessionState || sessionState.current_phase === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Quiz – Lógica Aplicada
            </span>
          </h1>
          <p className="text-2xl text-white/60">Código F</p>
        </div>

        <Card className="p-8 bg-black/40 border-emerald-500/30 backdrop-blur-sm mb-8">
          <QRCodeSVG
            value={participantUrl}
            size={280}
            bgColor="transparent"
            fgColor="#10b981"
            level="H"
          />
        </Card>

        <p className="text-white/60 text-xl mb-4">Escaneie para participar</p>
        <p className="text-emerald-400 font-mono text-sm mb-8 break-all max-w-lg text-center">
          {participantUrl}
        </p>

        <div className="flex items-center gap-3 text-3xl text-white">
          <Users className="text-emerald-400" />
          <span className="font-bold">{participantCount}</span>
          <span className="text-white/60">participantes</span>
        </div>
      </div>
    );
  }

  // Question phase
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold text-2xl">
              Pergunta {questionIndex + 1}/{questions.length}
            </span>
          </div>
          <LogicaAplicadaTimer 
            startedAt={sessionState.question_started_at} 
            onTimeUp={handleTimeUp}
            size="lg"
          />
        </div>

        {/* Question card */}
        <Card className="flex-1 p-12 bg-black/40 border-emerald-500/30 backdrop-blur-sm flex items-center justify-center">
          <p className="text-4xl text-white text-center leading-relaxed font-medium max-w-4xl">
            {currentQuestion.question_text}
          </p>
        </Card>

        {/* Footer with participant count */}
        <div className="flex items-center justify-center gap-3 mt-8 text-xl text-white/60">
          <Users className="text-emerald-400" />
          <span>{participantCount} participantes</span>
        </div>
      </div>
    );
  }

  // Ranking phase (partial or final)
  if (sessionState.current_phase === 'ranking_parcial' || sessionState.current_phase === 'ended') {
    const isFinal = sessionState.current_phase === 'ended';
    
    // Show correct answer for partial ranking
    const showCorrectAnswer = !isFinal && currentQuestion;

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8">
        {showCorrectAnswer && (
          <Card className="mb-8 p-6 bg-emerald-500/10 border-emerald-500/30 max-w-2xl w-full">
            <p className="text-white/60 text-sm mb-2">Resposta correta:</p>
            <p className="text-emerald-400 text-xl font-bold">
              {currentQuestion.correct_option}) {
                currentQuestion.correct_option === 'A' ? currentQuestion.option_a :
                currentQuestion.correct_option === 'B' ? currentQuestion.option_b :
                currentQuestion.correct_option === 'C' ? currentQuestion.option_c :
                currentQuestion.option_d
              }
            </p>
          </Card>
        )}

        <LogicaAplicadaRanking ranking={ranking} isFinal={isFinal} />

        {!isFinal && (
          <p className="text-white/40 mt-8 text-lg">
            Próxima pergunta: {questionIndex + 2}/{questions.length}
          </p>
        )}
      </div>
    );
  }

  return null;
}
