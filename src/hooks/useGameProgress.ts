import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GameProgress {
  currentMission: number;
  completedMissions: number[];
  totalXp: number;
  sessionStartTime: Date;
  missionStartTime: Date | null;
  isLoading: boolean;
}

interface GameSession {
  id: string;
  mission_number: number;
  start_time: Date;
  end_time?: Date;
  duration_seconds?: number;
  completed: boolean;
}

export const useGameProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [progress, setProgress] = useState<GameProgress>({
    currentMission: 1,
    completedMissions: [],
    totalXp: 0,
    sessionStartTime: new Date(),
    missionStartTime: null,
    isLoading: true
  });

  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  // Load progress from database
  const loadProgress = useCallback(async () => {
    if (!user) return;

    try {
      setProgress(prev => ({ ...prev, isLoading: true }));

      // Get user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get completed missions
      const completedList: number[] = [];
      if (userProgress?.missao_1_completed) completedList.push(1);
      if (userProgress?.missao_2_completed) completedList.push(2);
      if (userProgress?.missao_3_completed) completedList.push(3);
      if (userProgress?.missao_4_completed) completedList.push(4);

      // Determine current mission
      let currentMission = 1;
      if (completedList.length === 4) {
        currentMission = 5; // All completed
      } else {
        currentMission = completedList.length + 1;
      }

      // Check for incomplete session
      const { data: incompleteSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('start_time', { ascending: false })
        .limit(1);

      let sessionToResume = null;
      if (incompleteSessions && incompleteSessions.length > 0) {
        sessionToResume = incompleteSessions[0];
        currentMission = sessionToResume.mission_number;
      }

      setProgress(prev => ({
        ...prev,
        currentMission,
        completedMissions: completedList,
        totalXp: userProgress?.total_xp || 0,
        sessionStartTime: sessionToResume ? new Date(sessionToResume.start_time) : new Date(),
        isLoading: false
      }));

      if (sessionToResume) {
        setCurrentSession({
          id: sessionToResume.id,
          mission_number: sessionToResume.mission_number,
          start_time: new Date(sessionToResume.start_time),
          completed: false
        });
      }

    } catch (error) {
      console.error('Error loading progress:', error);
      setProgress(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  // Start a new mission session
  const startMission = useCallback(async (missionNumber: number) => {
    if (!user) return;

    try {
      const startTime = new Date();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          mission_number: missionNumber,
          start_time: startTime.toISOString(),
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession({
        id: data.id,
        mission_number: missionNumber,
        start_time: startTime,
        completed: false
      });

      setProgress(prev => ({
        ...prev,
        missionStartTime: startTime
      }));

      // Log game event
      await supabase
        .from('game_events')
        .insert({
          user_id: user.id,
          event_type: 'mission_started',
          event_data: { mission_number: missionNumber }
        });

    } catch (error) {
      console.error('Error starting mission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a missão",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Complete a mission
  const completeMission = useCallback(async (missionNumber: number, responses?: any) => {
    if (!user || !currentSession) return;

    try {
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - currentSession.start_time.getTime()) / 1000);

      // Update session as completed
      await supabase
        .from('user_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
          completed: true
        })
        .eq('id', currentSession.id);

      // Calculate bonus XP based on game start date
      const { data: bonusXp } = await supabase
        .rpc('calculate_bonus_xp');

      const baseXp = 50;
      const totalXp = baseXp + (bonusXp || 0);

      // Update user progress
      const updateField = `missao_${missionNumber}_completed`;
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          [updateField]: true,
          total_xp: progress.totalXp + totalXp
        });

      if (progressError) throw progressError;

      // Save attempt data if responses provided
      if (responses) {
        await supabase
          .from('user_attempts')
          .insert({
            user_id: user.id,
            mission_number: missionNumber,
            session_id: currentSession.id,
            responses: responses,
            duration_seconds: durationSeconds,
            xp_earned: totalXp
          });
      }

      // Log completion event
      await supabase
        .from('game_events')
        .insert({
          user_id: user.id,
          event_type: 'mission_completed',
          event_data: {
            mission_number: missionNumber,
            duration_seconds: durationSeconds,
            xp_earned: totalXp
          }
        });

      // Update local state
      setProgress(prev => ({
        ...prev,
        completedMissions: [...prev.completedMissions, missionNumber],
        totalXp: prev.totalXp + totalXp,
        currentMission: missionNumber === 4 ? 5 : missionNumber + 1
      }));

      setCurrentSession(null);

      toast({
        title: "Missão Concluída!",
        description: `Você ganhou ${totalXp} XP!`,
      });

    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso",
        variant: "destructive"
      });
    }
  }, [user, currentSession, progress.totalXp, toast]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!user || !currentSession) return;

    const interval = setInterval(async () => {
      try {
        await supabase
          .from('user_sessions')
          .update({
            last_activity: new Date().toISOString()
          })
          .eq('id', currentSession.id);
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [user, currentSession]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    ...progress,
    startMission,
    completeMission,
    loadProgress,
    currentSession
  };
};