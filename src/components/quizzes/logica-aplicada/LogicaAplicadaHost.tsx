import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { useLogicaAplicada } from './useLogicaAplicada';
import { LogicaAplicadaTimer } from './LogicaAplicadaTimer';
import { LogicaAplicadaRanking } from './LogicaAplicadaRanking';
import { Users, Zap, Sparkles } from 'lucide-react';

// Decorative corner component
const NeonCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const positionClasses = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0 rotate-90',
    bl: 'bottom-0 left-0 -rotate-90',
    br: 'bottom-0 right-0 rotate-180'
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-8 h-8 pointer-events-none`}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <path
          d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z"
          fill="url(#neonGradient)"
          className="drop-shadow-[0_0_8px_hsl(var(--neon-pink))]"
        />
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--neon-pink))" />
            <stop offset="100%" stopColor="hsl(var(--neon-cyan))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Floating dots decoration
const FloatingDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full animate-pulse"
        style={{
          left: `${10 + (i * 7) % 80}%`,
          top: `${15 + (i * 11) % 70}%`,
          backgroundColor: i % 3 === 0 ? 'hsl(var(--neon-pink))' : i % 3 === 1 ? 'hsl(var(--neon-cyan))' : 'hsl(var(--neon-purple))',
          animationDelay: `${i * 0.2}s`,
          boxShadow: `0 0 8px ${i % 3 === 0 ? 'hsl(var(--neon-pink))' : i % 3 === 1 ? 'hsl(var(--neon-cyan))' : 'hsl(var(--neon-purple))'}`
        }}
      />
    ))}
  </div>
);

// Grid background
const CyberpunkGrid = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-10"
    style={{
      backgroundImage: `
        linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px'
    }}
  />
);

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
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <CyberpunkGrid />
        <FloatingDots />
        
        {/* Main container with double neon border */}
        <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] shadow-[0_0_40px_hsl(var(--neon-pink)/0.4)]">
          <div className="relative p-1 rounded-xl bg-[#0a0a0f]">
            <div className="relative p-8 rounded-lg border border-[hsl(var(--neon-cyan)/0.5)] bg-black/60 backdrop-blur-sm">
              <NeonCorner position="tl" />
              <NeonCorner position="tr" />
              <NeonCorner position="bl" />
              <NeonCorner position="br" />
              
              {/* Title */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="w-10 h-10 text-[hsl(var(--neon-pink))] animate-pulse drop-shadow-[0_0_10px_hsl(var(--neon-pink))]" />
                  <h1 className="text-5xl font-bold">
                    <span className="bg-gradient-to-r from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--neon-pink)/0.5)]">
                      Quiz – Lógica Aplicada
                    </span>
                  </h1>
                  <Zap className="w-10 h-10 text-[hsl(var(--neon-cyan))] animate-pulse drop-shadow-[0_0_10px_hsl(var(--neon-cyan))]" />
                </div>
                <p className="text-2xl text-[hsl(var(--neon-cyan))] tracking-[0.3em] uppercase">Código F</p>
              </div>

              {/* QR Code with neon frame */}
              <div className="relative p-1 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))] mx-auto w-fit mb-8 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.3)]">
                <div className="p-6 bg-black rounded-lg">
                  <QRCodeSVG
                    value={participantUrl}
                    size={280}
                    bgColor="transparent"
                    fgColor="hsl(var(--neon-cyan))"
                    level="H"
                  />
                </div>
              </div>

              <p className="text-white/60 text-xl mb-4 text-center">Escaneie para participar</p>
              <p className="text-[hsl(var(--neon-pink))] font-mono text-sm mb-8 break-all max-w-lg text-center mx-auto">
                {participantUrl}
              </p>

              {/* Participant counter */}
              <div className="flex items-center justify-center gap-3 text-3xl">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan)/0.1)] shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]">
                  <Users className="text-[hsl(var(--neon-cyan))] animate-pulse" />
                  <span className="font-bold text-[hsl(var(--neon-cyan))]">{participantCount}</span>
                  <span className="text-white/60">participantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question phase
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-8 relative overflow-hidden">
        <CyberpunkGrid />
        <FloatingDots />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="px-6 py-3 rounded-full border-2 border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink)/0.1)] shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]">
            <span className="text-[hsl(var(--neon-pink))] font-bold text-2xl">
              Pergunta {questionIndex + 1}/{questions.length}
            </span>
          </div>
          <LogicaAplicadaTimer 
            startedAt={sessionState.question_started_at} 
            onTimeUp={handleTimeUp}
            size="lg"
          />
        </div>

        {/* Question card with double neon border */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] shadow-[0_0_40px_hsl(var(--neon-pink)/0.4)] w-full max-w-5xl">
            <div className="relative p-1 rounded-xl bg-[#0a0a0f]">
              <Card className="p-12 bg-black/60 border border-[hsl(var(--neon-cyan)/0.5)] backdrop-blur-sm rounded-lg">
                <NeonCorner position="tl" />
                <NeonCorner position="tr" />
                <NeonCorner position="bl" />
                <NeonCorner position="br" />
                
                <p className="text-4xl text-white text-center leading-relaxed font-medium">
                  {currentQuestion.question_text}
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer with participant count */}
        <div className="flex items-center justify-center gap-3 mt-8 relative z-10">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-[hsl(var(--neon-cyan)/0.5)] bg-black/40">
            <Users className="text-[hsl(var(--neon-cyan))]" />
            <span className="text-white/60 text-xl">{participantCount} participantes</span>
          </div>
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
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <CyberpunkGrid />
        <FloatingDots />
        
        {showCorrectAnswer && (
          <div className="mb-8 relative z-10">
            <div className="relative p-1 rounded-xl bg-gradient-to-r from-[hsl(var(--neon-green))] to-[hsl(var(--neon-cyan))] shadow-[0_0_20px_hsl(var(--neon-green)/0.4)]">
              <Card className="p-6 bg-black/80 border-0 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--neon-green))]" />
                  <p className="text-white/60 text-sm">Resposta correta:</p>
                </div>
                <p className="text-[hsl(var(--neon-green))] text-xl font-bold">
                  {currentQuestion.correct_option}) {
                    currentQuestion.correct_option === 'A' ? currentQuestion.option_a :
                    currentQuestion.correct_option === 'B' ? currentQuestion.option_b :
                    currentQuestion.correct_option === 'C' ? currentQuestion.option_c :
                    currentQuestion.option_d
                  }
                </p>
              </Card>
            </div>
          </div>
        )}

        <LogicaAplicadaRanking ranking={ranking} isFinal={isFinal} />

        {!isFinal && (
          <p className="text-white/40 mt-8 text-lg relative z-10">
            Próxima pergunta: {questionIndex + 2}/{questions.length}
          </p>
        )}
      </div>
    );
  }

  return null;
}
