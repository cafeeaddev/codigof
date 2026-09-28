-- Corrigir diretamente usando o user_id conhecido
UPDATE user_progress 
SET total_play_time = 120,
    session_start_time = now(),
    last_saved_at = now(),
    updated_at = now()
WHERE user_id = '9a82fe3c-ef74-4f9b-a0fe-2a79aa28eab5';

-- Verificar se a atualização foi bem sucedida
SELECT 'Updated successfully' as status;