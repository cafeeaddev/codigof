import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuiz1 } from '../quiz1/useQuiz1';
import { ExternalLink, Play, SkipForward, Square, AlertCircle, RefreshCw, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const Quiz1Control = () => {
  const {
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    lastSyncTime,
    startSession,
    nextQuestion,
    showExplanation,
    showRanking,
    endSession,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    questions,
    forceRefresh
  } = useQuiz1();

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();
  const screenUrl = `${window.location.origin}/quiz/mito-verdade/screen`;

  const getPhaseText = () => {
    switch (sessionState?.current_phase) {
      case 'waiting': return 'Aguardando início';
      case 'question': return `Pergunta ${questionIndex}/${questions.length} em andamento`;
      case 'explanation': return `Mostrando explicação ${questionIndex}/${questions.length}`;
      case 'ranking': return 'Mostrando ranking';
      case 'ended': return 'Quiz finalizado';
      default: return 'Carregando...';
    }
  };

  const responsePercentage = participantCount > 0 
    ? Math.round((answerStats.total / participantCount) * 100) 
    : 0;

  // Show error state if session could not be initialized
  if (!sessionState && !isLoading) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar sessão</AlertTitle>
          <AlertDescription>
            Não foi possível inicializar a sessão do quiz. Recarregue a página.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">⚡ Mito ou Verdade</h2>
          <p className="text-muted-foreground">Transformação Digital em 30 segundos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={forceRefresh}
            className="gap-2"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(screenUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Tela de Projeção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Status</div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-sm">
              {sessionState?.current_phase === 'waiting' && '🟡 Aguardando'}
              {sessionState?.current_phase === 'question' && '🟢 Em andamento'}
              {sessionState?.current_phase === 'explanation' && '🔵 Explicação'}
              {sessionState?.current_phase === 'ranking' && '🏆 Ranking'}
              {sessionState?.current_phase === 'ended' && '⚫ Finalizado'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Circle className={cn("w-2 h-2 fill-green-500")} />
              Sincronizado
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {getPhaseText()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Última atualização: {lastSyncTime.toLocaleTimeString('pt-BR')}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Participantes</div>
          <div className="text-3xl font-bold">{participantCount}</div>
          <div className="text-xs text-muted-foreground">conectados</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Respostas</div>
          <div className="text-3xl font-bold">{answerStats.total}/{participantCount}</div>
          <div className="text-xs text-muted-foreground">{responsePercentage}% responderam</div>
        </Card>
      </div>

      {sessionState?.current_phase === 'question' && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Respostas recebidas:</div>
          <Progress value={responsePercentage} className="h-3" />
        </div>
      )}

      {(sessionState?.current_phase === 'question' || sessionState?.current_phase === 'explanation') && (
        <Card className="p-4 bg-muted/50">
          <div className="text-sm font-medium mb-3">Estatísticas Atuais:</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">MITO</span>
                <span className="text-sm">
                  {answerStats.total > 0 ? Math.round((answerStats.mito / answerStats.total) * 100) : 0}% ({answerStats.mito})
                </span>
              </div>
              <Progress 
                value={answerStats.total > 0 ? (answerStats.mito / answerStats.total) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">VERDADE</span>
                <span className="text-sm">
                  {answerStats.total > 0 ? Math.round((answerStats.verdade / answerStats.total) * 100) : 0}% ({answerStats.verdade})
                </span>
              </div>
              <Progress 
                value={answerStats.total > 0 ? (answerStats.verdade / answerStats.total) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>
          {currentQuestion && sessionState?.current_phase === 'explanation' && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm font-medium text-green-600">
                ✅ Resposta correta: {currentQuestion.correct_answer}
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        {sessionState?.current_phase === 'waiting' && (
          <Button onClick={startSession} className="gap-2" size="lg">
            <Play className="w-4 h-4" />
            Iniciar Quiz
          </Button>
        )}

        {sessionState?.current_phase === 'question' && (
          <Button onClick={showExplanation} className="gap-2" size="lg">
            Mostrar Explicação
          </Button>
        )}

        {sessionState?.current_phase === 'explanation' && (
          <Button onClick={nextQuestion} className="gap-2" size="lg">
            <SkipForward className="w-4 h-4" />
            {questionIndex < questions.length ? 'Próxima Pergunta' : 'Ver Ranking'}
          </Button>
        )}

        {sessionState?.current_phase === 'ranking' && (
          <Button onClick={endSession} className="gap-2" size="lg">
            <Square className="w-4 h-4" />
            Finalizar Quiz
          </Button>
        )}

        {sessionState?.current_phase === 'ended' && (
          <Button disabled className="gap-2" size="lg">
            <Square className="w-4 h-4" />
            Quiz Finalizado
          </Button>
        )}
      </div>
    </Card>
  );
};
