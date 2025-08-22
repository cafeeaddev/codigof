import { supabase } from "@/integrations/supabase/client";

export interface BonusCalculationResult {
  expectedBonus: number;
  daysDiff: number;
  gameStartDate: string;
  completionDate: string;
}

/**
 * Calculates the time bonus XP based on game start date and completion date
 * @param completionDate - The date when the user completed the game
 * @returns Promise<BonusCalculationResult | null>
 */
export async function calculateTimeBonus(completionDate: string): Promise<BonusCalculationResult | null> {
  try {
    // Get game settings
    const { data: gameSettings, error: gameError } = await supabase
      .from('game_settings')
      .select('game_start_date')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (gameError || !gameSettings?.game_start_date) {
      console.log('❌ [BONUS CALC] No game settings found');
      return null;
    }

    // Calculate completion date and days difference
    const gameStartDateStr = gameSettings.game_start_date.split('T')[0];
    const completionDateStr = completionDate.split('T')[0];
    const gameStartDate = new Date(gameStartDateStr);
    const completionDateObj = new Date(completionDateStr);
    const daysDiff = Math.floor((completionDateObj.getTime() - gameStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('🚀 [BONUS CALC] Date calculations:', {
      gameStartDateStr,
      completionDateStr,
      daysDiff
    });
    
    // Calculate expected bonus
    let expectedBonus = 0;
    if (daysDiff === 0) expectedBonus = 150;      // Day 0: 150 XP
    else if (daysDiff === 1) expectedBonus = 100; // Day 1: 100 XP
    else if (daysDiff === 2) expectedBonus = 50;  // Day 2: 50 XP
    // Day 3+: 0 XP
    
    console.log('🚀 [BONUS CALC] Bonus calculation:', {
      daysDiff,
      expectedBonus
    });

    return {
      expectedBonus,
      daysDiff,
      gameStartDate: gameStartDateStr,
      completionDate: completionDateStr
    };
  } catch (error) {
    console.error('❌ [BONUS CALC] Error calculating bonus:', error);
    return null;
  }
}