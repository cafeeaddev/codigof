import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface GameProgress {
  currentPosition: string;
  totalPlayTime: number; // in seconds
  sessionStartTime: Date;
  lastSavedAt: Date;
}

export const useGameProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<GameProgress>({
    currentPosition: 'inicio',
    totalPlayTime: 0,
    sessionStartTime: new Date(),
    lastSavedAt: new Date(),
  });
  
  const sessionStartRef = useRef<Date>(new Date());
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());

  // Load progress when user logs in
  const loadProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('current_position, total_play_time, session_start_time, last_saved_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading progress:', error);
        return;
      }

      if (data) {
        setProgress({
          currentPosition: data.current_position || 'inicio',
          totalPlayTime: data.total_play_time || 0,
          sessionStartTime: new Date(data.session_start_time || Date.now()),
          lastSavedAt: new Date(data.last_saved_at || Date.now()),
        });
      } else {
        // Create initial progress record
        await createInitialProgress();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [user?.id]);

  // Create initial progress record
  const createInitialProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      const initialData = {
        user_id: user.id,
        current_position: 'inicio',
        total_play_time: 0,
        session_start_time: new Date().toISOString(),
        last_saved_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_progress')
        .insert(initialData);

      if (error) {
        console.error('Error creating initial progress:', error);
      }
    } catch (error) {
      console.error('Error creating initial progress:', error);
    }
  }, [user?.id]);

  // Save progress to database
  const saveProgress = useCallback(async (position?: string, forceUpdate = false) => {
    if (!user?.id) return;

    const now = Date.now();
    const sessionTime = Math.floor((now - sessionStartRef.current.getTime()) / 1000);
    const currentPosition = position || progress.currentPosition;

    // Throttle saves to avoid too frequent database updates (max every 10 seconds)
    if (!forceUpdate && now - lastSaveTimeRef.current < 10000) {
      return;
    }

    try {
      const updateData = {
        current_position: currentPosition,
        total_play_time: progress.totalPlayTime + sessionTime,
        session_start_time: sessionStartRef.current.toISOString(),
        last_saved_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving progress:', error);
        return;
      }

      lastSaveTimeRef.current = now;
      
      // Update local state
      setProgress(prev => ({
        ...prev,
        currentPosition,
        totalPlayTime: prev.totalPlayTime + sessionTime,
        lastSavedAt: new Date(),
      }));

      // Reset session start time
      sessionStartRef.current = new Date();

    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user?.id, progress.currentPosition, progress.totalPlayTime]);

  // Update current position
  const updatePosition = useCallback((position: string) => {
    setProgress(prev => ({ ...prev, currentPosition: position }));
    saveProgress(position);
  }, [saveProgress]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    autoSaveIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [user?.id, saveProgress]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.id) {
        // Use sendBeacon for reliable saving on page unload
        const now = Date.now();
        const sessionTime = Math.floor((now - sessionStartRef.current.getTime()) / 1000);
        
        const updateData = {
          current_position: progress.currentPosition,
          total_play_time: progress.totalPlayTime + sessionTime,
          session_start_time: sessionStartRef.current.toISOString(),
          last_saved_at: new Date().toISOString(),
        };

        // Use synchronous save for page unload (simplified approach)
        saveProgress(undefined, true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgress(undefined, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, progress.currentPosition, progress.totalPlayTime, saveProgress]);

  // Load progress on mount
  useEffect(() => {
    if (user?.id) {
      loadProgress();
      sessionStartRef.current = new Date();
    }
  }, [user?.id, loadProgress]);

  // Format play time for display
  const formatPlayTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  return {
    progress,
    updatePosition,
    saveProgress: () => saveProgress(undefined, true),
    formatPlayTime,
    totalPlayTime: progress.totalPlayTime,
    currentPosition: progress.currentPosition,
  };
};