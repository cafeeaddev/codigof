import { supabase } from '@/integrations/supabase/client';
import { formatGameTime, isReasonableGameTime } from './timeFormatUtils';

/**
 * Admin utility to fix time data across all users
 */
export const fixAllUserTimeData = async (): Promise<{
  totalFixed: number;
  errors: string[];
}> => {
  const result = { totalFixed: 0, errors: [] };
  
  try {
    // Get all users with potentially problematic time data
    const { data: users, error } = await supabase
      .from('user_progress')
      .select('user_id, total_play_time')
      .or('total_play_time.gt.7200,total_play_time.lt.0'); // More than 2 hours or negative
    
    if (error) {
      result.errors.push(`Error fetching problematic users: ${error.message}`);
      return result;
    }
    
    for (const user of users || []) {
      if (!isReasonableGameTime(user.total_play_time || 0)) {
        // Reset to 0 for unreasonable times
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({ 
            total_play_time: 0,
            session_start_time: new Date().toISOString(),
            last_saved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id);
        
        if (updateError) {
          result.errors.push(`Error fixing user ${user.user_id}: ${updateError.message}`);
        } else {
          result.totalFixed++;
          console.log(`[fixAllUserTimeData] Fixed user ${user.user_id} - reset from ${user.total_play_time}s to 0s`);
        }
      }
    }
    
    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error}`);
    return result;
  }
};

/**
 * Get time data report for admin analysis
 */
export const getTimeDataReport = async (): Promise<{
  totalUsers: number;
  usersWithProblems: number;
  averageTime: number;
  maxTime: number;
  problemUsers: Array<{ user_id: string; total_play_time: number; issue: string }>;
}> => {
  try {
    const { data: users, error } = await supabase
      .from('user_progress')
      .select('user_id, total_play_time');
    
    if (error) {
      throw error;
    }
    
    const problemUsers = [];
    let totalTime = 0;
    let maxTime = 0;
    let usersWithProblems = 0;
    
    for (const user of users || []) {
      const time = user.total_play_time || 0;
      totalTime += time;
      maxTime = Math.max(maxTime, time);
      
      if (!isReasonableGameTime(time)) {
        usersWithProblems++;
        problemUsers.push({
          user_id: user.user_id,
          total_play_time: time,
          issue: time < 0 ? 'Negative time' : 'Excessive time (>24h)'
        });
      }
    }
    
    return {
      totalUsers: users?.length || 0,
      usersWithProblems,
      averageTime: users?.length ? Math.floor(totalTime / users.length) : 0,
      maxTime,
      problemUsers
    };
  } catch (error) {
    console.error('[getTimeDataReport] Error:', error);
    throw error;
  }
};