import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quiz1Timer } from '../quiz1/Quiz1Timer';
import { useQuiz3 } from './useQuiz3';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const Quiz3Participant = () => {
  const [nickname, setNickname] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessionState, getCurrentQuestion, getCurrentQuestionIndex, isLoading } = useQuiz3();
  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();

  useEffect(() => {
    if (sessionState?.current_phase === 'question') {
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  }, [sessionState?.current_question_id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await supabase
        .from('quiz3_participants')
        .insert({ nickname: nickname.trim() })
        .select()
        .single();

      if (data) {
        setParticipantId(data.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = async (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!participantId || !currentQuestion || hasAnswered) return;

    setIsSubmitting(true);
    setSelectedAnswer(answer);
    
    try {
      await supabase
        .from('quiz3_answers')
        .insert({
          participant_id: participantId,
          question_id: currentQuestion.id,
          answer
        });

      setHasAnswered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="w-full max-w-md p-8 bg-[#1a1a2e] border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
          <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            Soluções Digitais
          </h1>
          <p className="text-center text-yellow-300 mb-6">
            Identifique a solução certa
          </p>

          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              type="text"
              placeholder="Seu nome ou apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              className="text-lg"
              disabled={isSubmitting}
            />

            <Button 
              type="submit" 
              className="w-full text-lg py-6"
              disabled={!nickname.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Quiz'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <Card className="w-full max-w-2xl p-8 bg-[#1a1a2e] border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
        {sessionState?.current_phase === 'waiting' && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              Bem-vindo, {nickname}! 👋
            </h2>
            <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto" />
            <p className="text-xl text-gray-400">
              Aguardando o início...
            </p>
          </div>
        )}

        {sessionState?.current_phase === 'question' && currentQuestion && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-yellow-400">
                Pergunta {questionIndex}/10
              </div>
              <h2 className="text-2xl font-bold leading-tight text-white">
                {currentQuestion.question_text}
              </h2>

              <Quiz1Timer
                startTime={sessionState.question_started_at}
                duration={60}
                className="my-4"
              />
            </div>

            {!hasAnswered ? (
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleAnswer(option as 'A' | 'B' | 'C' | 'D')}
                    disabled={isSubmitting}
                    className="w-full h-20 text-lg font-semibold"
                  >
                    {option}) {currentQuestion[`option_${option.toLowerCase()}` as keyof typeof currentQuestion]}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="text-6xl mb-4">✓</div>
                <p className="text-2xl font-bold text-yellow-400">
                  Resposta enviada!
                </p>
                <p className="text-lg text-gray-300 mt-2">
                  Você respondeu: <span className="font-bold text-orange-400">{selectedAnswer}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {(sessionState?.current_phase === 'explanation' || sessionState?.current_phase === 'ranking' || sessionState?.current_phase === 'ended') && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Obrigado por participar!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
