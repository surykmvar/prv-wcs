-- First, update any empty or null user_session values to be unique
UPDATE public.voice_responses 
SET user_session = 'legacy_' || id::text
WHERE user_session IS NULL OR user_session = '';

-- Now add the constraint to prevent multiple woices from same user for same thought
ALTER TABLE public.voice_responses 
ADD CONSTRAINT unique_user_session_per_thought 
UNIQUE(user_session, thought_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_responses_user_session_thought_id 
ON public.voice_responses(user_session, thought_id);