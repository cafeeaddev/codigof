import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLogicaAplicada } from './useLogicaAplicada';
import { LogicaAplicadaTimer } from './LogicaAplicadaTimer';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-black/40 border-emerald-500/30 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Quiz – Lógica Aplicada
              </span>
            </h1>
            <p className="text-white/60">Código F</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Seu nome ou apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="bg-white/5 border-emerald-500/30 text-white text-center text-lg py-6"
              maxLength={30}
            />
            
            <Button
              onClick={handleJoin}
              disabled={isJoining || !nickname.trim()}
              className="w-full py-6 text-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
            >
              {isJoining ? <Loader2 className="animate-spin mr-2" /> : null}
              Entrar no Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Waiting screen
  if (sessionState?.current_phase === 'waiting' || !sessionState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-black/40 border-emerald-500/30 backdrop-blur-sm text-center">
          <Clock className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Aguardando...</h2>
          <p className="text-white/60">O quiz vai começar em breve!</p>
          <p className="text-emerald-400 mt-4">Olá, {nickname}!</p>
        </Card>
      </div>
    );
  }

  // Ranking screen
  if (sessionState.current_phase === 'ranking_parcial' || sessionState.current_phase === 'ended') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-black/40 border-emerald-500/30 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              {sessionState.current_phase === 'ended' ? '🏆 Quiz Finalizado!' : '📊 Veja o ranking na tela!'}
            </span>
          </h2>
          <p className="text-white/60">
            {sessionState.current_phase === 'ended' 
              ? 'Parabéns por participar!' 
              : 'Aguarde a próxima pergunta...'}
          </p>
        </Card>
      </div>
    );
  }

  // Question screen
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-4">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-emerald-400 font-bold">
            {questionIndex + 1}/{questions.length}
          </span>
          <LogicaAplicadaTimer 
            startedAt={sessionState.question_started_at} 
            size="sm"
          />
        </div>

        {/* Question */}
        <Card className="p-6 bg-black/40 border-emerald-500/30 backdrop-blur-sm mb-6">
          <p className="text-lg text-white leading-relaxed">{currentQuestion.question_text}</p>
        </Card>

        {/* Answer feedback or options */}
        {hasAnswered ? (
          <Card className="flex-1 p-8 bg-black/40 border-emerald-500/30 backdrop-blur-sm flex flex-col items-center justify-center">
            {wasCorrect ? (
              <>
                <CheckCircle className="w-20 h-20 text-emerald-400 mb-4" />
                <p className="text-3xl font-bold text-emerald-400">+{lastPoints} pts!</p>
                <p className="text-white/60 mt-2">Resposta correta!</p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-400 mb-4" />
                <p className="text-3xl font-bold text-red-400">0 pts</p>
                <p className="text-white/60 mt-2">Resposta incorreta</p>
              </>
            )}
            <p className="text-white/40 mt-4 text-sm">Aguardando ranking...</p>
          </Card>
        ) : (
          <div className="flex-1 grid grid-cols-1 gap-3">
            {[
              { letter: 'A', text: currentQuestion.option_a, color: 'from-red-600 to-red-700' },
              { letter: 'B', text: currentQuestion.option_b, color: 'from-blue-600 to-blue-700' },
              { letter: 'C', text: currentQuestion.option_c, color: 'from-yellow-600 to-yellow-700' },
              { letter: 'D', text: currentQuestion.option_d, color: 'from-emerald-600 to-emerald-700' },
            ].map(({ letter, text, color }) => (
              <Button
                key={letter}
                onClick={() => handleAnswer(letter as 'A' | 'B' | 'C' | 'D')}
                className={`h-auto py-4 px-6 text-left bg-gradient-to-r ${color} hover:opacity-90 transition-opacity`}
              >
                <span className="font-bold text-xl mr-3">{letter}</span>
                <span className="text-sm leading-tight">{text}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
