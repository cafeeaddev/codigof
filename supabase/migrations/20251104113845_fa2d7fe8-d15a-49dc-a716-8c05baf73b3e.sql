-- Initialize Quiz 1 session state if it doesn't exist
INSERT INTO codigo_f_session_state (current_phase, session_started_at, updated_at)
SELECT 'waiting', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codigo_f_session_state LIMIT 1);