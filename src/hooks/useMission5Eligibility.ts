import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Mission5Settings {
  release_date: string;
  is_active: boolean;
}

export const useMission5Eligibility = () => {
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mission5Settings, setMission5Settings] = useState<Mission5Settings | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkEligibility = async () => {
      console.log('[useMission5Eligibility] Starting check, user:', !!user, 'profile:', !!profile);
      
      try {
        // 1. Verificar configurações da Missão 5 primeiro (independente do usuário)
        const { data: settings, error: settingsError } = await supabase
          .from('mission5_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (settingsError) {
          console.log('[useMission5Eligibility] Settings error:', settingsError);
          setMission5Settings(null);
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        console.log('[useMission5Eligibility] Settings loaded:', settings);
        setMission5Settings(settings);

        // 2. Verificar se a Missão 5 está ativa e a data de liberação passou
        if (!settings.is_active || new Date(settings.release_date) > new Date()) {
          console.log('[useMission5Eligibility] Mission 5 not active or future date');
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 3. Se não há usuário/profile, não pode ser elegível mas loading pode terminar
        if (!user || !profile) {
          console.log('[useMission5Eligibility] No user or profile');
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 4. Verificar progresso do usuário
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressError) {
          console.log('[useMission5Eligibility] Progress error:', progressError);
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        console.log('[useMission5Eligibility] Progress loaded:', progress);

        // 5. Verificar se o usuário completou as 4 missões anteriores
        const completedAllMissions = progress.missao_1_completed && 
                                   progress.missao_2_completed && 
                                   progress.missao_3_completed && 
                                   progress.missao_4_completed;

        console.log('[useMission5Eligibility] Completed all missions:', completedAllMissions);

        if (!completedAllMissions) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 6. Verificar se já completou a Missão 5
        if (progress.missao_5_completed) {
          console.log('[useMission5Eligibility] Mission 5 already completed');
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 7. Verificar se o perfil é diferente de "Beginner"
        const profileLevel = progress.final_profile;
        console.log('[useMission5Eligibility] Profile level:', profileLevel);
        
        if (profileLevel === 'Beginner') {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // Se chegou até aqui, o usuário é elegível
        console.log('[useMission5Eligibility] User is eligible!');
        setIsEligible(true);
      } catch (error) {
        console.error('[useMission5Eligibility] Error:', error);
        setIsEligible(false);
      } finally {
        console.log('[useMission5Eligibility] Check completed, isEligible:', isEligible);
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [user?.id, profile?.id]); // Only depend on IDs to avoid unnecessary re-runs

  return {
    isEligible,
    isLoading,
    mission5Settings
  };
};