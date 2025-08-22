-- Temporarily activate Mission 5 for testing
INSERT INTO mission5_settings (release_date, is_active, created_by) 
VALUES (CURRENT_DATE - INTERVAL '1 day', true, null)
ON CONFLICT DO NOTHING;