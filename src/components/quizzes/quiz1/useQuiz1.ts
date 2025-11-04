import { useState, useEffect, useCallback, useMemo } from 'react';
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
  current_phase: 'waiting' | 'question' | 'explanation' | 'ranking' | 'ended';
  current_question_id: string | null;
  question_started_at: string | null;
  session_started_at: string;
  updated_at: string;
}

interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  total: number;
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
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

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
      let { data } = await supabase
        .from('codigo_f_session_state')
        .select('*')
        .maybeSingle();
      
      // If no session exists, create one
      if (!data) {
        const { data: newSession } = await supabase
          .from('codigo_f_session_state')
          .insert({
            current_phase: 'waiting',
            session_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        data = newSession;
      }
      
      if (data) {
        setSessionState(data as SessionState);
        setLastSyncTime(new Date());
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
          setLastSyncTime(new Date());
        }
      })
      .subscribe();

    // Polling fallback - garante sincronização a cada 3 segundos
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('codigo_f_session_state')
        .select('*')
        .maybeSingle();
      
      if (data && JSON.stringify(data) !== JSON.stringify(sessionState)) {
        setSessionState(data as SessionState);
        setLastSyncTime(new Date());
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [sessionState]);

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

    // Reset stats quando muda a pergunta
    setAnswerStats({ mito: 0, verdade: 0, total: 0 });

    const updateAnswerStats = async () => {
      const { data, error } = await supabase
        .from('codigo_f_answers')
        .select('participant_id, answer')
        .eq('question_id', sessionState.current_question_id);

      if (error) {
        console.warn('[Quiz1] Error fetching answers:', error);
        return;
      }

      if (data) {
        // Contar apenas uma resposta por participante (última resposta)
        const byParticipant = new Map<string, string>();
        data.forEach(row => {
          byParticipant.set(row.participant_id, row.answer);
        });

        const values = Array.from(byParticipant.values());
        const stats = {
          mito: values.filter(v => v === 'MITO').length,
          verdade: values.filter(v => v === 'VERDADE').length,
          total: values.length
        };

        setAnswerStats(stats);
      }
    };

    updateAnswerStats();

    // Polling mais rápido (1s) apenas durante a fase de pergunta
    let pollInterval: NodeJS.Timeout | null = null;
    if (sessionState.current_phase === 'question') {
      pollInterval = setInterval(updateAnswerStats, 1000);
    }

    // Canal de broadcast para atualização imediata
    const broadcast = supabase
      .channel('quiz1-broadcast')
      .on('broadcast', { event: 'answer_submitted' }, (payload: any) => {
        if (payload?.question_id === sessionState.current_question_id) {
          updateAnswerStats();
        }
      })
      .subscribe();

    // Canal de postgres changes (fallback)
    const channel = supabase
      .channel(`quiz1-answers-${sessionState.current_question_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'codigo_f_answers'
      }, (payload: any) => {
        if (payload.new?.question_id === sessionState.current_question_id) {
          updateAnswerStats();
        }
      })
      .subscribe();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(broadcast);
      supabase.removeChannel(channel);
    };
  }, [sessionState?.current_question_id, sessionState?.current_phase]);

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
      // Última pergunta finalizada, ir para ranking
      await supabase
        .from('codigo_f_session_state')
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

  const showRanking = useCallback(async () => {
    if (!sessionState) return;

    await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'ranking',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);
  }, [sessionState]);

  const endSession = useCallback(async () => {
    if (!sessionState) return;

    await supabase
      .from('codigo_f_session_state')
      .update({
        current_phase: 'ended',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionState.id);
  }, [sessionState]);

  const forceRefresh = useCallback(async () => {
    const { data } = await supabase
      .from('codigo_f_session_state')
      .select('*')
      .maybeSingle();
    
    if (data) {
      setSessionState(data as SessionState);
      setLastSyncTime(new Date());
    }
  }, []);

  // Ranking state
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  // Update ranking when in ranking phase
  useEffect(() => {
    if (sessionState?.current_phase !== 'ranking') return;

    const calculateRanking = async () => {
      const { data: participants } = await supabase
        .from('codigo_f_participants')
        .select('id, nickname');

      if (!participants) return;

      const { data: answers } = await supabase
        .from('codigo_f_answers')
        .select('participant_id, question_id, answer');

      if (!answers) return;

      const scores = participants.map(participant => {
        const participantAnswers = answers.filter(a => a.participant_id === participant.id);
        
        let correctCount = 0;
        participantAnswers.forEach(answer => {
          const question = questions.find(q => q.id === answer.question_id);
          if (question && question.correct_answer === answer.answer) {
            correctCount++;
          }
        });

        return {
          id: participant.id,
          nickname: participant.nickname,
          score: correctCount,
          total: questions.length
        };
      });

      const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
      setRanking(sortedScores);
    };

    calculateRanking();
  }, [sessionState?.current_phase, questions]);

  return {
    questions,
    sessionState,
    participantCount,
    answerStats,
    isLoading,
    lastSyncTime,
    ranking,
    startSession,
    nextQuestion,
    showExplanation,
    showRanking,
    endSession,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    forceRefresh
  };
};
