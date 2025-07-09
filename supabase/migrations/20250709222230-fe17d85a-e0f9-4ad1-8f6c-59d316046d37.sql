-- Add user_session column to voice_responses table for tracking one woice per user per thought
ALTER TABLE public.voice_responses 
ADD COLUMN user_session TEXT;

-- Add index for better query performance
CREATE INDEX idx_voice_responses_user_session_thought_id 
ON public.voice_responses(user_session, thought_id);

-- Add constraint to prevent multiple woices from same user for same thought
ALTER TABLE public.voice_responses 
ADD CONSTRAINT unique_user_session_per_thought 
UNIQUE(user_session, thought_id);