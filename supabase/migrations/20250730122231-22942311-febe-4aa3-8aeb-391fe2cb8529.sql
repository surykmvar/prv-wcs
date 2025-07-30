-- Fix search_path for all functions to address security warnings
CREATE OR REPLACE FUNCTION public.get_user_thoughts(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT,
  final_status TEXT,
  max_woices_allowed INTEGER,
  voice_response_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    t.final_status,
    t.max_woices_allowed,
    COUNT(vr.id) as voice_response_count
  FROM public.thoughts t
  LEFT JOIN public.voice_responses vr ON t.id = vr.thought_id
  WHERE t.user_id = user_uuid
  GROUP BY t.id, t.title, t.description, t.tags, t.created_at, t.expires_at, t.status, t.final_status, t.max_woices_allowed
  ORDER BY t.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_user_voice_responses(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  thought_id UUID,
  thought_title TEXT,
  created_at TIMESTAMPTZ,
  duration INTEGER,
  audio_url TEXT,
  transcript TEXT,
  classification TEXT,
  myth_votes INTEGER,
  fact_votes INTEGER,
  unclear_votes INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    vr.id,
    vr.thought_id,
    t.title as thought_title,
    vr.created_at,
    vr.duration,
    vr.audio_url,
    vr.transcript,
    vr.classification,
    vr.myth_votes,
    vr.fact_votes,
    vr.unclear_votes
  FROM public.voice_responses vr
  JOIN public.thoughts t ON vr.thought_id = t.id
  WHERE vr.user_id = user_uuid
  ORDER BY vr.created_at DESC;
$$;

-- Fix existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name, phone, auth_method)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      CONCAT(NEW.raw_user_meta_data ->> 'first_name', ' ', NEW.raw_user_meta_data ->> 'last_name')
    ),
    NEW.phone,
    CASE 
      WHEN NEW.phone IS NOT NULL THEN 'phone'
      ELSE 'email'
    END
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Handle both INSERT/UPDATE and DELETE operations
  IF TG_OP = 'DELETE' THEN
    -- Update vote counts when a vote is deleted
    UPDATE public.voice_responses 
    SET 
      myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = OLD.voice_response_id AND vote_type = 'myth'),
      fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = OLD.voice_response_id AND vote_type = 'fact'),
      unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = OLD.voice_response_id AND vote_type = 'unclear')
    WHERE id = OLD.voice_response_id;
    RETURN OLD;
  ELSE
    -- Handle INSERT and UPDATE operations
    UPDATE public.voice_responses 
    SET 
      myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = NEW.voice_response_id AND vote_type = 'myth'),
      fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = NEW.voice_response_id AND vote_type = 'fact'),
      unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = NEW.voice_response_id AND vote_type = 'unclear')
    WHERE id = NEW.voice_response_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expired_thoughts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.thoughts 
  SET status = 'bricked'
  WHERE expires_at < now() AND status = 'active';
END;
$$;

CREATE OR REPLACE FUNCTION public.evaluate_thought_status()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.thoughts 
  SET final_status = CASE
    WHEN expires_at < now() AND status = 'active' THEN
      CASE 
        WHEN (
          SELECT SUM(fact_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) > (
          SELECT SUM(myth_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) THEN 'bloomed'
        WHEN (
          SELECT SUM(myth_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) > (
          SELECT SUM(fact_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) THEN 'bricked'
        ELSE 'unclear'
      END
    ELSE final_status
  END,
  status = CASE
    WHEN expires_at < now() AND status = 'active' THEN 'expired'
    ELSE status
  END
  WHERE expires_at < now() AND status = 'active';
END;
$$;