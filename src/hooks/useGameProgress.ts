import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { validatePlayTime, fixUserTimeData } from '@/utils/gameTimeUtils';

interface GameProgress {
  currentPosition: string;
  totalPlayTime: number; // in seconds
  sessionStartTime: Date;
  lastSavedAt: Date;
}

const MAX_SESSION_TIME = 8 * 60 * 60; // 8 hours in seconds
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const AUTO_SAVE_INTERVAL = 60 * 1000; // 1 minute in milliseconds

export const useGameProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<GameProgress>({
    currentPosition: 'inicio',
    totalPlayTime: 0,
    sessionStartTime: new Date(),
    lastSavedAt: new Date(),
  });
  
  // Hook initialized - debug removed for performance
  
  const sessionStartRef = useRef<Date>(new Date());
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(true);
  const hasUnsavedChangesRef = useRef<boolean>(false);

  // Track user activity
  const updateActivity = useCallback(() => {
    const now = Date.now();
    const wasInactive = !isActiveRef.current;
    
    lastActivityRef.current = now;
    if (wasInactive) {
      isActiveRef.current = true;
      // Only reset session start if user was inactive for more than 5 minutes
      const timeSinceStart = now - sessionStartRef.current.getTime();
      if (timeSinceStart > INACTIVITY_TIMEOUT) {
        sessionStartRef.current = new Date();
        console.log('[useGameProgress] User became active after inactivity, resetting session timer');
      }
    }
  }, []);

  // Check if user is inactive
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    if (timeSinceLastActivity > INACTIVITY_TIMEOUT && isActiveRef.current) {
      isActiveRef.current = false;
      console.log('[useGameProgress] User became inactive');
      // Save progress when becoming inactive
      if (hasUnsavedChangesRef.current) {
        saveProgress(undefined, true);
      }
    }
  }, []);

  // Setup activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check inactivity every minute
    const inactivityInterval = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(inactivityInterval);
    };
  }, [updateActivity, checkInactivity]);

  // Load progress when user logs in
  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      console.log('[useGameProgress] No user.id available, skipping load');
      return;
    }

    console.log('[useGameProgress] Loading progress for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('current_position, total_play_time, session_start_time, last_saved_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useGameProgress] Error loading progress:', error);
        return;
      }

      if (data) {
        // Validate and sanitize loaded data using utility function
        const validation = validatePlayTime(data.total_play_time || 0);
        let sanitizedPlayTime = validation.correctedTime;
        
        console.log('[useGameProgress] Loaded raw time data:', {
          user_id: user.id,
          raw_total_play_time: data.total_play_time,
          is_valid: validation.isValid,
          sanitized_time: sanitizedPlayTime,
          reason: validation.reason
        });
        
        // If data is corrupted, attempt to fix it
        if (!validation.isValid) {
          console.warn('[useGameProgress] Detected corrupted time data:', validation.reason);
          await fixUserTimeData(user.id);
          sanitizedPlayTime = 0; // Reset to 0 for safety
        }
        
        setProgress({
          currentPosition: data.current_position || 'inicio',
          totalPlayTime: sanitizedPlayTime,
          sessionStartTime: new Date(), // Always start fresh session on load
          lastSavedAt: new Date(data.last_saved_at || Date.now()),
        });
        
        // Reset session tracking to prevent accumulation bugs
        sessionStartRef.current = new Date();
        lastActivityRef.current = Date.now();
        isActiveRef.current = true;
        hasUnsavedChangesRef.current = false;
        
        console.log('[useGameProgress] Loaded progress with total time:', sanitizedPlayTime, 'seconds');
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
      } else {
        console.log('[useGameProgress] Created initial progress record');
      }
    } catch (error) {
      console.error('Error creating initial progress:', error);
    }
  }, [user?.id]);

  // Save progress to database
  const saveProgress = useCallback(async (position?: string, forceUpdate = false) => {
    if (!user?.id) {
      console.log('[useGameProgress] No user.id available, skipping save');
      return;
    }

    const now = Date.now();
    
    // Only calculate session time if user is active
    let sessionTime = 0;
    if (isActiveRef.current) {
      sessionTime = Math.floor((now - sessionStartRef.current.getTime()) / 1000);
      // Cap session time to prevent absurd values
      sessionTime = Math.min(sessionTime, MAX_SESSION_TIME);
    }
    
    const currentPosition = position || progress.currentPosition;

    // Throttle saves to avoid too frequent database updates (max every 30 seconds unless forced)
    if (!forceUpdate && !hasUnsavedChangesRef.current && now - lastSaveTimeRef.current < 30000) {
      console.log('[useGameProgress] Save throttled - no changes or too recent');
      return;
    }

    // Skip save if no meaningful session time and no position change
    if (!forceUpdate && sessionTime < 1 && !position) {
      console.log('[useGameProgress] Save skipped - no meaningful activity');
      return;
    }

    // Saving progress - debug removed for performance

    try {
      const newTotalTime = progress.totalPlayTime + sessionTime;
      
      const updateData = {
        current_position: currentPosition,
        total_play_time: newTotalTime,
        session_start_time: sessionStartRef.current.toISOString(),
        last_saved_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        // Error saving progress - see browser devtools for details
        return;
      }

      lastSaveTimeRef.current = now;
      hasUnsavedChangesRef.current = false;
      
      // Update local state
      setProgress(prev => ({
        ...prev,
        currentPosition,
        totalPlayTime: newTotalTime,
        lastSavedAt: new Date(),
      }));

      // Reset session start time only after successful save
      sessionStartRef.current = new Date();
      // Progress saved successfully - debug removed for performance

    } catch (error) {
      // Error saving progress - see browser devtools for details
    }
  }, [user?.id, progress.currentPosition, progress.totalPlayTime]);

  // Update current position
  const updatePosition = useCallback((position: string) => {
    setProgress(prev => ({ ...prev, currentPosition: position }));
    hasUnsavedChangesRef.current = true;
    updateActivity(); // Mark user as active when changing position
    saveProgress(position);
  }, [saveProgress, updateActivity]);

  // Auto-save with reduced frequency
  useEffect(() => {
    if (!user?.id) return;

    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChangesRef.current || isActiveRef.current) {
        saveProgress();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [user?.id, saveProgress]);

  // Save on page unload and visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.id && (hasUnsavedChangesRef.current || isActiveRef.current)) {
        saveProgress(undefined, true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (user?.id && (hasUnsavedChangesRef.current || isActiveRef.current)) {
          saveProgress(undefined, true);
        }
        isActiveRef.current = false;
      } else if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, saveProgress, updateActivity]);

  // Load progress on mount
  useEffect(() => {
    if (user?.id) {
      loadProgress();
      sessionStartRef.current = new Date();
      lastActivityRef.current = Date.now();
      isActiveRef.current = true;
    }
  }, [user?.id, loadProgress]);

  // Format play time for display
  const formatPlayTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  return {
    progress,
    updatePosition,
    saveProgress: () => {
      hasUnsavedChangesRef.current = true;
      saveProgress(undefined, true);
    },
    formatPlayTime,
    totalPlayTime: progress.totalPlayTime,
    currentPosition: progress.currentPosition,
  };
};