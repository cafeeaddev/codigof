import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  order_position: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  feedback_correct: string;
  feedback_incorrect: string;
}

interface SessionState {
  id: string;
  current_phase: 'waiting' | 'question' | 'explanation' | 'ranking' | 'ended';
  current_question_id: string | null;
  question_started_at: string | null;
  session_started_at: string;
  updated_at: string;
}

interface AnswerStats {
  a: number;
  b: number;
  c: number;
  d: number;
  total: number;
}

interface Participant {
  id: string;
  nickname: string;
  joined_at: string;
}

interface Answer {
  id: string;
  participant_id: string;
  question_id: string;
  answer: 'A' | 'B' | 'C' | 'D';
  answered_at: string;
}

export const useQuiz3 = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ a: 0, b: 0, c: 0, d: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await supabase
        .from('quiz3_questions')
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
      const { data, error } = await supabase
        .from('quiz3_session_state')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[Quiz3] Error loading session state:', error);
      }

      if (data) {
        setSessionState(data as SessionState);
      } else {
        // Criar registro inicial se não existir
        console.log('[Quiz3] Creating initial session state...');
        const { data: newState, error: createError } = await supabase
          .from('quiz3_session_state')
          .insert({
            current_phase: 'waiting',
            current_question_id: null,
            question_started_at: null,
            session_started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('[Quiz3] Error creating session state:', createError);
        } else if (newState) {
          console.log('[Quiz3] Session state created:', newState);
          setSessionState(newState as SessionState);
        }
      }
    };

    loadSessionState();

    const channel = supabase
      .channel('quiz3-session')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz3_session_state'
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
    const updateParticipants = async () => {
      const { data, count } = await supabase
        .from('quiz3_participants')
        .select('*', { count: 'exact' });
      
      setParticipantCount(count || 0);
      if (data) setParticipants(data);
    };

    updateParticipants();
    const interval = setInterval(updateParticipants, 5000);

    const channel = supabase
      .channel('quiz3-participants')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz3_participants'
      }, () => {
        updateParticipants();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Track all answers
  useEffect(() => {
    const updateAnswers = async () => {
      const { data } = await supabase
        .from('quiz3_answers')
        .select('*');
      
      if (data) setAnswers(data as Answer[]);
    };

    updateAnswers();

    // Polling fallback - atualiza a cada 2 segundos
    const pollInterval = setInterval(updateAnswers, 2000);

    const channel = supabase
      .channel('quiz3-all-answers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz3_answers'
      }, () => {
        updateAnswers();
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate stats for current question
  useEffect(() => {
    if (!sessionState?.current_question_id) return;

    const questionAnswers = answers.filter(a => a.question_id === sessionState.current_question_id);
    const stats = questionAnswers.reduce((acc, curr) => {
      const answerLower = curr.answer.toLowerCase();
      acc[answerLower as keyof AnswerStats]++;
      acc.total++;
      return acc;
    }, { a: 0, b: 0, c: 0, d: 0, total: 0 });

    setAnswerStats(stats);
  }, [answers, sessionState?.current_question_id]);

  // Calculate ranking
  const ranking = useMemo(() => {
    const scores = participants.map(p => {
      const participantAnswers = answers.filter(a => a.participant_id === p.id);
      const correctAnswers = participantAnswers.filter(a => {
        const question = questions.find(q => q.id === a.question_id);
        return question && question.correct_option === a.answer;
      });

      return {
        id: p.id,
        nickname: p.nickname,
        score: correctAnswers.length,
        total: questions.length
      };
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [participants, answers, questions]);

  const startSession = useCallback(async () => {
    const firstQuestion = questions[0];
    if (!firstQuestion) {
      console.error('[Quiz3] No questions available');
      return;
    }

    if (!sessionState?.id) {
      console.error('[Quiz3] Session state not loaded, cannot start');
      return;
    }

    console.log('[Quiz3] Starting session with question:', firstQuestion.id);

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('quiz3_session_state')
      .update({
        current_phase: 'question',
        current_question_id: firstQuestion.id,
        question_started_at: now,
        updated_at: now
      })
      .eq('id', sessionState.id);

    if (error) {
      console.error('[Quiz3] Error starting session:', error);
    } else {
      console.log('[Quiz3] Session started successfully');
      // Optimistic local update to reflect immediately even if realtime is delayed
      setSessionState(prev => prev ? {
        ...prev,
        current_phase: 'question',
        current_question_id: firstQuestion.id,
        question_started_at: now,
        updated_at: now
      } : prev);
    }
  }, [questions, sessionState]);

  const nextQuestion = useCallback(async () => {
    if (!sessionState) return;

    const currentIndex = questions.findIndex(q => q.id === sessionState.current_question_id);
    const nextQ = questions[currentIndex + 1];

    if (nextQ) {
      await supabase
        .from('quiz3_session_state')
        .update({
          current_phase: 'question',
          current_question_id: nextQ.id,
          question_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.id);
    } else {
      // Go to ranking
      await supabase
        .from('quiz3_session_state')
        .update({
          current_phase: 'ranking',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.id);
    }
  }, [questions, sessionState]);

  const showExplanation = useCallback(async () => {
    if (!sessionState) return;

    await supabase
      .from('quiz3_session_state')
      .update({
        current_phase: 'explanation',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);
  }, [sessionState]);

  const endSession = useCallback(async () => {
    if (!sessionState) return;

    await supabase
      .from('quiz3_session_state')
      .update({
        current_phase: 'ended',
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
    ranking,
    isLoading,
    startSession,
    nextQuestion,
    showExplanation,
    endSession,
    getCurrentQuestion,
    getCurrentQuestionIndex
  };
};
