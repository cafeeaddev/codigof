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

      setProgress(prev => ({
        ...prev,
        currentMission,
        completedMissions: completedList,
        totalXp: userProgress?.total_xp || 0,
        sessionStartTime: new Date(),
        isLoading: false
      }));

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
      
      setProgress(prev => ({
        ...prev,
        missionStartTime: startTime
      }));

      toast({
        title: "Missão Iniciada",
        description: `Missão ${missionNumber} começou!`,
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
    if (!user) return;

    try {
      const baseXp = 50;
      const bonusXp = 0; // Will implement bonus calculation later

      const totalXp = baseXp + bonusXp;

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

      // Update local state
      setProgress(prev => ({
        ...prev,
        completedMissions: [...prev.completedMissions, missionNumber],
        totalXp: prev.totalXp + totalXp,
        currentMission: missionNumber === 4 ? 5 : missionNumber + 1
      }));

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
  }, [user, progress.totalXp, toast]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    ...progress,
    startMission,
    completeMission,
    loadProgress,
    currentSession: null // Simplified for now
  };
};