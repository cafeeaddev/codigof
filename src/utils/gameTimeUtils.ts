import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for managing game time data and fixing corrupted records
 */

export interface TimeValidationResult {
  isValid: boolean;
  originalTime: number;
  correctedTime: number;
  reason?: string;
}

const MAX_REASONABLE_SESSION_TIME = 4 * 60 * 60; // 4 hours per session
const MAX_REASONABLE_TOTAL_TIME = 24 * 60 * 60; // 24 hours total

/**
 * Validates if a play time value is reasonable
 */
export const validatePlayTime = (playTimeSeconds: number): TimeValidationResult => {
  const result: TimeValidationResult = {
    isValid: true,
    originalTime: playTimeSeconds,
    correctedTime: playTimeSeconds,
  };

  if (playTimeSeconds < 0) {
    result.isValid = false;
    result.correctedTime = 0;
    result.reason = 'Negative time value';
  } else if (playTimeSeconds > MAX_REASONABLE_TOTAL_TIME) {
    result.isValid = false;
    result.correctedTime = 0;
    result.reason = `Exceeds maximum reasonable time (${MAX_REASONABLE_TOTAL_TIME} seconds)`;
  }

  return result;
};

/**
 * Fixes corrupted time data for a specific user
 */
export const fixUserTimeData = async (userId: string): Promise<boolean> => {
  try {
    console.log('[gameTimeUtils] Fixing time data for user:', userId);
    
    const { data: userProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('total_play_time, current_position')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('[gameTimeUtils] Error fetching user progress:', fetchError);
      return false;
    }

    if (!userProgress) {
      console.log('[gameTimeUtils] No progress found for user');
      return true;
    }

    const validation = validatePlayTime(userProgress.total_play_time || 0);
    
    if (!validation.isValid) {
      console.log('[gameTimeUtils] Correcting invalid time:', validation.originalTime, '->', validation.correctedTime);
      
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({ 
          total_play_time: validation.correctedTime,
          session_start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[gameTimeUtils] Error updating user progress:', updateError);
        return false;
      }

      console.log('[gameTimeUtils] Successfully corrected time data for user:', userId);
      return true;
    }

    console.log('[gameTimeUtils] Time data is valid for user:', userId);
    return true;
  } catch (error) {
    console.error('[gameTimeUtils] Error fixing user time data:', error);
    return false;
  }
};

/**
 * Analyzes all users and reports time data issues
 */
export const analyzeAllTimeData = async (): Promise<{
  totalUsers: number;
  corruptedUsers: number;
  correctedUsers: number;
  issues: Array<{ userId: string; issue: string; originalTime: number; correctedTime: number }>;
}> => {
  const result = {
    totalUsers: 0,
    corruptedUsers: 0,
    correctedUsers: 0,
    issues: [] as Array<{ userId: string; issue: string; originalTime: number; correctedTime: number }>,
  };

  try {
    const { data: allProgress, error } = await supabase
      .from('user_progress')
      .select('user_id, total_play_time');

    if (error) {
      console.error('[gameTimeUtils] Error fetching all progress:', error);
      return result;
    }

    result.totalUsers = allProgress?.length || 0;

    for (const progress of allProgress || []) {
      const validation = validatePlayTime(progress.total_play_time || 0);
      
      if (!validation.isValid) {
        result.corruptedUsers++;
        result.issues.push({
          userId: progress.user_id,
          issue: validation.reason || 'Invalid time',
          originalTime: validation.originalTime,
          correctedTime: validation.correctedTime,
        });
        
        // Attempt to fix the data
        const fixed = await fixUserTimeData(progress.user_id);
        if (fixed) {
          result.correctedUsers++;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('[gameTimeUtils] Error analyzing time data:', error);
    return result;
  }
};

/**
 * Formats time in seconds to human readable format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours}h`;
};