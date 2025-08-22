/**
 * Utility functions for consistent time formatting across the application
 */

/**
 * Formats time in seconds to human readable format consistently
 * This ensures all time displays across the app use the same format
 */
export const formatGameTime = (seconds: number): string => {
  if (seconds < 0) return '0min';
  
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  
  return `${totalMinutes}min`;
};

/**
 * Debug function to log time calculations
 */
export const debugTimeCalculation = (context: string, rawSeconds: number): string => {
  const formatted = formatGameTime(rawSeconds);
  console.log(`[TimeFormat] ${context}: ${rawSeconds}s -> ${formatted}`);
  return formatted;
};

/**
 * Validates if time value is reasonable for gameplay
 */
export const isReasonableGameTime = (seconds: number): boolean => {
  const MAX_REASONABLE_TIME = 24 * 60 * 60; // 24 hours
  return seconds >= 0 && seconds <= MAX_REASONABLE_TIME;
};