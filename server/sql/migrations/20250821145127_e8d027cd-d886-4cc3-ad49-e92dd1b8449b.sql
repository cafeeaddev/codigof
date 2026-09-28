-- Fix final_score calculation for existing users
-- This will recalculate the final score based on actual mission responses

DO $$
DECLARE
    rec RECORD;
    mission1_score NUMERIC := 0;
    mission2_score NUMERIC := 0;
    mission3_score NUMERIC := 0;
    total_score NUMERIC := 0;
    new_profile TEXT;
BEGIN
    -- For each user with completed missions, recalculate their final score
    FOR rec IN 
        SELECT 
            up.user_id,
            up.final_score,
            up.final_profile,
            p.nome
        FROM user_progress up
        LEFT JOIN profiles p ON p.user_id = up.user_id
        WHERE up.missao_1_completed = true 
          AND up.missao_2_completed = true 
          AND up.missao_3_completed = true
    LOOP
        RAISE NOTICE 'Processing user: % (current score: %, profile: %)', rec.nome, rec.final_score, rec.final_profile;
        
        -- Reset scores
        mission1_score := 0;
        mission2_score := 0;
        mission3_score := 0;
        
        -- Calculate Mission 1 score
        SELECT COALESCE(
            SUM(
                CASE 
                    WHEN jsonb_typeof(respostas) = 'array' THEN
                        (SELECT SUM((item->>'pontuacao')::numeric) 
                         FROM jsonb_array_elements(respostas) item
                         WHERE item->>'pontuacao' IS NOT NULL)
                    WHEN jsonb_typeof(respostas->'data') = 'array' THEN
                        (SELECT SUM((item->>'pontuacao')::numeric) 
                         FROM jsonb_array_elements(respostas->'data') item
                         WHERE item->>'pontuacao' IS NOT NULL)
                    ELSE 0
                END
            ), 0
        ) INTO mission1_score
        FROM respostas 
        WHERE user_id = rec.user_id;
        
        -- Calculate Mission 2 score
        SELECT COALESCE(
            SUM(
                CASE 
                    WHEN jsonb_typeof(respostas->'data') = 'array' THEN
                        (SELECT SUM((item->>'pontuacao')::numeric) 
                         FROM jsonb_array_elements(respostas->'data') item
                         WHERE item->>'pontuacao' IS NOT NULL)
                    ELSE 0
                END
            ), 0
        ) INTO mission2_score
        FROM respostas_missao2 
        WHERE user_id = rec.user_id;
        
        -- Calculate Mission 3 score
        SELECT COALESCE(
            SUM(
                CASE 
                    WHEN jsonb_typeof(respostas) = 'array' THEN
                        (SELECT SUM((item->>'pontuacao')::numeric) 
                         FROM jsonb_array_elements(respostas) item
                         WHERE item->>'pontuacao' IS NOT NULL)
                    ELSE 0
                END
            ), 0
        ) INTO mission3_score
        FROM respostas_missao3 
        WHERE user_id = rec.user_id;
        
        -- Calculate total score
        total_score := ROUND((mission1_score + mission2_score + mission3_score)::numeric, 2);
        
        -- Determine new profile based on total score
        new_profile := CASE 
            WHEN total_score >= 50 THEN 'Ninja'
            WHEN total_score >= 40 THEN 'Pro-Player'
            WHEN total_score >= 30 THEN 'Explorer'
            WHEN total_score >= 20 THEN 'Beginner +'
            ELSE 'Beginner'
        END;
        
        -- Update the user_progress table with correct values
        UPDATE user_progress 
        SET 
            final_score = total_score,
            final_profile = new_profile
        WHERE user_id = rec.user_id;
        
        RAISE NOTICE 'Updated user %: M1=%, M2=%, M3=%, Total=%, Profile=% (was: %)', 
            rec.nome, mission1_score, mission2_score, mission3_score, total_score, new_profile, rec.final_profile;
    END LOOP;
    
    RAISE NOTICE 'Final score correction completed successfully!';
END $$;