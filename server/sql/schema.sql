-- Gerado por `npm run db:pull-schema` em 2026-09-28T16:52:56.161Z. Não edite à mão.
--
-- PostgreSQL database dump
--

\restrict 5M9gBPhicFaT9g1fJf7FhROGUFeroFPrfMNZXuLbe5SxVDu1MbWznWCWmMfNpVA

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- CREATE SCHEMA public; (já existe)


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: fix_corrupted_time_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fix_corrupted_time_data() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  affected_rows INTEGER := 0;
BEGIN
  -- Reset any absurd play times (more than 8 hours) to 0
  UPDATE public.user_progress 
  SET total_play_time = 0,
      updated_at = NOW()
  WHERE total_play_time > 28800; -- 8 hours in seconds
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the fix
  RAISE NOTICE 'Fixed % user records with corrupted time data', affected_rows;
  
  RETURN affected_rows;
END;
$$;


--
-- Name: get_masked_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_masked_profiles() RETURNS TABLE(id uuid, user_id uuid, nome text, email text, cpf_masked text, cargo text, area text, area_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Only admins can access this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.nome,
    p.email,
    public.mask_cpf(p.cpf) as cpf_masked,
    p.cargo,
    p.area,
    p.area_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Só cria perfil se não tiver a flag skip_profile_creation
  -- e se não existir um perfil com o mesmo email
  IF (NEW.raw_user_meta_data ->> 'skip_profile_creation') IS NULL 
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = NEW.email) THEN
    
    INSERT INTO public.profiles (
      user_id, 
      nome, 
      email, 
      cpf
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data ->> 'nome', 
      NEW.email,
      NEW.raw_user_meta_data ->> 'cpf'
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: link_profile_with_cpf_verification(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_profile_with_cpf_verification(_email text, _cpf text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _profile_record RECORD;
  _current_user_id UUID;
BEGIN
  _current_user_id := auth.uid();
  
  -- Check if user already has a profile
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _current_user_id) THEN
    RAISE EXCEPTION 'User already has a linked profile';
  END IF;
  
  -- Find orphaned profile matching email AND CPF
  SELECT * INTO _profile_record
  FROM public.profiles
  WHERE email = _email
    AND cpf = _cpf
    AND user_id IS NULL
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.profile_link_attempts (email, attempted_user_id, success)
    VALUES (_email, _current_user_id, false);
    
    RETURN false;
  END IF;
  
  -- Link the profile
  UPDATE public.profiles
  SET user_id = _current_user_id,
      cpf_verified = true,
      linked_at = now(),
      updated_at = now()
  WHERE id = _profile_record.id;
  
  -- Log successful link
  INSERT INTO public.profile_link_attempts (email, attempted_user_id, success)
  VALUES (_email, _current_user_id, true);
  
  RETURN true;
END;
$$;


--
-- Name: log_profile_modification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_profile_modification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Log modifications to profile data
  INSERT INTO public.profile_audit_log (
    user_id, 
    accessed_profile_id, 
    action_type,
    accessed_at
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: mask_cpf(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mask_cpf(cpf_value text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Return masked CPF: XXX.XXX.XXX-XX becomes XXX.XXX.***-**
  IF cpf_value IS NULL OR length(cpf_value) < 11 THEN
    RETURN cpf_value;
  END IF;
  
  -- For formatted CPF (XXX.XXX.XXX-XX)
  IF position('.' in cpf_value) > 0 THEN
    RETURN substring(cpf_value from 1 for 7) || '***-**';
  END IF;
  
  -- For unformatted CPF (XXXXXXXXXXX)
  RETURN substring(cpf_value from 1 for 7) || '****';
END;
$$;


--
-- Name: next_logica_aplicada_question(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.next_logica_aplicada_question(p_question_id uuid, p_is_final boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: prevent_duplicate_user_progress(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_duplicate_user_progress() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if user already has progress
  IF EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = NEW.user_id) THEN
    -- Update existing record instead of inserting
    UPDATE public.user_progress 
    SET updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NULL; -- Cancel the insert
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: reset_user_progress(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reset_user_progress(_target_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _admin_user_id uuid;
  _deleted_respostas integer := 0;
  _deleted_missao2 integer := 0;
  _deleted_missao3 integer := 0;
  _deleted_missao4 integer := 0;
  _deleted_missao5 integer := 0;
BEGIN
  -- Verificar se o usuário atual é admin
  _admin_user_id := auth.uid();
  IF NOT has_role(_admin_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Verificar se o usuário alvo não é admin (admins não podem ter progresso resetado)
  IF has_role(_target_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Cannot reset progress of admin users';
  END IF;
  
  -- Verificar se existe progresso para o usuário
  IF NOT EXISTS (SELECT 1 FROM public.user_progress WHERE user_id = _target_user_id) THEN
    RAISE EXCEPTION 'User progress not found';
  END IF;
  
  -- Deletar respostas de todas as missões
  DELETE FROM public.respostas WHERE user_id = _target_user_id;
  GET DIAGNOSTICS _deleted_respostas = ROW_COUNT;
  
  DELETE FROM public.respostas_missao2 WHERE user_id = _target_user_id;
  GET DIAGNOSTICS _deleted_missao2 = ROW_COUNT;
  
  DELETE FROM public.respostas_missao3 WHERE user_id = _target_user_id;
  GET DIAGNOSTICS _deleted_missao3 = ROW_COUNT;
  
  DELETE FROM public.respostas_missao4 WHERE user_id = _target_user_id;
  GET DIAGNOSTICS _deleted_missao4 = ROW_COUNT;
  
  DELETE FROM public.respostas_missao5 WHERE user_id = _target_user_id;
  GET DIAGNOSTICS _deleted_missao5 = ROW_COUNT;
  
  -- Resetar progresso mantendo dados essenciais
  UPDATE public.user_progress 
  SET 
    -- Resetar status das missões
    missao_1_completed = false,
    missao_2_completed = false, 
    missao_3_completed = false,
    missao_4_completed = false,
    missao_5_completed = false,
    
    -- Resetar perguntas atuais
    missao_1_current_question = 0,
    missao_2_current_question = 0,
    missao_3_current_question = 0,
    missao_4_current_question = 0,
    missao_5_current_question = 0,
    
    -- Limpar respostas
    missao_1_answers = '{}'::jsonb,
    missao_2_answers = '{}'::jsonb,
    missao_3_answers = '{}'::jsonb,
    missao_4_answers = '{}'::jsonb,
    missao_5_answers = '{}'::jsonb,
    
    -- Resetar XP e tempo
    total_xp = 0,
    game_base_xp = 0,
    time_bonus_xp = 0,
    total_play_time = 0,
    
    -- Resetar posição e perfil
    current_position = 'inicio',
    final_profile = NULL,
    final_score = NULL,
    game_end_date = NULL,
    
    -- Definir nova sessão
    session_start_time = now(),
    last_saved_at = now(),
    updated_at = now()
    
  WHERE user_id = _target_user_id;
  
  -- Log da ação de reset para auditoria com detalhes das deleções
  INSERT INTO public.profile_audit_log (
    user_id, 
    accessed_profile_id,
    action_type,
    accessed_at
  ) VALUES (
    _admin_user_id,
    _target_user_id,
    'RESET_PROGRESS',
    now()
  );
  
  -- Log de debug com quantidades removidas
  RAISE NOTICE 'Reset completo realizado para usuário %: M1=% M2=% M3=% M4=% M5=%', 
    _target_user_id, _deleted_respostas, _deleted_missao2, _deleted_missao3, _deleted_missao4, _deleted_missao5;
  
  RETURN true;
END;
$$;


--
-- Name: start_logica_aplicada_question(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.start_logica_aplicada_question(p_question_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: codigo_f_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigo_f_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participant_id uuid,
    question_id uuid,
    answer text NOT NULL,
    answered_at timestamp with time zone DEFAULT now(),
    CONSTRAINT codigo_f_answers_answer_check CHECK ((answer = ANY (ARRAY['MITO'::text, 'VERDADE'::text])))
);


--
-- Name: codigo_f_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigo_f_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nickname text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: codigo_f_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigo_f_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_text text NOT NULL,
    correct_answer text NOT NULL,
    explanation text NOT NULL,
    order_position integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT codigo_f_questions_correct_answer_check CHECK ((correct_answer = ANY (ARRAY['MITO'::text, 'VERDADE'::text])))
);


--
-- Name: codigo_f_session_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigo_f_session_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    current_phase text DEFAULT 'waiting'::text NOT NULL,
    current_question_id uuid,
    question_started_at timestamp with time zone,
    session_started_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT codigo_f_session_state_current_phase_check CHECK ((current_phase = ANY (ARRAY['waiting'::text, 'question'::text, 'explanation'::text, 'ranking'::text, 'ended'::text])))
);


--
-- Name: fast_track_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fast_track_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    accepted_terms boolean NOT NULL,
    interest_level text,
    time_commitment text,
    main_objective text,
    other_objective text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fast_track_terms_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fast_track_terms_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    nome text NOT NULL,
    email text NOT NULL,
    accepted_terms boolean DEFAULT false NOT NULL,
    want_to_participate boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    decline_reason text
);


--
-- Name: fluxo_cliente_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fluxo_cliente_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    group_members text,
    flowchart_data jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now()
);


--
-- Name: fritar_ovo_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fritar_ovo_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    step_1 text DEFAULT ''::text NOT NULL,
    step_2 text DEFAULT ''::text NOT NULL,
    step_3 text DEFAULT ''::text NOT NULL,
    step_4 text DEFAULT ''::text NOT NULL,
    step_5 text DEFAULT ''::text NOT NULL,
    step_6 text DEFAULT ''::text NOT NULL,
    step_7 text DEFAULT ''::text NOT NULL,
    step_8 text DEFAULT ''::text NOT NULL,
    step_9 text DEFAULT ''::text NOT NULL,
    step_10 text DEFAULT ''::text NOT NULL,
    step_11 text DEFAULT ''::text NOT NULL,
    step_12 text DEFAULT ''::text NOT NULL,
    step_13 text DEFAULT ''::text NOT NULL,
    step_14 text DEFAULT ''::text NOT NULL,
    step_15 text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: game_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    game_start_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    extra_mission_release_date date
);


--
-- Name: logica_aplicada_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logica_aplicada_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participant_id uuid,
    question_id uuid,
    answer text NOT NULL,
    answered_at timestamp with time zone DEFAULT now(),
    time_taken_ms integer DEFAULT 0 NOT NULL,
    points_earned integer DEFAULT 0 NOT NULL,
    CONSTRAINT logica_aplicada_answers_answer_check CHECK ((answer = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text])))
);


--
-- Name: logica_aplicada_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logica_aplicada_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nickname text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: logica_aplicada_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logica_aplicada_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_position integer NOT NULL,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_option text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT logica_aplicada_questions_correct_option_check CHECK ((correct_option = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text])))
);


--
-- Name: logica_aplicada_session_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logica_aplicada_session_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    current_phase text DEFAULT 'waiting'::text NOT NULL,
    current_question_id uuid,
    question_started_at timestamp with time zone,
    session_started_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT logica_aplicada_session_state_current_phase_check CHECK ((current_phase = ANY (ARRAY['waiting'::text, 'question'::text, 'ranking_parcial'::text, 'ended'::text])))
);


