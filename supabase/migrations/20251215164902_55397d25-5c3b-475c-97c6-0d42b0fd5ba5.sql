-- Function to start quiz with server timestamp
CREATE OR REPLACE FUNCTION public.start_logica_aplicada_question(p_question_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE logica_aplicada_session_state
  SET 
    current_phase = 'question',
    current_question_id = p_question_id,
    question_started_at = now(),
    updated_at = now()
  WHERE id IS NOT NULL;
END;
$$;

-- Function to advance to next question or end quiz with server timestamp
CREATE OR REPLACE FUNCTION public.next_logica_aplicada_question(p_question_id uuid, p_is_final boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_is_final THEN
    UPDATE logica_aplicada_session_state
    SET 
      current_phase = 'ended',
      updated_at = now()
    WHERE id IS NOT NULL;
  ELSE
    UPDATE logica_aplicada_session_state
    SET 
      current_phase = 'question',
      current_question_id = p_question_id,
      question_started_at = now(),
      updated_at = now()
    WHERE id IS NOT NULL;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.start_logica_aplicada_question(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_logica_aplicada_question(uuid, boolean) TO authenticated;