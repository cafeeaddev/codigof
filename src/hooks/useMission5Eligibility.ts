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
      if (!user || !profile) {
        setIsEligible(false);
        setIsLoading(false);
        return;
      }

      try {
        // 1. Verificar configurações da Missão 5
        const { data: settings, error: settingsError } = await supabase
          .from('mission5_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (settingsError) {
          console.error('Erro ao buscar configurações da Missão 5:', settingsError);
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        setMission5Settings(settings);

        // 2. Verificar se a Missão 5 está ativa e a data de liberação passou
        if (!settings.is_active || new Date(settings.release_date) > new Date()) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 3. Verificar progresso do usuário
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressError) {
          console.error('Erro ao buscar progresso do usuário:', progressError);
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 4. Verificar se o usuário completou as 4 missões anteriores
        const completedAllMissions = progress.missao_1_completed && 
                                   progress.missao_2_completed && 
                                   progress.missao_3_completed && 
                                   progress.missao_4_completed;

        if (!completedAllMissions) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 5. Verificar se já completou a Missão 5
        if (progress.missao_5_completed) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 6. Verificar se o perfil é diferente de "Beginner"
        // Assumindo que o perfil final está em progress.final_profile
        const profileLevel = progress.final_profile;
        if (profileLevel === 'Beginner') {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // Se chegou até aqui, o usuário é elegível
        setIsEligible(true);
      } catch (error) {
        console.error('Erro ao verificar elegibilidade da Missão 5:', error);
        setIsEligible(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [user, profile]);

  return {
    isEligible,
    isLoading,
    mission5Settings
  };
};