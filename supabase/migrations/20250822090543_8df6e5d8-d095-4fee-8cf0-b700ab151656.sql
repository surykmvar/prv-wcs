-- Fix the trigger function to use schema-qualified table names and security definer
CREATE OR REPLACE FUNCTION public.check_trending_thought_reply_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Re-create the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS check_trending_thought_reply_limit_trigger ON public.voice_responses;

CREATE TRIGGER check_trending_thought_reply_limit_trigger
  BEFORE INSERT ON public.voice_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trending_thought_reply_limit();