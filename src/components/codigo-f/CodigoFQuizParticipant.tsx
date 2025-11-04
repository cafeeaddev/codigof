import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCodigoFQuiz } from './useCodigoFQuiz';
import { CodigoFTimer } from './CodigoFTimer';
import { Loader2 } from 'lucide-react';

export const CodigoFQuizParticipant = () => {
  const [nickname, setNickname] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'MITO' | 'VERDADE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessionState, getCurrentQuestion, getCurrentQuestionIndex, totalQuestions } = useCodigoFQuiz();
  const { toast } = useToast();

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();

  // Reset hasAnswered quando mudar de pergunta
  useEffect(() => {
    if (sessionState?.current_phase === 'question') {
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  }, [sessionState?.current_question_id, sessionState?.current_phase]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const { data, error } = await supabase
      .from('codigo_f_participants')
      .insert({ nickname: nickname.trim() })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
      return;
    }

    setParticipantId(data.id);
    toast({ title: 'Bem-vindo(a)!', description: `Olá, ${nickname}! 👋` });
  };

  const handleAnswer = async (answer: 'MITO' | 'VERDADE') => {
    if (!participantId || !currentQuestion || hasAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedAnswer(answer);

    const { error } = await supabase
      .from('codigo_f_answers')
      .insert({
        participant_id: participantId,
        question_id: currentQuestion.id,
        answer
      });

    if (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({ title: 'Erro ao enviar resposta', variant: 'destructive' });
      setIsSubmitting(false);
      setSelectedAnswer(null);
      return;
    }

    setHasAnswered(true);
    setIsSubmitting(false);
  };

  // Fase: Entrada
  if (!participantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Código F Quiz</h1>
            <p className="text-muted-foreground">Mito ou Verdade sobre Transformação Digital</p>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                type="text"
                placeholder="Digite seu nome"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
                className="text-lg h-12"
                autoFocus
              />
              <Button type="submit" size="lg" className="w-full" disabled={!nickname.trim()}>
                Entrar
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // Fase: Aguardando início
  if (!sessionState || sessionState.current_phase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Bem-vindo(a), {nickname}! 👋</h2>
          <div className="animate-pulse">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-xl text-muted-foreground">Aguarde o início do quiz...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Fase: Pergunta
  if (sessionState.current_phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Pergunta {questionIndex}/{totalQuestions}</span>
            <CodigoFTimer
              startTime={sessionState.question_started_at}
              duration={30}
              className="scale-50 origin-right"
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold leading-tight">{currentQuestion.question_text}</h2>
          </div>

          {!hasAnswered ? (
            <div className="space-y-3">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-16 text-xl font-bold"
                onClick={() => handleAnswer('MITO')}
                disabled={isSubmitting}
              >
                {isSubmitting && selectedAnswer === 'MITO' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'MITO'
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-16 text-xl font-bold"
                onClick={() => handleAnswer('VERDADE')}
                disabled={isSubmitting}
              >
                {isSubmitting && selectedAnswer === 'VERDADE' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'VERDADE'
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-xl font-semibold">Resposta enviada!</p>
              <p className="text-muted-foreground mt-2">Aguarde o resultado...</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Fase: Explicação
  if (sessionState.current_phase === 'explanation' && currentQuestion) {
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isCorrect ? 'animate-bounce' : ''}`}>
              {isCorrect ? '✅' : '❌'}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isCorrect ? 'Você acertou!' : 'Não foi dessa vez!'}
            </h2>
            <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-lg font-semibold">
                Resposta correta: {currentQuestion.correct_answer}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
          </div>

          <div className="text-center text-muted-foreground">
            <p>Aguardando próxima pergunta...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Fase: Finalizado
  if (sessionState.current_phase === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold">Quiz Finalizado!</h2>
          <p className="text-xl text-muted-foreground">
            Obrigado por participar, {nickname}!
          </p>
          <p className="text-sm text-muted-foreground">
            Continue aprendendo sobre transformação digital!
          </p>
        </Card>
      </div>
    );
  }

  return null;
};

export default CodigoFQuizParticipant;
