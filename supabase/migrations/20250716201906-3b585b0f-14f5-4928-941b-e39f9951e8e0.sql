-- Remove unused reaction functionality (safe version)
-- Drop the reaction counts trigger and function if they exist
DROP TRIGGER IF EXISTS update_reaction_counts_trigger ON public.user_reactions;
DROP FUNCTION IF EXISTS public.update_reaction_counts();

-- Drop user_reactions table if it exists
DROP TABLE IF EXISTS public.user_reactions;

-- Remove reactions column from voice_responses table if it exists
ALTER TABLE public.voice_responses DROP COLUMN IF EXISTS reactions;