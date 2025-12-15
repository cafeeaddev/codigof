import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  order_position: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
}

export interface SessionState {
  id: string;
  current_phase: 'waiting' | 'question' | 'ranking_parcial' | 'ended';
  current_question_id: string | null;
  question_started_at: string | null;
  session_started_at: string | null;
  updated_at: string | null;
}

export interface RankingEntry {
  participant_id: string;
  nickname: string;
  total_points: number;
  position: number;
  position_change?: number;
}

export interface Participant {
  id: string;
  nickname: string;
  joined_at: string | null;
}

const TOTAL_TIME_MS = 30000; // 30 seconds
const BASE_POINTS = 1000;
const MIN_POINTS = 500;

export function calculatePoints(isCorrect: boolean, timeRemainingMs: number): number {
  if (!isCorrect) return 0;
  
  const speedBonus = timeRemainingMs / TOTAL_TIME_MS;
  const points = Math.round(MIN_POINTS + (BASE_POINTS - MIN_POINTS) * speedBonus);
  
  return Math.max(MIN_POINTS, Math.min(BASE_POINTS, points));
}

export function useLogicaAplicada() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await supabase
        .from('logica_aplicada_questions')
        .select('*')
        .order('order_position');
      
      if (data) {
        setQuestions(data as Question[]);
      }
    };
    loadQuestions();
  }, []);

  // Load and subscribe to session state
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase
        .from('logica_aplicada_session_state')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setSessionState(data as SessionState);
      }
      setIsLoading(false);
    };
    loadSession();

    const channel = supabase
      .channel('logica-aplicada-session')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'logica_aplicada_session_state'
      }, (payload) => {
        if (payload.new) {
          setSessionState(payload.new as SessionState);
        }
      })
      .subscribe();

    // Polling fallback
    const interval = setInterval(loadSession, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Load and subscribe to participant count
  useEffect(() => {
    const loadParticipants = async () => {
      const { count } = await supabase
        .from('logica_aplicada_participants')
        .select('*', { count: 'exact', head: true });
      
      setParticipantCount(count || 0);
    };
    loadParticipants();

    const channel = supabase
      .channel('logica-aplicada-participants')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'logica_aplicada_participants'
      }, () => {
        loadParticipants();
      })
      .subscribe();

    const interval = setInterval(loadParticipants, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Calculate ranking
  const calculateRanking = useCallback(async () => {
    const { data: participants } = await supabase
      .from('logica_aplicada_participants')
      .select('id, nickname');

    const { data: answers } = await supabase
      .from('logica_aplicada_answers')
      .select('participant_id, points_earned');

    if (!participants || !answers) return;

    const pointsMap = new Map<string, number>();
    answers.forEach(a => {
      const current = pointsMap.get(a.participant_id) || 0;
      pointsMap.set(a.participant_id, current + a.points_earned);
    });

    const rankingData: RankingEntry[] = participants.map(p => ({
      participant_id: p.id,
      nickname: p.nickname,
      total_points: pointsMap.get(p.id) || 0,
      position: 0
    }));

    rankingData.sort((a, b) => b.total_points - a.total_points);
    rankingData.forEach((entry, idx) => {
      entry.position = idx + 1;
    });

    setRanking(rankingData);
  }, []);

  // Update ranking when phase changes to ranking_parcial or ended
  useEffect(() => {
    if (sessionState?.current_phase === 'ranking_parcial' || sessionState?.current_phase === 'ended') {
      calculateRanking();
    }
  }, [sessionState?.current_phase, calculateRanking]);

  // Session control functions (admin only)
  const initializeSession = useCallback(async () => {
    const { data: existing } = await supabase
      .from('logica_aplicada_session_state')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await supabase.from('logica_aplicada_session_state').insert({
        current_phase: 'waiting',
        current_question_id: null
      });
    }
  }, []);

  const startQuiz = useCallback(async () => {
    if (questions.length === 0) return;
    
    const firstQuestion = questions[0];
    // Use server timestamp via RPC for synchronized timers
    await supabase.rpc('start_logica_aplicada_question', {
      p_question_id: firstQuestion.id
    });
  }, [questions]);

  const showRanking = useCallback(async () => {
    await supabase
      .from('logica_aplicada_session_state')
      .update({
        current_phase: 'ranking_parcial',
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }, []);

  const nextQuestion = useCallback(async () => {
    if (!sessionState?.current_question_id || questions.length === 0) return;

    const currentIdx = questions.findIndex(q => q.id === sessionState.current_question_id);
    
    if (currentIdx < questions.length - 1) {
      const nextQ = questions[currentIdx + 1];
      // Use server timestamp via RPC for synchronized timers
      await supabase.rpc('next_logica_aplicada_question', {
        p_question_id: nextQ.id,
        p_is_final: false
      });
    } else {
      // Last question - go to final ranking
      await supabase.rpc('next_logica_aplicada_question', {
        p_question_id: null,
        p_is_final: true
      });
    }
  }, [sessionState, questions]);

  const endQuiz = useCallback(async () => {
    await supabase
      .from('logica_aplicada_session_state')
      .update({
        current_phase: 'ended',
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }, []);

  const resetQuiz = useCallback(async () => {
    // Delete all answers
    await supabase.from('logica_aplicada_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Delete all participants
    await supabase.from('logica_aplicada_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Reset session state
    await supabase
      .from('logica_aplicada_session_state')
      .update({
        current_phase: 'waiting',
        current_question_id: null,
        question_started_at: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    setRanking([]);
    setParticipantCount(0);
  }, []);

  // Participant functions
  const joinQuiz = useCallback(async (nickname: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('logica_aplicada_participants')
      .insert({ nickname })
      .select('id')
      .single();
    
    if (error) return null;
    return data.id;
  }, []);

  const submitAnswer = useCallback(async (
    participantId: string,
    questionId: string,
    answer: 'A' | 'B' | 'C' | 'D',
    timeTakenMs: number
  ): Promise<number> => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return 0;

    const isCorrect = answer === question.correct_option;
    const timeRemaining = Math.max(0, TOTAL_TIME_MS - timeTakenMs);
    const points = calculatePoints(isCorrect, timeRemaining);

    await supabase.from('logica_aplicada_answers').insert({
      participant_id: participantId,
      question_id: questionId,
      answer,
      time_taken_ms: timeTakenMs,
      points_earned: points
    });

    return points;
  }, [questions]);

  const getCurrentQuestion = useCallback(() => {
    if (!sessionState?.current_question_id) return null;
    return questions.find(q => q.id === sessionState.current_question_id) || null;
  }, [sessionState, questions]);

  const getCurrentQuestionIndex = useCallback(() => {
    if (!sessionState?.current_question_id) return -1;
    return questions.findIndex(q => q.id === sessionState.current_question_id);
  }, [sessionState, questions]);

  return {
    questions,
    sessionState,
    participantCount,
    ranking,
    isLoading,
    initializeSession,
    startQuiz,
    showRanking,
    nextQuestion,
    endQuiz,
    resetQuiz,
    joinQuiz,
    submitAnswer,
    getCurrentQuestion,
    getCurrentQuestionIndex,
    calculateRanking
  };
}