--
-- Name: manual_xp_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manual_xp_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    xp_value integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    legacy_question_id integer,
    question_text text NOT NULL,
    question_type text NOT NULL,
    options jsonb,
    softwares text[],
    star_legends jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    target_area_ids uuid[],
    mission_number integer DEFAULT 4 NOT NULL,
    order_position integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    points_mapping jsonb,
    CONSTRAINT mission4_questions_question_type_check CHECK ((question_type = ANY (ARRAY['multiple-choice'::text, 'star-rating'::text])))
);


--
-- Name: mission4_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mission4_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mission4_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mission4_questions_id_seq OWNED BY public.questions.id;


--
-- Name: mission5_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mission5_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    release_date date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: profile_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    accessed_profile_id uuid,
    action_type text NOT NULL,
    accessed_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text
);


--
-- Name: profile_link_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_link_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    attempted_user_id uuid,
    attempted_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    success boolean DEFAULT false
);


--
-- Name: profile_texts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_texts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_name text NOT NULL,
    sublevel text NOT NULL,
    text_content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    cpf text NOT NULL,
    nome text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    area text,
    cargo text,
    email text,
    area_id uuid,
    cpf_verified boolean DEFAULT false,
    linked_at timestamp with time zone
);


--
-- Name: pseudo_codigo_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pseudo_codigo_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    pseudo_code text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.pseudo_codigo_submissions REPLICA IDENTITY FULL;


