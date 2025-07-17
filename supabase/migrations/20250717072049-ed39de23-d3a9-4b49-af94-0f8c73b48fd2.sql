-- Step 1: Clean up old unauthenticated votes
DELETE FROM public.user_votes WHERE user_id IS NULL;

-- Step 2: Reset all vote counts to 0
UPDATE public.voice_responses 
SET myth_votes = 0, fact_votes = 0, unclear_votes = 0;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_vote_counts ON public.user_votes;

-- Step 4: Recreate the trigger function to ensure it's working properly
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$;

-- Step 5: Recreate the trigger
CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Step 6: Add constraint to ensure only authenticated users can vote
ALTER TABLE public.user_votes 
ADD CONSTRAINT user_votes_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- Step 7: Recalculate all vote counts based on existing authenticated user votes
UPDATE public.voice_responses 
SET 
  myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'myth'),
  fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'fact'),
  unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'unclear');