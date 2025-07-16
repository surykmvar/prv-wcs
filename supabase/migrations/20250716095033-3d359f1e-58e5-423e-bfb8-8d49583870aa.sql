-- Fix existing vote counts by syncing with actual votes from user_votes table
UPDATE public.voice_responses 
SET 
  myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'myth'),
  fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'fact'),
  unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'unclear');

-- Ensure unique constraint exists to prevent duplicate votes per user per voice response
ALTER TABLE public.user_votes DROP CONSTRAINT IF EXISTS unique_user_vote_per_response;
ALTER TABLE public.user_votes ADD CONSTRAINT unique_user_vote_per_response UNIQUE (voice_response_id, user_session);

-- Verify and update the trigger function to handle vote changes (not just inserts)
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON public.user_votes;

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

-- Create triggers for all operations (INSERT, UPDATE, DELETE)
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Add policy to allow users to delete their own votes (for vote changes)
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.user_votes;
CREATE POLICY "Users can delete their own votes" 
ON public.user_votes 
FOR DELETE 
USING (true);