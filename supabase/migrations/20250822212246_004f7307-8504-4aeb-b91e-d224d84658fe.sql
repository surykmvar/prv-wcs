-- Add unique constraint to prevent duplicate thoughts from same trending topic
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_trending_thoughts 
ON public.thoughts (title, description) 
WHERE status = 'active';

-- Add constraint to limit one voice response per user per thought
ALTER TABLE public.voice_responses 
ADD CONSTRAINT unique_user_thought_response 
UNIQUE (user_id, thought_id);

-- Function to allocate credits for various activities
CREATE OR REPLACE FUNCTION public.allocate_activity_credits(
  user_uuid uuid, 
  activity_type text, 
  target_user_uuid uuid DEFAULT NULL,
  reference_thought_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  credits_to_add integer := 0;
  target_credits integer := 0;
  success boolean := true;
BEGIN
  CASE activity_type
    WHEN 'post_voice' THEN
      credits_to_add := -1; -- Deduct 1 credit for posting voice
    WHEN 'post_thought' THEN
      credits_to_add := -2; -- Deduct 2 credits for posting thought
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
      credits_to_add := 50; -- Give 50 credits for first login
    WHEN 'referral_bonus' THEN
      -- Credits amount will be passed via credits_to_add parameter
      credits_to_add := COALESCE(target_credits, 0);
    ELSE
      RETURN false;
  END CASE;

  -- Update user credits
  IF credits_to_add != 0 THEN
    success := public.update_user_credits(
      user_uuid, 
      credits_to_add, 
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
      target_credits, 
      'activity', 
      activity_type || '_target',
      reference_thought_id
    );
  END IF;

  RETURN success;
END;
$$;

-- Trigger function for voice responses
CREATE OR REPLACE FUNCTION public.handle_voice_response_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Deduct credits for posting voice response
  IF NOT public.allocate_activity_credits(NEW.user_id, 'post_voice', NULL, NEW.thought_id) THEN
    RAISE EXCEPTION 'Insufficient credits to post voice response';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for thoughts
CREATE OR REPLACE FUNCTION public.handle_thought_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Deduct credits for posting thought
  IF NEW.user_id IS NOT NULL THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'post_thought', NULL, NEW.id) THEN
      RAISE EXCEPTION 'Insufficient credits to post thought';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for votes
CREATE OR REPLACE FUNCTION public.handle_vote_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- Create triggers
DROP TRIGGER IF EXISTS voice_response_credits_trigger ON public.voice_responses;
CREATE TRIGGER voice_response_credits_trigger
  BEFORE INSERT ON public.voice_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_voice_response_credits();

DROP TRIGGER IF EXISTS thought_credits_trigger ON public.thoughts;
CREATE TRIGGER thought_credits_trigger
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW EXECUTE FUNCTION public.handle_thought_credits();

DROP TRIGGER IF EXISTS vote_credits_trigger ON public.user_votes;
CREATE TRIGGER vote_credits_trigger
  BEFORE INSERT ON public.user_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_vote_credits();

-- Function to check if user has already replied to a thought
CREATE OR REPLACE FUNCTION public.user_has_replied_to_thought(user_uuid uuid, thought_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.voice_responses 
    WHERE user_id = user_uuid AND thought_id = thought_uuid
  );
$$;