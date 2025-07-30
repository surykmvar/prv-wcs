-- Add user_id to thoughts table to link thoughts to users
ALTER TABLE public.thoughts 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to voice_responses table to link voice responses to users  
ALTER TABLE public.voice_responses
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for thoughts to support user-specific access
DROP POLICY IF EXISTS "Anyone can view active thoughts" ON public.thoughts;

CREATE POLICY "Anyone can view active thoughts" 
ON public.thoughts 
FOR SELECT 
USING (status = 'active'::text);

CREATE POLICY "Users can view their own thoughts" 
ON public.thoughts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update RLS policies for voice_responses to support user-specific access
CREATE POLICY "Users can view their own voice responses" 
ON public.voice_responses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to get user's thoughts
CREATE OR REPLACE FUNCTION public.get_user_thoughts(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT,
  final_status TEXT,
  max_woices_allowed INTEGER,
  voice_response_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    t.final_status,
    t.max_woices_allowed,
    COUNT(vr.id) as voice_response_count
  FROM public.thoughts t
  LEFT JOIN public.voice_responses vr ON t.id = vr.thought_id
  WHERE t.user_id = user_uuid
  GROUP BY t.id, t.title, t.description, t.tags, t.created_at, t.expires_at, t.status, t.final_status, t.max_woices_allowed
  ORDER BY t.created_at DESC;
$$;

-- Create function to get user's voice responses
CREATE OR REPLACE FUNCTION public.get_user_voice_responses(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  thought_id UUID,
  thought_title TEXT,
  created_at TIMESTAMPTZ,
  duration INTEGER,
  audio_url TEXT,
  transcript TEXT,
  classification TEXT,
  myth_votes INTEGER,
  fact_votes INTEGER,
  unclear_votes INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    vr.id,
    vr.thought_id,
    t.title as thought_title,
    vr.created_at,
    vr.duration,
    vr.audio_url,
    vr.transcript,
    vr.classification,
    vr.myth_votes,
    vr.fact_votes,
    vr.unclear_votes
  FROM public.voice_responses vr
  JOIN public.thoughts t ON vr.thought_id = t.id
  WHERE vr.user_id = user_uuid
  ORDER BY vr.created_at DESC;
$$;