--
-- Name: question_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id integer NOT NULL,
    option_letter text NOT NULL,
    option_text text NOT NULL,
    points numeric DEFAULT 0 NOT NULL,
    order_position integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_options_option_letter_check CHECK ((option_letter = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, '1'::text, '2'::text, '3'::text, '4'::text, '5'::text])))
);


--
-- Name: quiz2_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz2_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    keyword text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    group_members text
);


--
-- Name: quiz3_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz3_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participant_id uuid,
    question_id uuid,
    answer text NOT NULL,
    answered_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz3_answers_answer_check CHECK ((answer = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text])))
);


--
-- Name: quiz3_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz3_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nickname text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: quiz3_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz3_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_position integer NOT NULL,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_option text NOT NULL,
    feedback_correct text NOT NULL,
    feedback_incorrect text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz3_questions_correct_option_check CHECK ((correct_option = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text])))
);


--
-- Name: quiz3_session_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz3_session_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    current_phase text DEFAULT 'waiting'::text NOT NULL,
    current_question_id uuid,
    question_started_at timestamp with time zone,
    session_started_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz3_session_state_current_phase_check CHECK ((current_phase = ANY (ARRAY['waiting'::text, 'question'::text, 'explanation'::text, 'ranking'::text, 'ended'::text])))
);


--
-- Name: quiz4_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz4_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    group_members text,
    problem text NOT NULL,
    solution text NOT NULL,
    technology text NOT NULL,
    human_impact text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quiz5_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz5_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participant_name text NOT NULL,
    initials text NOT NULL,
    mindset_change text NOT NULL,
    digital_idea text NOT NULL,
    digital_habit text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: respostas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    nome text NOT NULL,
    email text NOT NULL,
    respostas jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: respostas_missao2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas_missao2 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    respostas jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: respostas_missao3; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas_missao3 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    respostas jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: respostas_missao4; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas_missao4 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    respostas jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: respostas_missao5; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas_missao5 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    nome text NOT NULL,
    email text NOT NULL,
    respostas jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    missao_1_completed boolean DEFAULT false,
    missao_2_completed boolean DEFAULT false,
    missao_3_completed boolean DEFAULT false,
    missao_4_completed boolean DEFAULT false,
    total_xp integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_position text DEFAULT 'inicio'::text,
    total_play_time integer DEFAULT 0,
    session_start_time timestamp with time zone DEFAULT now(),
    last_saved_at timestamp with time zone DEFAULT now(),
    missao_1_current_question integer DEFAULT 0,
    missao_1_answers jsonb DEFAULT '{}'::jsonb,
    missao_2_current_question integer DEFAULT 0,
    missao_2_answers jsonb DEFAULT '{}'::jsonb,
    missao_3_current_question integer DEFAULT 0,
    missao_3_answers jsonb DEFAULT '{}'::jsonb,
    missao_4_current_question integer DEFAULT 0,
    missao_4_answers jsonb DEFAULT '{}'::jsonb,
    final_profile text,
    final_score numeric(10,2),
    time_bonus_xp integer DEFAULT 0,
    game_base_xp integer DEFAULT 0,
    game_end_date timestamp with time zone,
    missao_5_completed boolean DEFAULT false,
    missao_5_current_question integer DEFAULT 0,
    missao_5_answers jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT check_reasonable_play_time CHECK (((total_play_time >= 0) AND (total_play_time <= 86400))),
    CONSTRAINT check_session_start_time_not_future CHECK ((session_start_time <= (now() + '01:00:00'::interval)))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.mission4_questions_id_seq'::regclass);


