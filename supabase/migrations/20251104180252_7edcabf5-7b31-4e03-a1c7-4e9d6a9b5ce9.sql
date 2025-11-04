-- Add 'ranking' phase to codigo_f_session_state
-- Current phases: 'waiting' | 'question' | 'explanation' | 'ended'
-- New phases: 'waiting' | 'question' | 'explanation' | 'ranking' | 'ended'

-- Drop existing constraint if it exists
ALTER TABLE codigo_f_session_state DROP CONSTRAINT IF EXISTS codigo_f_session_state_current_phase_check;

-- Add new constraint with 'ranking' phase
ALTER TABLE codigo_f_session_state 
ADD CONSTRAINT codigo_f_session_state_current_phase_check 
CHECK (current_phase IN ('waiting', 'question', 'explanation', 'ranking', 'ended'));