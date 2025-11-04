import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Question {
  id: string;
  question_text: string;
  correct_answer: 'MITO' | 'VERDADE';
  explanation: string;
  order_position: number;
}

export interface SessionState {
  id: string;
  current_phase: 'waiting' | 'question' | 'explanation' | 'ended';
  current_question_id: string | null;
  question_started_at: string | null;
  session_started_at: string;
  updated_at: string;
}

export interface AnswerStats {
  mito: number;
  verdade: number;
  total: number;
}

export const useCodigoFQuiz = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ mito: 0, verdade: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar perguntas
  useEffect(() => {
    const loadQuestions = async () => {
      const { data, error } = await supabase
        .from('codigo_f_questions')
        .select('*')
        .order('order_position');

      if (error) {
        console.error('Erro ao carregar perguntas:', error);
        toast({ title: 'Erro ao carregar perguntas', variant: 'destructive' });
        return;
      }

      setQuestions((data || []) as Question[]);
      setIsLoading(false);
    };

    loadQuestions();
  }, [toast]);

  // Escutar estado da sessão
  useEffect(() => {
    const loadSessionState = async () => {
      const { data } = await supabase
        .from('codigo_f_session_state')
        .select('*')
        .single();

      if (data) {
        setSessionState(data as SessionState);
      }
    };

    loadSessionState();

    const channel = supabase
      .channel('session-state-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'codigo_f_session_state'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSessionState(payload.new as SessionState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Contar participantes (com throttle)
  useEffect(() => {
    const updateParticipantCount = async () => {
      const { count } = await supabase
        .from('codigo_f_participants')
        .select('*', { count: 'exact', head: true });

      setParticipantCount(count || 0);
    };

    updateParticipantCount();

    const interval = setInterval(updateParticipantCount, 2000); // Atualizar a cada 2 segundos

    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'codigo_f_participants'
        },
        () => {
          updateParticipantCount();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Estatísticas de respostas
  useEffect(() => {
    if (!sessionState?.current_question_id) {
      setAnswerStats({ mito: 0, verdade: 0, total: 0 });
      return;
    }

    const updateAnswerStats = async () => {
      const { data } = await supabase
        .from('codigo_f_answers')
        .select('answer')
        .eq('question_id', sessionState.current_question_id);

      if (data) {
        const stats = {
          mito: data.filter(a => a.answer === 'MITO').length,
          verdade: data.filter(a => a.answer === 'VERDADE').length,
          total: data.length
        };
        setAnswerStats(stats);
      }
    };

    updateAnswerStats();

    const channel = supabase
      .channel('answers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'codigo_f_answers',
          filter: `question_id=eq.${sessionState.current_question_id}`
        },
        () => {
          updateAnswerStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionState?.current_question_id]);

  // Funções do host
  const startSession = useCallback(async () => {
    const firstQuestion = questions[0];
    if (!firstQuestion) return;

    const { error } = await supabase
      .from('codigo_f_session_state')
      .upsert({
        current_phase: 'question',
        current_question_id: firstQuestion.id,
        question_started_at: new Date().toISOString(),
        session_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast({ title: 'Erro ao iniciar quiz', variant: 'destructive' });
    }
  }, [questions, toast]);

  const nextQuestion = useCallback(async () => {
    if (!sessionState) return;

    const currentIndex = questions.findIndex(q => q.id === sessionState.current_question_id);
    const nextQuestion = questions[currentIndex + 1];

    if (!nextQuestion) {
      // Fim do quiz
      const { error } = await supabase
        .from('codigo_f_session_state')
        .update({
          current_phase: 'ended',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.id);

      if (error) {
        console.error('Erro ao finalizar quiz:', error);
      }
      return;
    }

    const { error } = await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'question',
        current_question_id: nextQuestion.id,
        question_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);

    if (error) {
      console.error('Erro ao avançar pergunta:', error);
      toast({ title: 'Erro ao avançar pergunta', variant: 'destructive' });
    }
  }, [sessionState, questions, toast]);

  const showExplanation = useCallback(async () => {
    if (!sessionState) return;

    const { error } = await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'explanation',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);

    if (error) {
      console.error('Erro ao mostrar explicação:', error);
    }
  }, [sessionState]);

  const getCurrentQuestion = useCallback(() => {
    if (!sessionState?.current_question_id) return null;
    return questions.find(q => q.id === sessionState.current_question_id) || null;
  }, [sessionState, questions]);

  const getCurrentQuestionIndex = useCallback(() => {
    if (!sessionState?.current_question_id) return 0;
    return questions.findIndex(q => q.id === sessionState.current_question_id) + 1;
  }, [sessionState, questions]);

  return {
    questions,
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    startSession,
    nextQuestion,
    showExplanation,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    totalQuestions: questions.length
  };
};