--
-- Name: areas areas_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_code_key UNIQUE (code);


--
-- Name: areas areas_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_name_key UNIQUE (name);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: codigo_f_answers codigo_f_answers_participant_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_answers
    ADD CONSTRAINT codigo_f_answers_participant_id_question_id_key UNIQUE (participant_id, question_id);


--
-- Name: codigo_f_answers codigo_f_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_answers
    ADD CONSTRAINT codigo_f_answers_pkey PRIMARY KEY (id);


--
-- Name: codigo_f_participants codigo_f_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_participants
    ADD CONSTRAINT codigo_f_participants_pkey PRIMARY KEY (id);


--
-- Name: codigo_f_questions codigo_f_questions_order_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_questions
    ADD CONSTRAINT codigo_f_questions_order_position_key UNIQUE (order_position);


--
-- Name: codigo_f_questions codigo_f_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_questions
    ADD CONSTRAINT codigo_f_questions_pkey PRIMARY KEY (id);


--
-- Name: codigo_f_session_state codigo_f_session_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_session_state
    ADD CONSTRAINT codigo_f_session_state_pkey PRIMARY KEY (id);


--
-- Name: fast_track_responses fast_track_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fast_track_responses
    ADD CONSTRAINT fast_track_responses_pkey PRIMARY KEY (id);


--
-- Name: fast_track_terms_responses fast_track_terms_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fast_track_terms_responses
    ADD CONSTRAINT fast_track_terms_responses_pkey PRIMARY KEY (id);


--
-- Name: fluxo_cliente_submissions fluxo_cliente_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fluxo_cliente_submissions
    ADD CONSTRAINT fluxo_cliente_submissions_pkey PRIMARY KEY (id);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: fritar_ovo_submissions fritar_ovo_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fritar_ovo_submissions
    ADD CONSTRAINT fritar_ovo_submissions_pkey PRIMARY KEY (id);


--
-- Name: game_settings game_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_settings
    ADD CONSTRAINT game_settings_pkey PRIMARY KEY (id);


--
-- Name: logica_aplicada_answers logica_aplicada_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_answers
    ADD CONSTRAINT logica_aplicada_answers_pkey PRIMARY KEY (id);


--
-- Name: logica_aplicada_participants logica_aplicada_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_participants
    ADD CONSTRAINT logica_aplicada_participants_pkey PRIMARY KEY (id);


--
-- Name: logica_aplicada_questions logica_aplicada_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_questions
    ADD CONSTRAINT logica_aplicada_questions_pkey PRIMARY KEY (id);


--
-- Name: logica_aplicada_session_state logica_aplicada_session_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_session_state
    ADD CONSTRAINT logica_aplicada_session_state_pkey PRIMARY KEY (id);


--
-- Name: manual_xp_adjustments manual_xp_adjustments_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_xp_adjustments
    ADD CONSTRAINT manual_xp_adjustments_email_key UNIQUE (email);


--
-- Name: manual_xp_adjustments manual_xp_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_xp_adjustments
    ADD CONSTRAINT manual_xp_adjustments_pkey PRIMARY KEY (id);


--
-- Name: questions mission4_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT mission4_questions_pkey PRIMARY KEY (id);


--
-- Name: mission5_settings mission5_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mission5_settings
    ADD CONSTRAINT mission5_settings_pkey PRIMARY KEY (id);


--
-- Name: profile_audit_log profile_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_audit_log
    ADD CONSTRAINT profile_audit_log_pkey PRIMARY KEY (id);


--
-- Name: profile_link_attempts profile_link_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_link_attempts
    ADD CONSTRAINT profile_link_attempts_pkey PRIMARY KEY (id);


--
-- Name: profile_texts profile_texts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_texts
    ADD CONSTRAINT profile_texts_pkey PRIMARY KEY (id);


--
-- Name: profile_texts profile_texts_profile_name_sublevel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_texts
    ADD CONSTRAINT profile_texts_profile_name_sublevel_key UNIQUE (profile_name, sublevel);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);


--
-- Name: pseudo_codigo_submissions pseudo_codigo_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pseudo_codigo_submissions
    ADD CONSTRAINT pseudo_codigo_submissions_pkey PRIMARY KEY (id);


--
-- Name: question_options question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);


--
-- Name: question_options question_options_question_id_option_letter_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_option_letter_key UNIQUE (question_id, option_letter);


--
-- Name: quiz2_submissions quiz2_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz2_submissions
    ADD CONSTRAINT quiz2_submissions_pkey PRIMARY KEY (id);


--
-- Name: quiz3_answers quiz3_answers_participant_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_answers
    ADD CONSTRAINT quiz3_answers_participant_id_question_id_key UNIQUE (participant_id, question_id);


--
-- Name: quiz3_answers quiz3_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_answers
    ADD CONSTRAINT quiz3_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz3_participants quiz3_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_participants
    ADD CONSTRAINT quiz3_participants_pkey PRIMARY KEY (id);


--
-- Name: quiz3_questions quiz3_questions_order_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_questions
    ADD CONSTRAINT quiz3_questions_order_position_key UNIQUE (order_position);


