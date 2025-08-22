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
      if (!user) {
        setIsEligible(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // 1. Verificar configurações da Missão 5
        const { data: settings } = await supabase
          .from('mission5_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setMission5Settings(settings);

        // 2. Se não há configurações ou não está ativa ou data não chegou
        if (!settings?.is_active || new Date(settings.release_date) > new Date()) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 3. Verificar progresso do usuário
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!progress) {
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // 4. Verificar elegibilidade
        const completedAllMissions = progress.missao_1_completed && 
                                   progress.missao_2_completed && 
                                   progress.missao_3_completed && 
                                   progress.missao_4_completed;

        const isEligible = completedAllMissions && 
                          !progress.missao_5_completed && 
                          progress.final_profile !== 'Beginner';

        setIsEligible(isEligible);
      } catch (error) {
        console.error('[useMission5Eligibility] Error:', error);
        setIsEligible(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [user?.id]);

  return {
    isEligible,
    isLoading,
    mission5Settings
  };
};