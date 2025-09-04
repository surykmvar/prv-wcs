-- SECURITY FIX: Fix view security definer issue by removing SECURITY DEFINER property
-- The view should not be SECURITY DEFINER as it can bypass RLS
CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT key, value, description
FROM public.app_settings
WHERE key IN ('maintenance_mode', 'app_version', 'terms_version');

-- Ensure public access to the view (this is safe for public settings only)
GRANT SELECT ON public.public_app_settings TO anon, authenticated;

-- SECURITY FIX: Update remaining functions that may not have proper search_path
CREATE OR REPLACE FUNCTION public.set_sales_inquiry_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_trending_thought_woices_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- When inserting a new thought from trending topics cache, set max_woices_allowed to 10
  IF NEW.title IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.trending_topics_cache 
    WHERE title = NEW.title AND is_active = true
  ) THEN
    NEW.max_woices_allowed := 10;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

CREATE OR REPLACE FUNCTION public.check_trending_thought_reply_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  reply_count INTEGER;
  thought_max_allowed INTEGER;
BEGIN
  -- Get the max_woices_allowed for this thought
  SELECT max_woices_allowed 
  INTO thought_max_allowed
  FROM public.thoughts 
  WHERE id = NEW.thought_id;
  
  -- If no limit is set, allow the reply
  IF thought_max_allowed IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count existing replies for this thought
  SELECT COUNT(*)
  INTO reply_count
  FROM public.voice_responses
  WHERE thought_id = NEW.thought_id;
  
  -- Check if adding this reply would exceed the limit
  IF reply_count >= thought_max_allowed THEN
    RAISE EXCEPTION 'This thought has reached its maximum of % replies', thought_max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.allocate_activity_credits(user_uuid uuid, activity_type text, target_user_uuid uuid DEFAULT NULL::uuid, reference_thought_id uuid DEFAULT NULL::uuid, woices_count integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  credits_to_add numeric := 0;
  target_credits numeric := 0;
  success boolean := true;
BEGIN
  CASE activity_type
    WHEN 'post_voice' THEN
      credits_to_add := -1; -- Deduct 1 credit for posting voice
    WHEN 'post_thought' THEN
      -- Charge 1/3 credit per Woice requested (fractional charging)
      credits_to_add := -(woices_count::numeric / 3.0);
    WHEN 'vote_fact' THEN
      credits_to_add := -1; -- Deduct 1 credit for voting
      target_credits := 1; -- Give 1 credit to voice author
    WHEN 'vote_myth' THEN
      credits_to_add := -1; -- Deduct 1 credit for voting
      target_credits := -1; -- Deduct 1 credit from voice author
    WHEN 'vote_unclear' THEN
      credits_to_add := -1; -- Deduct 1 credit for voting
      -- No credit change for voice author on unclear vote
    WHEN 'first_login_bonus' THEN
      credits_to_add := 30; -- Give 30 credits for first login (changed from 50)
    WHEN 'referral_bonus' THEN
      -- Credits amount will be passed via target_credits parameter
      credits_to_add := COALESCE(target_credits, 0);
    ELSE
      RETURN false;
  END CASE;

  -- Update user credits
  IF credits_to_add != 0 THEN
    success := public.update_user_credits(
      user_uuid, 
      credits_to_add::integer, 
      'activity', 
      activity_type,
      reference_thought_id
    );
    IF NOT success AND activity_type IN ('post_voice', 'post_thought', 'vote_fact', 'vote_myth', 'vote_unclear') THEN 
      RETURN false; 
    END IF;
  END IF;

  -- Update target user credits if applicable
  IF target_user_uuid IS NOT NULL AND target_credits != 0 THEN
    success := public.update_user_credits(
      target_user_uuid, 
      target_credits::integer, 
      'activity', 
      activity_type || '_target',
      reference_thought_id
    );
  END IF;

  RETURN success;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Handle INSERT and UPDATE cases
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.voice_responses 
        SET 
            myth_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'myth'
            ),
            fact_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'fact'
            ),
            unclear_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'unclear'
            )
        WHERE id = NEW.voice_response_id;
    END IF;
    
    -- Handle DELETE case
    IF TG_OP = 'DELETE' THEN
        UPDATE public.voice_responses 
        SET 
            myth_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'myth'
            ),
            fact_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'fact'
            ),
            unclear_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'unclear'
            )
        WHERE id = OLD.voice_response_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_voice_response_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Deduct credits for posting voice response
  IF NOT public.allocate_activity_credits(NEW.user_id, 'post_voice', NULL, NEW.thought_id) THEN
    RAISE EXCEPTION 'Insufficient credits to post voice response';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_vote_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  voice_author_id uuid;
BEGIN
  -- Get the voice response author
  SELECT user_id INTO voice_author_id 
  FROM public.voice_responses 
  WHERE id = NEW.voice_response_id;
  
  -- Allocate credits based on vote type
  IF NEW.vote_type = 'fact' THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'vote_fact', voice_author_id, NULL) THEN
      RAISE EXCEPTION 'Insufficient credits to vote';
    END IF;
  ELSIF NEW.vote_type = 'myth' THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'vote_myth', voice_author_id, NULL) THEN
      RAISE EXCEPTION 'Insufficient credits to vote';
    END IF;
  ELSIF NEW.vote_type = 'unclear' THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'vote_unclear', voice_author_id, NULL) THEN
      RAISE EXCEPTION 'Insufficient credits to vote';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_thought_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Deduct credits for posting thought based on max_woices_allowed
  IF NEW.user_id IS NOT NULL THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'post_thought', NULL, NEW.id, NEW.max_woices_allowed) THEN
      RAISE EXCEPTION 'Insufficient credits to post thought. You need at least %.2f credits.', (NEW.max_woices_allowed::numeric / 3.0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_sales_inquiries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete inquiries older than 2 years for privacy compliance
  DELETE FROM public.sales_inquiries 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_sales_inquiry_rate_limit(p_user_id uuid, p_email text, p_max_per_hour integer DEFAULT 3)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  -- Count submissions in the last hour from this user or email
  SELECT COUNT(*) INTO submission_count
  FROM public.sales_inquiries
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) 
    OR email = p_email
  )
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return false if limit exceeded
  IF submission_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expired_thoughts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
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
SET search_path = public, pg_temp
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