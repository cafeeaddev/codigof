import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quiz1Timer } from './Quiz1Timer';
import { useQuiz1 } from './useQuiz1';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const Quiz1Participant = () => {
  const [nickname, setNickname] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'MITO' | 'VERDADE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessionState, getCurrentQuestion, getCurrentQuestionIndex, isLoading } = useQuiz1();
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
        .from('codigo_f_participants')
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

  const handleAnswer = async (answer: 'MITO' | 'VERDADE') => {
    if (!participantId || !currentQuestion || hasAnswered) return;

    setIsSubmitting(true);
    setSelectedAnswer(answer);
    
    try {
      await supabase
        .from('codigo_f_answers')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 p-4">
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
          <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mito ou Verdade
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Transformação Digital
          </p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Seu nome ou apelido"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
                className="text-lg"
                disabled={isSubmitting}
              />
            </div>

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 p-4">
      <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur">
        {sessionState?.current_phase === 'waiting' && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bem-vindo, {nickname}! 👋
            </h2>
            <div className="flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
            <p className="text-xl text-muted-foreground">
              Aguardando o início do quiz...
            </p>
          </div>
        )}

        {sessionState?.current_phase === 'question' && currentQuestion && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-muted-foreground">
                Pergunta {questionIndex}/6
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                {currentQuestion.question_text}
              </h2>

              <Quiz1Timer
                startTime={sessionState.question_started_at}
                duration={30}
                className="my-4"
              />
            </div>

            {!hasAnswered ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAnswer('MITO')}
                  disabled={isSubmitting}
                  className="h-32 text-2xl font-bold bg-red-500 hover:bg-red-600"
                >
                  MITO
                </Button>
                <Button
                  onClick={() => handleAnswer('VERDADE')}
                  disabled={isSubmitting}
                  className="h-32 text-2xl font-bold bg-green-500 hover:bg-green-600"
                >
                  VERDADE
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <div className="text-6xl mb-4">✓</div>
                <p className="text-2xl font-bold text-purple-700">
                  Resposta enviada!
                </p>
                <p className="text-lg text-purple-600 mt-2">
                  Você respondeu: <span className="font-bold">{selectedAnswer}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {sessionState?.current_phase === 'explanation' && currentQuestion && (
          <div className="space-y-6 text-center">
            <div className="text-lg font-semibold text-muted-foreground">
              Pergunta {questionIndex}/6
            </div>
            
            {hasAnswered && selectedAnswer === currentQuestion.correct_answer ? (
              <div className="text-6xl mb-4">✅</div>
            ) : (
              <div className="text-6xl mb-4">❌</div>
            )}

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
              <p className="text-xl font-bold text-purple-700 mb-2">
                Resposta Correta: {currentQuestion.correct_answer}
              </p>
              <p className="text-lg text-purple-600">
                {currentQuestion.explanation}
              </p>
            </div>

            {hasAnswered && (
              <p className="text-muted-foreground">
                Sua resposta: <span className="font-bold">{selectedAnswer}</span>
              </p>
            )}
          </div>
        )}

        {sessionState?.current_phase === 'ended' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quiz Finalizado!
            </h2>
            <p className="text-xl text-muted-foreground">
              Obrigado por participar, {nickname}!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
