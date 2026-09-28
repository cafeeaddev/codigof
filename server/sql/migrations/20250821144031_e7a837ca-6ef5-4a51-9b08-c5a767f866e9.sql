-- Add game_base_xp column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN game_base_xp INTEGER DEFAULT 0;

-- Migrate existing data: set game_base_xp = total_xp - time_bonus_xp
UPDATE public.user_progress 
SET game_base_xp = COALESCE(total_xp, 0) - COALESCE(time_bonus_xp, 0);

-- Get game start date first
DO $$
DECLARE
    game_start_date DATE;
    rec RECORD;
    days_diff INTEGER;
    correct_bonus INTEGER;
    new_total_xp INTEGER;
BEGIN
    -- Get the game start date
    SELECT g.game_start_date INTO game_start_date
    FROM public.game_settings g
    ORDER BY g.created_at DESC
    LIMIT 1;
    
    -- If no game start date, exit
    IF game_start_date IS NULL THEN
        RAISE NOTICE 'No game start date found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Game start date: %', game_start_date;
    
    -- For each user with completed missions, recalculate correct bonus
    FOR rec IN 
        SELECT 
            up.user_id,
            up.total_xp,
            up.time_bonus_xp,
            up.game_base_xp,
            up.updated_at::DATE as completion_date,
            p.nome
        FROM public.user_progress up
        LEFT JOIN public.profiles p ON p.user_id = up.user_id
        WHERE up.missao_1_completed = true 
          AND up.missao_2_completed = true 
          AND up.missao_3_completed = true 
          AND up.missao_4_completed = true
    LOOP
        -- Calculate days difference
        days_diff := rec.completion_date - game_start_date;
        
        -- Calculate correct bonus
        correct_bonus := CASE 
            WHEN days_diff = 0 THEN 150
            WHEN days_diff = 1 THEN 100
            WHEN days_diff = 2 THEN 50
            ELSE 0
        END;
        
        -- Only update if current bonus is wrong
        IF COALESCE(rec.time_bonus_xp, 0) != correct_bonus THEN
            -- Calculate new total XP
            new_total_xp := rec.game_base_xp + correct_bonus;
            
            -- Update the record
            UPDATE public.user_progress 
            SET 
                time_bonus_xp = correct_bonus,
                total_xp = new_total_xp
            WHERE user_id = rec.user_id;
            
            RAISE NOTICE 'Fixed user %: completion_date=%, days_diff=%, old_bonus=%, new_bonus=%, new_total=%', 
                rec.nome, rec.completion_date, days_diff, rec.time_bonus_xp, correct_bonus, new_total_xp;
        ELSE
            RAISE NOTICE 'User % already has correct bonus: %', rec.nome, correct_bonus;
        END IF;
    END LOOP;
END $$;