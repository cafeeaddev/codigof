import { useState, useEffect, useCallback, useRef } from 'react';
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

export interface JoinResult {
  success: boolean;
  participantId?: string;
  error?: string;
}

export interface SubmitResult {
  success: boolean;
  points: number;
  error?: string;
}

const TOTAL_TIME_MS = 45000; // 45 seconds
const BASE_POINTS = 1000;
const MIN_POINTS = 500;
const POLLING_INTERVAL = 5000; // Reduced from 2s/3s to 5s

export function calculatePoints(isCorrect: boolean, timeRemainingMs: number): number {
  if (!isCorrect) return 0;
  
  const speedBonus = timeRemainingMs / TOTAL_TIME_MS;
  const points = Math.round(MIN_POINTS + (BASE_POINTS - MIN_POINTS) * speedBonus);
  
  return Math.max(MIN_POINTS, Math.min(BASE_POINTS, points));
}

// Helper function for retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`[LogicaAplicada] Attempt ${attempt}/${maxAttempts} failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

export function useLogicaAplicada() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizWasReset, setQuizWasReset] = useState(false);
  
  // Track previous phase to detect resets
  const prevPhaseRef = useRef<string | null>(null);

  // Load questions with error handling
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('[LogicaAplicada] Loading questions...');
        const { data, error } = await supabase
          .from('logica_aplicada_questions')
          .select('*')
          .order('order_position');
        
        if (error) {
          console.error('[LogicaAplicada] Error loading questions:', error);
          return;
        }
        
        if (data) {
          console.log('[LogicaAplicada] Questions loaded:', data.length);
          setQuestions(data as Question[]);
        }
      } catch (err) {
        console.error('[LogicaAplicada] Exception loading questions:', err);
      }
    };
    loadQuestions();
  }, []);

  // Load and subscribe to session state with reset detection
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase
          .from('logica_aplicada_session_state')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('[LogicaAplicada] Error loading session:', error);
          return;
        }
        
        if (data) {
          const newState = data as SessionState;
          
          // Detect reset: if we were in question/ranking and now in waiting
          if (prevPhaseRef.current && 
              prevPhaseRef.current !== 'waiting' && 
              newState.current_phase === 'waiting') {
            console.log('[LogicaAplicada] Quiz was reset detected!');
            setQuizWasReset(true);
          }
          
          prevPhaseRef.current = newState.current_phase;
          setSessionState(newState);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('[LogicaAplicada] Exception loading session:', err);
        setIsLoading(false);
      }
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
          const newState = payload.new as SessionState;
          
          // Detect reset via real-time
          if (prevPhaseRef.current && 
              prevPhaseRef.current !== 'waiting' && 
              newState.current_phase === 'waiting') {
            console.log('[LogicaAplicada] Quiz reset detected via real-time!');
            setQuizWasReset(true);
          }
          
          prevPhaseRef.current = newState.current_phase;
          setSessionState(newState);
        }
      })
      .subscribe();

    // Reduced polling interval (5s instead of 2s)
    const interval = setInterval(loadSession, POLLING_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Load and subscribe to participant count
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const { count, error } = await supabase
          .from('logica_aplicada_participants')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('[LogicaAplicada] Error loading participants:', error);
          return;
        }
        
        setParticipantCount(count || 0);
      } catch (err) {
        console.error('[LogicaAplicada] Exception loading participants:', err);
      }
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
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'logica_aplicada_participants'
      }, () => {
        loadParticipants();
      })
      .subscribe();

    // Reduced polling interval (5s instead of 3s)
    const interval = setInterval(loadParticipants, POLLING_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Calculate ranking
  const calculateRanking = useCallback(async () => {
    try {
      const { data: participants, error: pError } = await supabase
        .from('logica_aplicada_participants')
        .select('id, nickname');

      if (pError) {
        console.error('[LogicaAplicada] Error loading participants for ranking:', pError);
        return;
      }

      const { data: answers, error: aError } = await supabase
        .from('logica_aplicada_answers')
        .select('participant_id, points_earned');

      if (aError) {
        console.error('[LogicaAplicada] Error loading answers for ranking:', aError);
        return;
      }

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
    } catch (err) {
      console.error('[LogicaAplicada] Exception calculating ranking:', err);
    }
  }, []);

  // Update ranking when phase changes to ranking_parcial or ended
  useEffect(() => {
    if (sessionState?.current_phase === 'ranking_parcial' || sessionState?.current_phase === 'ended') {
      calculateRanking();
    }
  }, [sessionState?.current_phase, calculateRanking]);

  // Session control functions (admin only)
  const initializeSession = useCallback(async () => {
    try {
      const { data: existing } = await supabase
        .from('logica_aplicada_session_state')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!existing) {
        // Use upsert to prevent duplicate key errors
        const { error } = await supabase.from('logica_aplicada_session_state').upsert({
          current_phase: 'waiting',
          current_question_id: null
        }, { onConflict: 'id' });
        
        if (error) {
          console.error('[LogicaAplicada] Error initializing session:', error);
        }
      }
    } catch (err) {
      console.error('[LogicaAplicada] Exception initializing session:', err);
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

  // Participant functions with improved error handling
  const joinQuiz = useCallback(async (nickname: string): Promise<JoinResult> => {
    console.log('[LogicaAplicada] joinQuiz called with nickname:', nickname);
    
    try {
      // Test connection first
      const { error: pingError } = await supabase
        .from('logica_aplicada_session_state')
        .select('id')
        .limit(1);
      
      if (pingError) {
        console.error('[LogicaAplicada] Connection test failed:', pingError);
        return { 
          success: false, 
          error: 'Sem conexão com o servidor. Verifique sua internet.' 
        };
      }

      // Use retry logic for join
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('logica_aplicada_participants')
          .insert({ nickname })
          .select('id')
          .single();
        
        if (error) {
          console.error('[LogicaAplicada] Insert error:', error);
          throw error;
        }
        
        return data;
      });
      
      console.log('[LogicaAplicada] Join successful, participantId:', result.id);
      return { success: true, participantId: result.id };
      
    } catch (error: any) {
      console.error('[LogicaAplicada] joinQuiz failed after retries:', error);
      
      let errorMessage = 'Erro ao entrar no quiz. Tente novamente.';
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Conexão lenta. Tente novamente.';
      } else if (error?.code === '23505') {
        errorMessage = 'Este nome já está em uso. Escolha outro.';
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify if participant still exists
  const verifyParticipant = useCallback(async (participantId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('logica_aplicada_participants')
        .select('id')
        .eq('id', participantId)
        .maybeSingle();
      
      if (error) {
        console.error('[LogicaAplicada] Error verifying participant:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('[LogicaAplicada] Exception verifying participant:', err);
      return false;
    }
  }, []);

  const submitAnswer = useCallback(async (
    participantId: string,
    questionId: string,
    answer: 'A' | 'B' | 'C' | 'D',
    timeTakenMs: number
  ): Promise<SubmitResult> => {
    console.log('[LogicaAplicada] submitAnswer called:', { participantId, questionId, answer, timeTakenMs });
    
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error('[LogicaAplicada] Question not found:', questionId);
      return { success: false, points: 0, error: 'Pergunta não encontrada' };
    }

    // Verify participant still exists before submitting
    const participantExists = await verifyParticipant(participantId);
    if (!participantExists) {
      console.error('[LogicaAplicada] Participant no longer exists:', participantId);
      return { 
        success: false, 
        points: 0, 
        error: 'Sua sessão expirou. O quiz foi reiniciado.' 
      };
    }

    const isCorrect = answer === question.correct_option;
    const timeRemaining = Math.max(0, TOTAL_TIME_MS - timeTakenMs);
    const points = calculatePoints(isCorrect, timeRemaining);

    try {
      const result = await withRetry(async () => {
        const { error } = await supabase.from('logica_aplicada_answers').insert({
          participant_id: participantId,
          question_id: questionId,
          answer,
          time_taken_ms: timeTakenMs,
          points_earned: points
        });
        
        if (error) {
          console.error('[LogicaAplicada] Submit error:', error);
          throw error;
        }
        
        return { success: true };
      });
      
      console.log('[LogicaAplicada] Answer submitted successfully, points:', points);
      return { success: true, points };
      
    } catch (error: any) {
      console.error('[LogicaAplicada] submitAnswer failed after retries:', error);
      
      // Check for foreign key violation (participant was deleted)
      if (error?.code === '23503') {
        return { 
          success: false, 
          points: 0, 
          error: 'Sua sessão expirou. O quiz foi reiniciado.' 
        };
      }
      
      return { 
        success: false, 
        points: 0, 
        error: 'Erro ao enviar resposta. Tente novamente.' 
      };
    }
  }, [questions, verifyParticipant]);

  // Get participant position and total points
  const getParticipantPosition = useCallback(async (participantId: string): Promise<{
    position: number;
    totalPoints: number;
    totalParticipants: number;
  } | null> => {
    try {
      const { data: participants, error: pError } = await supabase
        .from('logica_aplicada_participants')
        .select('id');

      if (pError) {
        console.error('[LogicaAplicada] Error getting participants for position:', pError);
        return null;
      }

      const { data: answers, error: aError } = await supabase
        .from('logica_aplicada_answers')
        .select('participant_id, points_earned');

      if (aError) {
        console.error('[LogicaAplicada] Error getting answers for position:', aError);
        return null;
      }

      if (!participants || !answers) return null;

      const pointsMap = new Map<string, number>();
      answers.forEach(a => {
        const current = pointsMap.get(a.participant_id!) || 0;
        pointsMap.set(a.participant_id!, current + a.points_earned);
      });

      const sorted = Array.from(pointsMap.entries())
        .sort((a, b) => b[1] - a[1]);

      const position = sorted.findIndex(([id]) => id === participantId) + 1;
      const totalPoints = pointsMap.get(participantId) || 0;

      return {
        position: position || participants.length,
        totalPoints,
        totalParticipants: participants.length
      };
    } catch (err) {
      console.error('[LogicaAplicada] Exception getting position:', err);
      return null;
    }
  }, []);

  const getCurrentQuestion = useCallback(() => {
    if (!sessionState?.current_question_id) return null;
    return questions.find(q => q.id === sessionState.current_question_id) || null;
  }, [sessionState, questions]);

  const getCurrentQuestionIndex = useCallback(() => {
    if (!sessionState?.current_question_id) return -1;
    return questions.findIndex(q => q.id === sessionState.current_question_id);
  }, [sessionState, questions]);

  // Clear reset flag
  const clearResetFlag = useCallback(() => {
    setQuizWasReset(false);
  }, []);

  return {
    questions,
    sessionState,
    participantCount,
    ranking,
    isLoading,
    quizWasReset,
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
    calculateRanking,
    getParticipantPosition,
    verifyParticipant,
    clearResetFlag
  };
}
