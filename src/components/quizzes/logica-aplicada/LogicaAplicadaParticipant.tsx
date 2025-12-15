import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLogicaAplicada } from './useLogicaAplicada';
import { LogicaAplicadaTimer } from './LogicaAplicadaTimer';
import { CheckCircle, XCircle, Clock, Loader2, Zap, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Decorative corner for mobile
const NeonCornerMobile = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const positionClasses = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0 rotate-90',
    bl: 'bottom-0 left-0 -rotate-90',
    br: 'bottom-0 right-0 rotate-180'
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-6 h-6 pointer-events-none`}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path
          d="M0 0 L24 0 L24 3 L3 3 L3 24 L0 24 Z"
          fill="url(#neonGradientMobile)"
          className="drop-shadow-[0_0_6px_hsl(var(--neon-pink))]"
        />
        <defs>
          <linearGradient id="neonGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--neon-pink))" />
            <stop offset="100%" stopColor="hsl(var(--neon-cyan))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Answer button colors - neon themed
const answerButtonStyles = {
  A: {
    bg: 'bg-[hsl(var(--neon-pink)/0.2)]',
    border: 'border-[hsl(var(--neon-pink))]',
    hover: 'hover:bg-[hsl(var(--neon-pink)/0.4)]',
    text: 'text-[hsl(var(--neon-pink))]',
    shadow: 'shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]',
    activeShadow: 'active:shadow-[0_0_25px_hsl(var(--neon-pink)/0.5)]'
  },
  B: {
    bg: 'bg-[hsl(var(--neon-cyan)/0.2)]',
    border: 'border-[hsl(var(--neon-cyan))]',
    hover: 'hover:bg-[hsl(var(--neon-cyan)/0.4)]',
    text: 'text-[hsl(var(--neon-cyan))]',
    shadow: 'shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]',
    activeShadow: 'active:shadow-[0_0_25px_hsl(var(--neon-cyan)/0.5)]'
  },
  C: {
    bg: 'bg-[hsl(60_100%_70%/0.2)]',
    border: 'border-[hsl(60_100%_70%)]',
    hover: 'hover:bg-[hsl(60_100%_70%/0.4)]',
    text: 'text-[hsl(60_100%_70%)]',
    shadow: 'shadow-[0_0_15px_hsl(60_100%_70%/0.3)]',
    activeShadow: 'active:shadow-[0_0_25px_hsl(60_100%_70%/0.5)]'
  },
  D: {
    bg: 'bg-[hsl(var(--neon-green)/0.2)]',
    border: 'border-[hsl(var(--neon-green))]',
    hover: 'hover:bg-[hsl(var(--neon-green)/0.4)]',
    text: 'text-[hsl(var(--neon-green))]',
    shadow: 'shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]',
    activeShadow: 'active:shadow-[0_0_25px_hsl(var(--neon-green)/0.5)]'
  }
};

export function LogicaAplicadaParticipant() {
  const { sessionState, getCurrentQuestion, getCurrentQuestionIndex, questions, joinQuiz, submitAnswer } = useLogicaAplicada();
  
  const [nickname, setNickname] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();

  // Reset answer state when question changes
  useEffect(() => {
    if (currentQuestion && !answeredQuestions.has(currentQuestion.id)) {
      setHasAnswered(false);
      setLastPoints(null);
      setAnswerStartTime(Date.now());
    } else if (currentQuestion && answeredQuestions.has(currentQuestion.id)) {
      setHasAnswered(true);
    }
  }, [currentQuestion?.id, answeredQuestions]);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      toast.error('Digite seu nome ou apelido');
      return;
    }
    
    setIsJoining(true);
    const id = await joinQuiz(nickname.trim());
    setIsJoining(false);
    
    if (id) {
      setParticipantId(id);
      toast.success('Você entrou no quiz!');
    } else {
      toast.error('Erro ao entrar no quiz');
    }
  };

  const handleAnswer = useCallback(async (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!participantId || !currentQuestion || hasAnswered) return;

    const timeTaken = Date.now() - answerStartTime;
    setHasAnswered(true);
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));

    const points = await submitAnswer(participantId, currentQuestion.id, answer, timeTaken);
    setLastPoints(points);
    setWasCorrect(answer === currentQuestion.correct_option);
  }, [participantId, currentQuestion, hasAnswered, answerStartTime, submitAnswer]);

  // Entry screen
  if (!participantId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Double border card */}
        <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] shadow-[0_0_30px_hsl(var(--neon-pink)/0.4)] w-full max-w-md">
          <div className="relative p-0.5 rounded-lg bg-[#0a0a0f]">
            <Card className="w-full p-8 bg-black/60 border border-[hsl(var(--neon-cyan)/0.3)] backdrop-blur-sm rounded-lg relative">
              <NeonCornerMobile position="tl" />
              <NeonCornerMobile position="tr" />
              <NeonCornerMobile position="bl" />
              <NeonCornerMobile position="br" />
              
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="w-8 h-8 text-[hsl(var(--neon-pink))] animate-pulse" />
                  <h1 className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
                      Quiz – Lógica Aplicada
                    </span>
                  </h1>
                </div>
                <p className="text-[hsl(var(--neon-cyan))] tracking-widest uppercase text-sm">Código F</p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Seu nome ou apelido"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="bg-black/40 border-2 border-[hsl(var(--neon-cyan)/0.5)] text-white text-center text-lg py-6 focus:border-[hsl(var(--neon-cyan))] focus:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] transition-all"
                  maxLength={30}
                />
                
                <Button
                  onClick={handleJoin}
                  disabled={isJoining || !nickname.trim()}
                  className="w-full py-6 text-lg bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))] hover:from-[hsl(var(--neon-pink)/0.8)] hover:to-[hsl(var(--neon-purple)/0.8)] text-white font-bold shadow-[0_0_20px_hsl(var(--neon-pink)/0.4)] hover:shadow-[0_0_30px_hsl(var(--neon-pink)/0.6)] transition-all border-0"
                >
                  {isJoining ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 w-5 h-5" />}
                  Entrar no Quiz
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Waiting screen
  if (sessionState?.current_phase === 'waiting' || !sessionState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] shadow-[0_0_30px_hsl(var(--neon-cyan)/0.4)] w-full max-w-md animate-pulse">
          <Card className="w-full p-8 bg-black/80 border-0 backdrop-blur-sm text-center rounded-lg">
            <Clock className="w-16 h-16 text-[hsl(var(--neon-cyan))] mx-auto mb-4 drop-shadow-[0_0_15px_hsl(var(--neon-cyan))]" />
            <h2 className="text-2xl font-bold text-white mb-2">Aguardando...</h2>
            <p className="text-white/60">O quiz vai começar em breve!</p>
            <div className="mt-4 px-4 py-2 rounded-full bg-[hsl(var(--neon-pink)/0.2)] border border-[hsl(var(--neon-pink)/0.5)] inline-block">
              <p className="text-[hsl(var(--neon-pink))] font-medium">Olá, {nickname}!</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Ranking screen
  if (sessionState.current_phase === 'ranking_parcial' || sessionState.current_phase === 'ended') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] shadow-[0_0_30px_hsl(var(--neon-pink)/0.4)] w-full max-w-md">
          <Card className="w-full p-8 bg-black/80 border-0 backdrop-blur-sm text-center rounded-lg">
            <Trophy className="w-16 h-16 text-[hsl(60_100%_50%)] mx-auto mb-4 drop-shadow-[0_0_20px_hsl(60_100%_50%)]" />
            <h2 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
                {sessionState.current_phase === 'ended' ? 'Quiz Finalizado!' : 'Veja o ranking na tela!'}
              </span>
            </h2>
            <p className="text-white/60">
              {sessionState.current_phase === 'ended' 
                ? 'Parabéns por participar!' 
                : 'Aguarde a próxima pergunta...'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Question screen
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-4 relative overflow-hidden">
        {/* Background grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="px-4 py-2 rounded-full border-2 border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink)/0.1)] shadow-[0_0_10px_hsl(var(--neon-pink)/0.3)]">
            <span className="text-[hsl(var(--neon-pink))] font-bold">
              {questionIndex + 1}/{questions.length}
            </span>
          </div>
          <LogicaAplicadaTimer 
            startedAt={sessionState.question_started_at} 
            size="sm"
          />
        </div>

        {/* Question */}
        <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))] shadow-[0_0_20px_hsl(var(--neon-pink)/0.3)] mb-4 relative z-10">
          <Card className="p-5 bg-black/80 border-0 backdrop-blur-sm rounded-lg">
            <p className="text-base text-white leading-relaxed">{currentQuestion.question_text}</p>
          </Card>
        </div>

        {/* Answer feedback or options */}
        {hasAnswered ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className={`relative p-0.5 rounded-xl w-full ${wasCorrect ? 'bg-gradient-to-br from-[hsl(var(--neon-green))] to-[hsl(var(--neon-cyan))] shadow-[0_0_30px_hsl(var(--neon-green)/0.5)]' : 'bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'}`}>
              <Card className="p-8 bg-black/80 border-0 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                {wasCorrect ? (
                  <>
                    <div className="relative">
                      <CheckCircle className="w-20 h-20 text-[hsl(var(--neon-green))] mb-4 drop-shadow-[0_0_20px_hsl(var(--neon-green))]" />
                      <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-[hsl(60_100%_50%)] animate-pulse" />
                    </div>
                    <p className="text-4xl font-bold text-[hsl(var(--neon-green))] drop-shadow-[0_0_10px_hsl(var(--neon-green))]">+{lastPoints} pts!</p>
                    <p className="text-white/60 mt-2">Resposta correta!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-red-400 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-[shake_0.5s_ease-in-out]" />
                    <p className="text-4xl font-bold text-red-400">0 pts</p>
                    <p className="text-white/60 mt-2">Resposta incorreta</p>
                  </>
                )}
                <p className="text-white/40 mt-4 text-sm">Aguardando ranking...</p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const optionText = letter === 'A' ? currentQuestion.option_a 
                : letter === 'B' ? currentQuestion.option_b 
                : letter === 'C' ? currentQuestion.option_c 
                : currentQuestion.option_d;
              const styles = answerButtonStyles[letter];
              
              return (
                <button
                  key={letter}
                  onClick={() => handleAnswer(letter)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 ${styles.bg} ${styles.border} ${styles.hover} ${styles.shadow} ${styles.activeShadow} text-white font-medium transition-all active:scale-[0.98]`}
                >
                  <span className={`font-bold text-xl flex-shrink-0 w-8 ${styles.text}`}>{letter}</span>
                  <span className="text-sm text-left flex-1 whitespace-normal break-words text-white/90">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        
        {/* Shake animation keyframe */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
