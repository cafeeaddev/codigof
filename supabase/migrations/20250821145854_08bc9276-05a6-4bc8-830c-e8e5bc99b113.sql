-- Fix final scores with corrected logic for all users
DO $$
DECLARE
    rec RECORD;
    mission1_score NUMERIC := 0;
    mission2_score NUMERIC := 0;
    mission3_score NUMERIC := 0;
    total_score NUMERIC := 0;
    new_profile TEXT;
    new_sublevel TEXT;
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
        
        -- Calculate Mission 1 score (structure: array of objects with "pontuacao")
        SELECT COALESCE(
            SUM((item->>'pontuacao')::numeric), 0
        ) INTO mission1_score
        FROM respostas r
        CROSS JOIN jsonb_array_elements(r.respostas) item
        WHERE r.user_id = rec.user_id
          AND item->>'pontuacao' IS NOT NULL;
        
        -- Calculate Mission 2 score (structure: array of objects with "points")
        SELECT COALESCE(
            SUM((item->>'points')::numeric), 0
        ) INTO mission2_score
        FROM respostas_missao2 r2
        CROSS JOIN jsonb_array_elements(r2.respostas) item
        WHERE r2.user_id = rec.user_id
          AND item->>'points' IS NOT NULL;
        
        -- Calculate Mission 3 score (structure: array of objects with "points")
        SELECT COALESCE(
            SUM((item->>'points')::numeric), 0
        ) INTO mission3_score
        FROM respostas_missao3 r3
        CROSS JOIN jsonb_array_elements(r3.respostas) item
        WHERE r3.user_id = rec.user_id
          AND item->>'points' IS NOT NULL;
        
        -- Calculate total score
        total_score := ROUND((mission1_score + mission2_score + mission3_score)::numeric, 2);
        
        -- Determine new profile and sublevel based on total score (using correct thresholds)
        IF total_score >= 57 THEN
            new_profile := 'Ninja';
            new_sublevel := 'Ninja Raiz™ 😎';
        ELSIF total_score >= 52 THEN
            new_profile := 'Ninja';
            new_sublevel := 'Consolidação';
        ELSIF total_score >= 42 THEN
            new_profile := 'Pro-Player';
            new_sublevel := 'Transição → Ninja';
        ELSIF total_score >= 37 THEN
            new_profile := 'Pro-Player';
            new_sublevel := 'Início/Consolidado';
        ELSIF total_score >= 31 THEN
            new_profile := 'Explorer';
            new_sublevel := 'Transição → Pro-Player';
        ELSIF total_score >= 25 THEN
            new_profile := 'Explorer';
            new_sublevel := 'Início';
        ELSIF total_score >= 18 THEN
            new_profile := 'Beginner +';
            new_sublevel := 'Transição → Explorer';
        ELSE
            new_profile := 'Beginner';
            new_sublevel := 'Início';
        END IF;
        
        -- Update the user_progress table with correct values
        UPDATE user_progress 
        SET 
            final_score = total_score,
            final_profile = new_profile
        WHERE user_id = rec.user_id;
        
        RAISE NOTICE 'Updated user %: M1=%, M2=%, M3=%, Total=%, Profile=% %', 
            rec.nome, mission1_score, mission2_score, mission3_score, total_score, new_profile, new_sublevel;
    END LOOP;
    
    RAISE NOTICE 'Final score correction with proper thresholds completed successfully!';
END $$;