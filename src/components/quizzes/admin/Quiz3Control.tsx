import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuiz3 } from '../quiz3/useQuiz3';
import { ExternalLink, Play, SkipForward, Trophy, Square, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Quiz3Control = () => {
  const {
    sessionState,
    participantCount,
    answerStats,
    ranking,
    startSession,
    nextQuestion,
    showExplanation,
    endSession,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    questions
  } = useQuiz3();

  const currentQuestion = getCurrentQuestion();
  const questionIndex = getCurrentQuestionIndex();
  const screenUrl = `${window.location.origin}/quiz/solucoes-digitais/screen`;

  const getPhaseText = () => {
    switch (sessionState?.current_phase) {
      case 'waiting': return 'Aguardando início';
      case 'question': return `Pergunta ${questionIndex}/${questions.length} em andamento`;
      case 'explanation': return `Mostrando explicação ${questionIndex}/${questions.length}`;
      case 'ranking': return 'Exibindo ranking final';
      case 'ended': return 'Quiz finalizado';
      default: return 'Carregando...';
    }
  };

  const responsePercentage = participantCount > 0 
    ? Math.round((answerStats.total / participantCount) * 100) 
    : 0;

  const getOptionPercentage = (count: number) => {
    return answerStats.total > 0 ? Math.round((count / answerStats.total) * 100) : 0;
  };

  const exportToCSV = async () => {
    try {
      const { data: participants, error: pError } = await supabase
        .from('quiz3_participants')
        .select('*')
        .order('joined_at', { ascending: false });

      const { data: answers, error: aError } = await supabase
        .from('quiz3_answers')
        .select('*, quiz3_questions(question_text, correct_option)')
        .order('answered_at', { ascending: false });

      if (pError || aError) throw pError || aError;

      const headers = ['Participante', 'Data Entrada', 'Pergunta', 'Resposta', 'Resposta Correta', 'Data Resposta'];
      const rows = (answers || []).map(ans => [
        participants?.find(p => p.id === ans.participant_id)?.nickname || 'N/A',
        participants?.find(p => p.id === ans.participant_id)?.joined_at 
          ? new Date(participants.find(p => p.id === ans.participant_id)!.joined_at!).toLocaleString('pt-BR')
          : 'N/A',
        ans.quiz3_questions?.question_text || 'N/A',
        ans.answer,
        ans.quiz3_questions?.correct_option || 'N/A',
        ans.answered_at ? new Date(ans.answered_at).toLocaleString('pt-BR') : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `quiz3_solucoes-digitais_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Respostas exportadas com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar respostas');
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🎯 Soluções Digitais</h2>
          <p className="text-muted-foreground">Identifique a solução certa</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar
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
          <Badge className="text-sm">
            {sessionState?.current_phase === 'waiting' && '🟡 Aguardando'}
            {sessionState?.current_phase === 'question' && '🟢 Em andamento'}
            {sessionState?.current_phase === 'explanation' && '🔵 Explicação'}
            {sessionState?.current_phase === 'ranking' && '🏆 Ranking'}
            {sessionState?.current_phase === 'ended' && '⚫ Finalizado'}
          </Badge>
          <div className="text-xs text-muted-foreground mt-2">
            {getPhaseText()}
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

      {(sessionState?.current_phase === 'question' || sessionState?.current_phase === 'explanation') && currentQuestion && (
        <Card className="p-4 bg-muted/50">
          <div className="text-sm font-medium mb-3">Distribuição de Respostas:</div>
          <div className="space-y-3">
            {[
              { key: 'A', label: currentQuestion.option_a, count: answerStats.a },
              { key: 'B', label: currentQuestion.option_b, count: answerStats.b },
              { key: 'C', label: currentQuestion.option_c, count: answerStats.c },
              { key: 'D', label: currentQuestion.option_d, count: answerStats.d },
            ].map(({ key, label, count }) => {
              const percentage = getOptionPercentage(count);
              const isCorrect = key === currentQuestion.correct_option;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isCorrect ? 'font-bold text-green-600' : ''}>
                      {key}) {label} {isCorrect && sessionState?.current_phase === 'explanation' && '✅'}
                    </span>
                    <span>{percentage}% ({count})</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {(sessionState?.current_phase === 'ranking' || sessionState?.current_phase === 'explanation') && ranking.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold">Top 3 Ranking:</span>
          </div>
          <div className="space-y-2">
            {ranking.slice(0, 3).map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </span>
                  <span className="font-semibold">{entry.nickname}</span>
                </div>
                <Badge variant="secondary">
                  {entry.score}/{entry.total} pontos
                </Badge>
              </div>
            ))}
          </div>
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
            {questionIndex < questions.length ? 'Próxima Pergunta' : 'Mostrar Ranking'}
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
