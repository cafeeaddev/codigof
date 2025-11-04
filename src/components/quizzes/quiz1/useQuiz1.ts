import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  order_position: number;
  question_text: string;
  correct_answer: 'MITO' | 'VERDADE';
  explanation: string;
}

interface SessionState {
  id: string;
  current_phase: 'waiting' | 'question' | 'explanation' | 'ended';
  current_question_id: string | null;
  question_started_at: string | null;
  session_started_at: string;
  updated_at: string;
}

interface AnswerStats {
  mito: number;
  verdade: number;
  total: number;
}

export const useQuiz1 = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ mito: 0, verdade: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await supabase
        .from('codigo_f_questions')
        .select('*')
        .order('order_position');
      
      if (data) {
        setQuestions(data as Question[]);
      }
      setIsLoading(false);
    };

    loadQuestions();
  }, []);

  // Load and subscribe to session state
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
      .channel('quiz1-session')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'codigo_f_session_state'
      }, (payload: any) => {
        if (payload.new) {
          setSessionState(payload.new as SessionState);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Track participants
  useEffect(() => {
    const updateParticipantCount = async () => {
      const { count } = await supabase
        .from('codigo_f_participants')
        .select('*', { count: 'exact', head: true });
      
      setParticipantCount(count || 0);
    };

    updateParticipantCount();
    const interval = setInterval(updateParticipantCount, 5000);

    const channel = supabase
      .channel('quiz1-participants')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'codigo_f_participants'
      }, () => {
        updateParticipantCount();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Track answers for current question
  useEffect(() => {
    if (!sessionState?.current_question_id) return;

    const updateAnswerStats = async () => {
      const { data } = await supabase
        .from('codigo_f_answers')
        .select('answer')
        .eq('question_id', sessionState.current_question_id);

      if (data) {
        const stats = data.reduce((acc, curr) => {
          if (curr.answer === 'MITO') acc.mito++;
          else if (curr.answer === 'VERDADE') acc.verdade++;
          acc.total++;
          return acc;
        }, { mito: 0, verdade: 0, total: 0 });

        setAnswerStats(stats);
      }
    };

    updateAnswerStats();

    const channel = supabase
      .channel('quiz1-answers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'codigo_f_answers',
        filter: `question_id=eq.${sessionState.current_question_id}`
      }, () => {
        updateAnswerStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionState?.current_question_id]);

  const startSession = useCallback(async () => {
    const firstQuestion = questions[0];
    if (!firstQuestion) return;

    await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'question',
        current_question_id: firstQuestion.id,
        question_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState?.id);
  }, [questions, sessionState]);

  const nextQuestion = useCallback(async () => {
    if (!sessionState) return;

    const currentIndex = questions.findIndex(q => q.id === sessionState.current_question_id);
    const nextQ = questions[currentIndex + 1];

    if (nextQ) {
      await supabase
        .from('codigo_f_session_state')
        .update({
          current_phase: 'question',
          current_question_id: nextQ.id,
          question_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.id);
    } else {
      await supabase
        .from('codigo_f_session_state')
        .update({
          current_phase: 'ended',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.id);
    }
  }, [questions, sessionState]);

  const showExplanation = useCallback(async () => {
    if (!sessionState) return;

    await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'explanation',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);
  }, [sessionState]);

  const getCurrentQuestion = useCallback(() => {
    return questions.find(q => q.id === sessionState?.current_question_id);
  }, [questions, sessionState]);

  const getCurrentQuestionIndex = useCallback(() => {
    return questions.findIndex(q => q.id === sessionState?.current_question_id) + 1;
  }, [questions, sessionState]);

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
    getCurrentQuestionIndex
  };
};
