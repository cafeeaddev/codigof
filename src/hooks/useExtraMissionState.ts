import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ExtraMissionState = 'hidden' | 'blocked' | 'available' | 'declined' | 'completed';

interface ExtraMissionStateResult {
  state: ExtraMissionState;
  releaseDate: string | null;
  isLoading: boolean;
  refreshState: () => void;
}

export const useExtraMissionState = (userId: string | undefined, profileName: string, refreshTrigger?: number) => {
  console.log('🚀 [useExtraMissionState] Hook called with:', { userId, profileName, refreshTrigger });
  const [state, setState] = useState<ExtraMissionState>('hidden');
  const [releaseDate, setReleaseDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkExtraMissionState = async () => {
    setIsLoading(true);
    
    try {
      // Hidden for Beginner profiles
      if (profileName === 'Beginner') {
        setState('hidden');
        setIsLoading(false);
        return;
      }

      if (!userId) {
        setState('hidden');
        setIsLoading(false);
        return;
      }

      // Get release date from game settings
      const { data: gameSettings } = await supabase
        .from('game_settings')
        .select('extra_mission_release_date')
        .single();
      
      const extraMissionReleaseDate = gameSettings?.extra_mission_release_date;
      setReleaseDate(extraMissionReleaseDate);

      if (!extraMissionReleaseDate) {
        setState('hidden');
        setIsLoading(false);
        return;
      }

      // Check if user completed mission 5 OR submitted fast track form
      const { data: progress } = await supabase
        .from('user_progress')
        .select('missao_5_completed')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: fastTrackResponse } = await supabase
        .from('fast_track_responses')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (progress?.missao_5_completed || fastTrackResponse) {
        setState('completed');
        setIsLoading(false);
        return;
      }

      // Check if user declined the mission - PRIORIZAR ESTE CHECK
      const { data: termsResponse } = await supabase
        .from('fast_track_terms_responses')
        .select('want_to_participate')
        .eq('user_id', userId)
        .maybeSingle();

      // CRÍTICO: Se o usuário recusou, sempre mostrar como declined, independente de outras condições
      if (termsResponse && !termsResponse.want_to_participate) {
        console.log('🐛 [useExtraMissionState] User declined, setting state to declined');
        setState('declined');
        setIsLoading(false);
        return;
      }

      // Check if release date has passed
      const today = new Date();
      const releaseDate = new Date(extraMissionReleaseDate + 'T00:00:00');
      today.setHours(0, 0, 0, 0);
      releaseDate.setHours(0, 0, 0, 0);

      if (today >= releaseDate) {
        setState('available');
      } else {
        setState('blocked');
      }

    } catch (error) {
      console.error('Error checking extra mission state:', error);
      setState('hidden');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkExtraMissionState();
  }, [userId, profileName, refreshTrigger]);

  const refreshState = () => {
    if (userId && profileName !== 'Beginner') {
      checkExtraMissionState();
    }
  };
  
  console.log('🐛 [useExtraMissionState] Final state:', { state, userId, profileName, isLoading });
  
  return { state, releaseDate, isLoading, refreshState };
};