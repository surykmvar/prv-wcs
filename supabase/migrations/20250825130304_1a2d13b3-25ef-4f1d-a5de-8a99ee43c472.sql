-- Update credits system to handle fractional charging for Woice replies
-- Fix the allocate_activity_credits function to properly charge based on number of Woices requested

CREATE OR REPLACE FUNCTION public.allocate_activity_credits(user_uuid uuid, activity_type text, target_user_uuid uuid DEFAULT NULL::uuid, reference_thought_id uuid DEFAULT NULL::uuid, woices_count integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
$function$;

-- Update the thought credits trigger to pass the max_woices_allowed count
CREATE OR REPLACE FUNCTION public.handle_thought_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Deduct credits for posting thought based on max_woices_allowed
  IF NEW.user_id IS NOT NULL THEN
    IF NOT public.allocate_activity_credits(NEW.user_id, 'post_thought', NULL, NEW.id, NEW.max_woices_allowed) THEN
      RAISE EXCEPTION 'Insufficient credits to post thought. You need at least %.2f credits.', (NEW.max_woices_allowed::numeric / 3.0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure user_subscriptions.credits_balance can handle decimal values
ALTER TABLE user_subscriptions ALTER COLUMN credits_balance TYPE numeric(10,2);

-- Update default value for credits_balance to be numeric
ALTER TABLE user_subscriptions ALTER COLUMN credits_balance SET DEFAULT 0.0;