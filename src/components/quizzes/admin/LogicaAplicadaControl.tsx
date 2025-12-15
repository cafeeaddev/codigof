import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ExternalLink, 
  Play, 
  SkipForward, 
  Trophy, 
  RotateCcw, 
  Download,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useLogicaAplicada } from '@/components/quizzes/logica-aplicada/useLogicaAplicada';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function LogicaAplicadaControl() {
  const { 
    sessionState, 
    participantCount, 
    questions,
    getCurrentQuestionIndex,
    startQuiz,
    showRanking,
    nextQuestion,
    endQuiz,
    resetQuiz,
    initializeSession
  } = useLogicaAplicada();
  
  const [isResetting, setIsResetting] = useState(false);

  const questionIndex = getCurrentQuestionIndex();
  const isLastQuestion = questionIndex === questions.length - 1;

  const handleOpenScreen = () => {
    window.open('/quiz/logica-aplicada/screen', '_blank');
  };

  const handleStart = async () => {
    await initializeSession();
    await startQuiz();
    toast.success('Quiz iniciado!');
  };

  const handleShowRanking = async () => {
    await showRanking();
    toast.success('Ranking exibido');
  };

  const handleNextQuestion = async () => {
    await nextQuestion();
    toast.success(isLastQuestion ? 'Quiz finalizado!' : 'Próxima pergunta');
  };

  const handleEnd = async () => {
    await endQuiz();
    toast.success('Quiz finalizado!');
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetQuiz();
    await initializeSession();
    setIsResetting(false);
    toast.success('Quiz resetado!');
  };

  const handleExport = async () => {
    const { data: participants } = await supabase
      .from('logica_aplicada_participants')
      .select('id, nickname, joined_at');

    const { data: answers } = await supabase
      .from('logica_aplicada_answers')
      .select('participant_id, question_id, answer, time_taken_ms, points_earned');

    const { data: questionsData } = await supabase
      .from('logica_aplicada_questions')
      .select('id, order_position, correct_option');

    if (!participants || !answers || !questionsData) {
      toast.error('Erro ao exportar dados');
      return;
    }

    // Calculate totals per participant
    const participantData = participants.map(p => {
      const participantAnswers = answers.filter(a => a.participant_id === p.id);
      const totalPoints = participantAnswers.reduce((sum, a) => sum + a.points_earned, 0);
      const correctCount = participantAnswers.filter(a => {
        const q = questionsData.find(q => q.id === a.question_id);
        return q && a.answer === q.correct_option;
      }).length;

      return {
        nickname: p.nickname,
        total_points: totalPoints,
        correct_answers: correctCount,
        total_questions: questionsData.length,
        joined_at: p.joined_at
      };
    });

    // Sort by points
    participantData.sort((a, b) => b.total_points - a.total_points);

    const csvContent = [
      ['Posição', 'Participante', 'Pontos', 'Acertos', 'Total Perguntas', 'Entrada'].join(','),
      ...participantData.map((p, idx) => [
        idx + 1,
        `"${p.nickname}"`,
        p.total_points,
        p.correct_answers,
        p.total_questions,
        p.joined_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-logica-aplicada-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('CSV exportado!');
  };

  const getPhaseLabel = () => {
    switch (sessionState?.current_phase) {
      case 'waiting': return 'Aguardando';
      case 'question': return `Pergunta ${questionIndex + 1}/${questions.length}`;
      case 'ranking_parcial': return 'Ranking Parcial';
      case 'ended': return 'Finalizado';
      default: return 'Não iniciado';
    }
  };

  return (
    <Card className="border-emerald-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">🧠</span>
          Quiz – Lógica Aplicada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicators */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{participantCount} participantes</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{getPhaseLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{questions.length} perguntas</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenScreen}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Projeção
          </Button>
          
          {(!sessionState || sessionState.current_phase === 'waiting') && (
            <Button size="sm" onClick={handleStart} className="bg-emerald-600 hover:bg-emerald-500">
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}

          {sessionState?.current_phase === 'question' && (
            <Button size="sm" onClick={handleShowRanking} variant="secondary">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </Button>
          )}

          {sessionState?.current_phase === 'ranking_parcial' && (
            <Button size="sm" onClick={handleNextQuestion} className="bg-emerald-600 hover:bg-emerald-500">
              <SkipForward className="w-4 h-4 mr-2" />
              {isLastQuestion ? 'Finalizar' : 'Próxima'}
            </Button>
          )}

          {sessionState?.current_phase === 'ended' && (
            <Button size="sm" onClick={handleExport} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          )}
        </div>

        {/* Reset button */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isResetting}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá remover todos os participantes e respostas. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Resetar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