--
-- Name: quiz3_questions quiz3_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_questions
    ADD CONSTRAINT quiz3_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz3_session_state quiz3_session_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_session_state
    ADD CONSTRAINT quiz3_session_state_pkey PRIMARY KEY (id);


--
-- Name: quiz4_submissions quiz4_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz4_submissions
    ADD CONSTRAINT quiz4_submissions_pkey PRIMARY KEY (id);


--
-- Name: quiz5_submissions quiz5_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz5_submissions
    ADD CONSTRAINT quiz5_submissions_pkey PRIMARY KEY (id);


--
-- Name: respostas_missao2 respostas_missao2_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao2
    ADD CONSTRAINT respostas_missao2_pkey PRIMARY KEY (id);


--
-- Name: respostas_missao3 respostas_missao3_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao3
    ADD CONSTRAINT respostas_missao3_pkey PRIMARY KEY (id);


--
-- Name: respostas_missao4 respostas_missao4_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao4
    ADD CONSTRAINT respostas_missao4_pkey PRIMARY KEY (id);


--
-- Name: respostas_missao5 respostas_missao5_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao5
    ADD CONSTRAINT respostas_missao5_pkey PRIMARY KEY (id);


--
-- Name: respostas respostas_new_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas
    ADD CONSTRAINT respostas_new_pkey1 PRIMARY KEY (id);


