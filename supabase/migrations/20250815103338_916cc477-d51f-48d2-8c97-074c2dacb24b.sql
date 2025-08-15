-- Comprehensive security fix for voice responses and voting data

-- 1. Remove overly permissive policies
DROP POLICY IF EXISTS "Users can view voice responses for active thoughts or own responses" ON public.voice_responses;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.user_votes;

-- 2. Create a secure function for public feed that only exposes necessary data
CREATE OR REPLACE FUNCTION public.get_public_voice_responses_for_feed()
RETURNS TABLE(
  id uuid,
  thought_id uuid,
  audio_url text,
  duration integer,
  transcript text,
  classification text,
  created_at timestamp with time zone,
  myth_votes integer,
  fact_votes integer,
  unclear_votes integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT 
    vr.id,
    vr.thought_id,
    vr.audio_url,
    vr.duration,
    vr.transcript,
    vr.classification,
    vr.created_at,
    vr.myth_votes,
    vr.fact_votes,
    vr.unclear_votes
  FROM public.voice_responses vr
  JOIN public.thoughts t ON vr.thought_id = t.id
  WHERE t.status = 'active';
$$;

-- 3. Create secure policy for voice responses - only owners can see full data
CREATE POLICY "Users can view their own voice responses" 
ON public.voice_responses 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Create secure policy for thought authors to see responses to their thoughts
CREATE POLICY "Thought authors can view responses to their thoughts" 
ON public.voice_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.thoughts 
    WHERE thoughts.id = voice_responses.thought_id 
    AND thoughts.user_id = auth.uid()
  )
);

-- 5. Secure voting data - users can only see their own votes
CREATE POLICY "Users can view their own votes" 
ON public.user_votes 
FOR SELECT 
USING (auth.uid() = user_id OR user_session = auth.jwt()->>'session_id');

-- 6. Create function to get user's vote for a specific voice response (for UI state)
CREATE OR REPLACE FUNCTION public.get_user_vote_for_voice_response(voice_response_id_param uuid)
RETURNS TABLE(vote_type text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT uv.vote_type
  FROM public.user_votes uv
  WHERE uv.voice_response_id = voice_response_id_param 
  AND (uv.user_id = auth.uid() OR uv.user_session = auth.jwt()->>'session_id')
  LIMIT 1;
$$;