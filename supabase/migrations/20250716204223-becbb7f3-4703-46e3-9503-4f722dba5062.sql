-- Update user_votes table to require authentication
-- Add user_id column to link votes to authenticated users
ALTER TABLE public.user_votes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a unique constraint to prevent duplicate votes per user per voice response
ALTER TABLE public.user_votes 
ADD CONSTRAINT user_votes_user_voice_unique UNIQUE (user_id, voice_response_id);

-- Drop the old user_session constraint if it exists
ALTER TABLE public.user_votes 
DROP CONSTRAINT IF EXISTS user_votes_voice_response_id_user_session_key;

-- Update RLS policies to require authentication
DROP POLICY IF EXISTS "Anyone can create votes" ON public.user_votes;
DROP POLICY IF EXISTS "Anyone can update their votes" ON public.user_votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.user_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.user_votes;

-- Create new RLS policies for authenticated users only
CREATE POLICY "Authenticated users can create votes"
ON public.user_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.user_votes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes"
ON public.user_votes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can delete their own votes"
ON public.user_votes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update the vote counts trigger to work with the new schema
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

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON public.user_votes;
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_counts();

-- Enable realtime for user_votes table
ALTER TABLE public.user_votes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_votes;