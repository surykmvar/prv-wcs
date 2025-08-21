-- Create trigger to enforce 10-reply limit on trending thoughts
CREATE OR REPLACE FUNCTION check_trending_thought_reply_limit()
RETURNS TRIGGER AS $$
DECLARE
  reply_count INTEGER;
  thought_max_allowed INTEGER;
BEGIN
  -- Get the max_woices_allowed for this thought
  SELECT max_woices_allowed 
  INTO thought_max_allowed
  FROM thoughts 
  WHERE id = NEW.thought_id;
  
  -- If no limit is set, allow the reply
  IF thought_max_allowed IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count existing replies for this thought
  SELECT COUNT(*)
  INTO reply_count
  FROM voice_responses
  WHERE thought_id = NEW.thought_id;
  
  -- Check if adding this reply would exceed the limit
  IF reply_count >= thought_max_allowed THEN
    RAISE EXCEPTION 'This thought has reached its maximum of % replies', thought_max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_trending_thought_reply_limit ON voice_responses;
CREATE TRIGGER enforce_trending_thought_reply_limit
  BEFORE INSERT ON voice_responses
  FOR EACH ROW
  EXECUTE FUNCTION check_trending_thought_reply_limit();