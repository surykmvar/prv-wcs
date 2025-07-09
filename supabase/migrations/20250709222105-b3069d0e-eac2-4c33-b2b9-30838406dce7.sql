-- Add user_session column to voice_responses table
ALTER TABLE public.voice_responses 
ADD COLUMN user_session TEXT NOT NULL DEFAULT '';

-- Update the column to not have a default after adding it
ALTER TABLE public.voice_responses 
ALTER COLUMN user_session DROP DEFAULT;