--
-- Name: user_progress unique_user_progress_per_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT unique_user_progress_per_user UNIQUE (user_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_answers_participant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_participant ON public.codigo_f_answers USING btree (participant_id);


--
-- Name: idx_answers_question; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_question ON public.codigo_f_answers USING btree (question_id);


--
-- Name: idx_manual_xp_adjustments_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manual_xp_adjustments_email ON public.manual_xp_adjustments USING btree (email);


--
-- Name: idx_manual_xp_adjustments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manual_xp_adjustments_user_id ON public.manual_xp_adjustments USING btree (user_id);


--
-- Name: idx_profiles_orphaned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_orphaned ON public.profiles USING btree (email, user_id) WHERE (user_id IS NULL);


--
-- Name: idx_respostas_missao2_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respostas_missao2_user_id ON public.respostas_missao2 USING btree (user_id);


--
-- Name: idx_respostas_missao3_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respostas_missao3_user_id ON public.respostas_missao3 USING btree (user_id);


--
-- Name: idx_respostas_missao4_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respostas_missao4_user_id ON public.respostas_missao4 USING btree (user_id);


--
-- Name: idx_single_session; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_single_session ON public.codigo_f_session_state USING btree ((true));


--
-- Name: idx_user_progress_user_id_last_saved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user_id_last_saved ON public.user_progress USING btree (user_id, last_saved_at);


--
-- Name: user_progress before_insert_user_progress; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER before_insert_user_progress BEFORE INSERT ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_user_progress();


--
-- Name: profiles profile_modification_audit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profile_modification_audit AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_profile_modification();


--
-- Name: areas update_areas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: fast_track_terms_responses update_fast_track_terms_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fast_track_terms_responses_updated_at BEFORE UPDATE ON public.fast_track_terms_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: game_settings update_game_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_game_settings_updated_at BEFORE UPDATE ON public.game_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: manual_xp_adjustments update_manual_xp_adjustments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_manual_xp_adjustments_updated_at BEFORE UPDATE ON public.manual_xp_adjustments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: questions update_mission4_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_mission4_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: mission5_settings update_mission5_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_mission5_settings_updated_at BEFORE UPDATE ON public.mission5_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profile_texts update_profile_texts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profile_texts_updated_at BEFORE UPDATE ON public.profile_texts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: question_options update_question_options_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_question_options_updated_at BEFORE UPDATE ON public.question_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: respostas_missao2 update_respostas_missao2_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_respostas_missao2_updated_at BEFORE UPDATE ON public.respostas_missao2 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: respostas_missao4 update_respostas_missao4_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_respostas_missao4_updated_at BEFORE UPDATE ON public.respostas_missao4 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: respostas_missao5 update_respostas_missao5_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_respostas_missao5_updated_at BEFORE UPDATE ON public.respostas_missao5 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: respostas update_respostas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_respostas_updated_at BEFORE UPDATE ON public.respostas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_progress update_user_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: codigo_f_answers codigo_f_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_answers
    ADD CONSTRAINT codigo_f_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.codigo_f_participants(id) ON DELETE CASCADE;


--
-- Name: codigo_f_answers codigo_f_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_answers
    ADD CONSTRAINT codigo_f_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.codigo_f_questions(id) ON DELETE CASCADE;


--
-- Name: codigo_f_session_state codigo_f_session_state_current_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigo_f_session_state
    ADD CONSTRAINT codigo_f_session_state_current_question_id_fkey FOREIGN KEY (current_question_id) REFERENCES public.codigo_f_questions(id);


--
-- Name: fast_track_responses fast_track_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fast_track_responses
    ADD CONSTRAINT fast_track_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: fast_track_terms_responses fast_track_terms_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fast_track_terms_responses
    ADD CONSTRAINT fast_track_terms_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: game_settings game_settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_settings
    ADD CONSTRAINT game_settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: logica_aplicada_answers logica_aplicada_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_answers
    ADD CONSTRAINT logica_aplicada_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.logica_aplicada_participants(id) ON DELETE CASCADE;


--
-- Name: logica_aplicada_answers logica_aplicada_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_answers
    ADD CONSTRAINT logica_aplicada_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.logica_aplicada_questions(id) ON DELETE CASCADE;


--
-- Name: logica_aplicada_session_state logica_aplicada_session_state_current_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logica_aplicada_session_state
    ADD CONSTRAINT logica_aplicada_session_state_current_question_id_fkey FOREIGN KEY (current_question_id) REFERENCES public.logica_aplicada_questions(id);


--
-- Name: manual_xp_adjustments manual_xp_adjustments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_xp_adjustments
    ADD CONSTRAINT manual_xp_adjustments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mission5_settings mission5_settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mission5_settings
    ADD CONSTRAINT mission5_settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_options question_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: quiz3_answers quiz3_answers_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_answers
    ADD CONSTRAINT quiz3_answers_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.quiz3_participants(id) ON DELETE CASCADE;


--
-- Name: quiz3_answers quiz3_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_answers
    ADD CONSTRAINT quiz3_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz3_questions(id) ON DELETE CASCADE;


--
-- Name: quiz3_session_state quiz3_session_state_current_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz3_session_state
    ADD CONSTRAINT quiz3_session_state_current_question_id_fkey FOREIGN KEY (current_question_id) REFERENCES public.quiz3_questions(id) ON DELETE SET NULL;


--
-- Name: respostas_missao2 respostas_missao2_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao2
    ADD CONSTRAINT respostas_missao2_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: respostas_missao3 respostas_missao3_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao3
    ADD CONSTRAINT respostas_missao3_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: respostas_missao4 respostas_missao4_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao4
    ADD CONSTRAINT respostas_missao4_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: respostas_missao5 respostas_missao5_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_missao5
    ADD CONSTRAINT respostas_missao5_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: fluxo_cliente_submissions Admins can delete fluxo cliente submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete fluxo cliente submissions" ON public.fluxo_cliente_submissions FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: fritar_ovo_submissions Admins can delete fritar_ovo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete fritar_ovo submissions" ON public.fritar_ovo_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: logica_aplicada_answers Admins can delete logica aplicada answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete logica aplicada answers" ON public.logica_aplicada_answers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: logica_aplicada_participants Admins can delete logica aplicada participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete logica aplicada participants" ON public.logica_aplicada_participants FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manual_xp_adjustments Admins can delete manual xp adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete manual xp adjustments" ON public.manual_xp_adjustments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pseudo_codigo_submissions Admins can delete pseudo_codigo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete pseudo_codigo submissions" ON public.pseudo_codigo_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: codigo_f_answers Admins can delete quiz1 answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz1 answers" ON public.codigo_f_answers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: codigo_f_participants Admins can delete quiz1 participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz1 participants" ON public.codigo_f_participants FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz2_submissions Admins can delete quiz2 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz2 submissions" ON public.quiz2_submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz3_answers Admins can delete quiz3 answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz3 answers" ON public.quiz3_answers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz3_participants Admins can delete quiz3 participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz3 participants" ON public.quiz3_participants FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz4_submissions Admins can delete quiz4 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz4 submissions" ON public.quiz4_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz5_submissions Admins can delete quiz5 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quiz5 submissions" ON public.quiz5_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manual_xp_adjustments Admins can insert manual xp adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert manual xp adjustments" ON public.manual_xp_adjustments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manual_xp_adjustments Admins can update manual xp adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update manual xp adjustments" ON public.manual_xp_adjustments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profile_audit_log Admins can view all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all audit logs" ON public.profile_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: fast_track_responses Admins can view all fast track responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all fast track responses" ON public.fast_track_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manual_xp_adjustments Admins can view all manual xp adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all manual xp adjustments" ON public.manual_xp_adjustments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: respostas_missao2 Admins can view all mission 2 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all mission 2 responses" ON public.respostas_missao2 FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: respostas_missao3 Admins can view all mission 3 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all mission 3 responses" ON public.respostas_missao3 FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: respostas_missao4 Admins can view all mission 4 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all mission 4 responses" ON public.respostas_missao4 FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: respostas_missao5 Admins can view all mission 5 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all mission 5 responses" ON public.respostas_missao5 FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: respostas Admins can view all responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all responses" ON public.respostas FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: fast_track_terms_responses Admins can view all terms responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all terms responses" ON public.fast_track_terms_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_progress Admins can view all user progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all user progress" ON public.user_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profile_link_attempts Admins can view profile link attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view profile link attempts" ON public.profile_link_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: form_submissions Allow anonymous inserts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow anonymous inserts" ON public.form_submissions FOR INSERT TO anon WITH CHECK (true);


--
-- Name: fluxo_cliente_submissions Anyone can insert fluxo cliente submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert fluxo cliente submissions" ON public.fluxo_cliente_submissions FOR INSERT WITH CHECK (true);


--
-- Name: fritar_ovo_submissions Anyone can insert fritar_ovo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert fritar_ovo submissions" ON public.fritar_ovo_submissions FOR INSERT WITH CHECK (true);


--
-- Name: logica_aplicada_answers Anyone can insert logica aplicada answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert logica aplicada answers" ON public.logica_aplicada_answers FOR INSERT WITH CHECK (true);


--
-- Name: pseudo_codigo_submissions Anyone can insert pseudo_codigo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert pseudo_codigo submissions" ON public.pseudo_codigo_submissions FOR INSERT WITH CHECK (true);


--
-- Name: quiz2_submissions Anyone can insert quiz2 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert quiz2 submissions" ON public.quiz2_submissions FOR INSERT WITH CHECK (true);


--
-- Name: quiz3_answers Anyone can insert quiz3 answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert quiz3 answers" ON public.quiz3_answers FOR INSERT WITH CHECK (true);


--
-- Name: quiz4_submissions Anyone can insert quiz4 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert quiz4 submissions" ON public.quiz4_submissions FOR INSERT WITH CHECK (true);


--
-- Name: quiz5_submissions Anyone can insert quiz5 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert quiz5 submissions" ON public.quiz5_submissions FOR INSERT WITH CHECK (true);


--
-- Name: logica_aplicada_participants Anyone can register as logica aplicada participant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can register as logica aplicada participant" ON public.logica_aplicada_participants FOR INSERT WITH CHECK (true);


--
-- Name: quiz3_participants Anyone can register as quiz3 participant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can register as quiz3 participant" ON public.quiz3_participants FOR INSERT WITH CHECK (true);


--
-- Name: fluxo_cliente_submissions Anyone can view fluxo cliente submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view fluxo cliente submissions" ON public.fluxo_cliente_submissions FOR SELECT USING (true);


--
-- Name: fritar_ovo_submissions Anyone can view fritar_ovo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view fritar_ovo submissions" ON public.fritar_ovo_submissions FOR SELECT USING (true);


--
-- Name: logica_aplicada_answers Anyone can view logica aplicada answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view logica aplicada answers" ON public.logica_aplicada_answers FOR SELECT USING (true);


--
-- Name: logica_aplicada_participants Anyone can view logica aplicada participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view logica aplicada participants" ON public.logica_aplicada_participants FOR SELECT USING (true);


--
-- Name: logica_aplicada_questions Anyone can view logica aplicada questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view logica aplicada questions" ON public.logica_aplicada_questions FOR SELECT USING (true);


--
-- Name: logica_aplicada_session_state Anyone can view logica aplicada session state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view logica aplicada session state" ON public.logica_aplicada_session_state FOR SELECT USING (true);


--
-- Name: pseudo_codigo_submissions Anyone can view pseudo_codigo submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view pseudo_codigo submissions" ON public.pseudo_codigo_submissions FOR SELECT USING (true);


--
-- Name: quiz2_submissions Anyone can view quiz2 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz2 submissions" ON public.quiz2_submissions FOR SELECT USING (true);


--
-- Name: quiz3_answers Anyone can view quiz3 answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz3 answers" ON public.quiz3_answers FOR SELECT USING (true);


--
-- Name: quiz3_participants Anyone can view quiz3 participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz3 participants" ON public.quiz3_participants FOR SELECT USING (true);


--
-- Name: quiz3_questions Anyone can view quiz3 questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz3 questions" ON public.quiz3_questions FOR SELECT USING (true);


--
-- Name: quiz3_session_state Anyone can view quiz3 session state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz3 session state" ON public.quiz3_session_state FOR SELECT USING (true);


--
-- Name: quiz4_submissions Anyone can view quiz4 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz4 submissions" ON public.quiz4_submissions FOR SELECT USING (true);


--
-- Name: quiz5_submissions Anyone can view quiz5 submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view quiz5 submissions" ON public.quiz5_submissions FOR SELECT USING (true);


--
-- Name: codigo_f_session_state Apenas admins podem modificar estado da sessão; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Apenas admins podem modificar estado da sessão" ON public.codigo_f_session_state USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: codigo_f_questions Apenas admins podem modificar perguntas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Apenas admins podem modificar perguntas" ON public.codigo_f_questions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: areas Authenticated users can view areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view areas" ON public.areas FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: game_settings Authenticated users can view game settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view game settings" ON public.game_settings FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: mission5_settings Authenticated users can view mission5 settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view mission5 settings" ON public.mission5_settings FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: profile_texts Authenticated users can view profile texts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view profile texts" ON public.profile_texts FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: question_options Authenticated users can view question options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view question options" ON public.question_options FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: questions Authenticated users can view questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view questions" ON public.questions FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: manual_xp_adjustments Only admins can delete manual XP adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete manual XP adjustments" ON public.manual_xp_adjustments FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can delete user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can insert user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert user roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: areas Only admins can modify areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify areas" ON public.areas USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: game_settings Only admins can modify game settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify game settings" ON public.game_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: logica_aplicada_questions Only admins can modify logica aplicada questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify logica aplicada questions" ON public.logica_aplicada_questions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: logica_aplicada_session_state Only admins can modify logica aplicada session state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify logica aplicada session state" ON public.logica_aplicada_session_state USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: questions Only admins can modify mission 4 questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify mission 4 questions" ON public.questions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: mission5_settings Only admins can modify mission5 settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify mission5 settings" ON public.mission5_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profile_texts Only admins can modify profile texts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify profile texts" ON public.profile_texts USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: question_options Only admins can modify question options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify question options" ON public.question_options USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz3_questions Only admins can modify quiz3 questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify quiz3 questions" ON public.quiz3_questions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz3_session_state Only admins can modify quiz3 session state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify quiz3 session state" ON public.quiz3_session_state USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can update user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (user_id = auth.uid())));


--
-- Name: codigo_f_answers Qualquer um pode enviar respostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode enviar respostas" ON public.codigo_f_answers FOR INSERT WITH CHECK (true);


--
-- Name: codigo_f_session_state Qualquer um pode ler estado da sessão; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode ler estado da sessão" ON public.codigo_f_session_state FOR SELECT USING (true);


--
-- Name: codigo_f_participants Qualquer um pode ler participantes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode ler participantes" ON public.codigo_f_participants FOR SELECT USING (true);


--
-- Name: codigo_f_questions Qualquer um pode ler perguntas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode ler perguntas" ON public.codigo_f_questions FOR SELECT USING (true);


--
-- Name: codigo_f_answers Qualquer um pode ler respostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode ler respostas" ON public.codigo_f_answers FOR SELECT USING (true);


--
-- Name: codigo_f_participants Qualquer um pode se registrar como participante; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode se registrar como participante" ON public.codigo_f_participants FOR INSERT WITH CHECK (true);


--
-- Name: fast_track_responses Users can insert their own fast track responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own fast track responses" ON public.fast_track_responses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: respostas_missao2 Users can insert their own mission 2 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own mission 2 responses" ON public.respostas_missao2 FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: respostas_missao3 Users can insert their own mission 3 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own mission 3 responses" ON public.respostas_missao3 FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: respostas_missao4 Users can insert their own mission 4 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own mission 4 responses" ON public.respostas_missao4 FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: respostas_missao5 Users can insert their own mission 5 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own mission 5 responses" ON public.respostas_missao5 FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_progress Users can insert their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: respostas Users can insert their own responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own responses" ON public.respostas FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: fast_track_terms_responses Users can insert their own terms responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own terms responses" ON public.fast_track_terms_responses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: fast_track_responses Users can update their own fast track responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own fast track responses" ON public.fast_track_responses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_progress Users can update their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: manual_xp_adjustments Users can view their manual XP adjustments by user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their manual XP adjustments by user_id" ON public.manual_xp_adjustments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profile_audit_log Users can view their own audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own audit logs" ON public.profile_audit_log FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: fast_track_responses Users can view their own fast track responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own fast track responses" ON public.fast_track_responses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: respostas_missao2 Users can view their own mission 2 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own mission 2 responses" ON public.respostas_missao2 FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: respostas_missao3 Users can view their own mission 3 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own mission 3 responses" ON public.respostas_missao3 FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: respostas_missao4 Users can view their own mission 4 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own mission 4 responses" ON public.respostas_missao4 FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: respostas_missao5 Users can view their own mission 5 responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own mission 5 responses" ON public.respostas_missao5 FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_progress Users can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: respostas Users can view their own responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own responses" ON public.respostas FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: fast_track_terms_responses Users can view their own terms responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own terms responses" ON public.fast_track_terms_responses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: areas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

--
-- Name: codigo_f_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.codigo_f_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: codigo_f_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.codigo_f_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: codigo_f_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.codigo_f_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: codigo_f_session_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.codigo_f_session_state ENABLE ROW LEVEL SECURITY;

--
-- Name: fast_track_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fast_track_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: fast_track_terms_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fast_track_terms_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: fluxo_cliente_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fluxo_cliente_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: form_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: fritar_ovo_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fritar_ovo_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: game_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: logica_aplicada_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.logica_aplicada_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: logica_aplicada_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.logica_aplicada_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: logica_aplicada_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.logica_aplicada_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: logica_aplicada_session_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.logica_aplicada_session_state ENABLE ROW LEVEL SECURITY;

--
-- Name: manual_xp_adjustments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manual_xp_adjustments ENABLE ROW LEVEL SECURITY;

--
-- Name: mission5_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mission5_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_link_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_link_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_texts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_texts ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: pseudo_codigo_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pseudo_codigo_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: question_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz2_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz2_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz3_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz3_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz3_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz3_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz3_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz3_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz3_session_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz3_session_state ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz4_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz4_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz5_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz5_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas_missao2; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas_missao2 ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas_missao3; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas_missao3 ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas_missao4; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas_missao4 ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas_missao5; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas_missao5 ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict 5M9gBPhicFaT9g1fJf7FhROGUFeroFPrfMNZXuLbe5SxVDu1MbWznWCWmMfNpVA


-- Triggers do app em auth.users
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabelas com realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public."codigo_f_answers";
ALTER PUBLICATION supabase_realtime ADD TABLE public."codigo_f_participants";
ALTER PUBLICATION supabase_realtime ADD TABLE public."codigo_f_questions";
ALTER PUBLICATION supabase_realtime ADD TABLE public."codigo_f_session_state";
ALTER PUBLICATION supabase_realtime ADD TABLE public."fritar_ovo_submissions";
ALTER PUBLICATION supabase_realtime ADD TABLE public."logica_aplicada_answers";
ALTER PUBLICATION supabase_realtime ADD TABLE public."logica_aplicada_participants";
ALTER PUBLICATION supabase_realtime ADD TABLE public."logica_aplicada_session_state";
ALTER PUBLICATION supabase_realtime ADD TABLE public."pseudo_codigo_submissions";
ALTER PUBLICATION supabase_realtime ADD TABLE public."quiz4_submissions";
