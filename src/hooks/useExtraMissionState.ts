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

      // Check if user completed ALL 4 missions first (required for extra mission)
      const { data: progress } = await supabase
        .from('user_progress')
        .select('missao_1_completed, missao_2_completed, missao_3_completed, missao_4_completed, missao_5_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (!progress || 
          !progress.missao_1_completed || 
          !progress.missao_2_completed || 
          !progress.missao_3_completed || 
          !progress.missao_4_completed) {
        setState('hidden');
        setIsLoading(false);
        return;
      }

      // Check if user declined the mission
      const { data: termsResponse } = await supabase
        .from('fast_track_terms_responses')
        .select('want_to_participate')
        .eq('user_id', userId)
        .maybeSingle();

      if (termsResponse && !termsResponse.want_to_participate) {
        setState('declined');
        setIsLoading(false);
        return;
      }

      // Check if user completed mission 5
      if (progress?.missao_5_completed) {
        setState('completed');
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

  return { state, releaseDate, isLoading, refreshState };
};