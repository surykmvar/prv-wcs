-- Update the vote count trigger to handle both authenticated and anonymous users
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_voice_response_votes ON public.user_votes;
CREATE TRIGGER update_voice_response_votes
AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_vote_counts();

-- Update RLS policies for user_votes to allow both authenticated and anonymous users
DROP POLICY IF EXISTS "Anonymous users can create votes" ON public.user_votes;
DROP POLICY IF EXISTS "Anonymous users can delete votes" ON public.user_votes;
DROP POLICY IF EXISTS "Anonymous users can update votes" ON public.user_votes;

-- Allow anonymous users to create votes (for user_session based voting)
CREATE POLICY "Anyone can create votes" 
ON public.user_votes 
FOR INSERT 
WITH CHECK (true);

-- Allow users to delete their own votes (both authenticated and anonymous)
CREATE POLICY "Users can delete their own votes" 
ON public.user_votes 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
);

-- Allow users to update their own votes (both authenticated and anonymous)
CREATE POLICY "Users can update their own votes" 
ON public.user_votes 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
);