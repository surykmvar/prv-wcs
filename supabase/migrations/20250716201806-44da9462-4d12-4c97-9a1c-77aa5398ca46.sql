-- Remove unused reaction functionality
-- Drop user_reactions table
DROP TABLE IF EXISTS public.user_reactions;

-- Remove reactions column from voice_responses table
ALTER TABLE public.voice_responses DROP COLUMN IF EXISTS reactions;

-- Remove the reaction counts trigger and function
DROP TRIGGER IF EXISTS update_reaction_counts_trigger ON public.user_reactions;
DROP FUNCTION IF EXISTS public.update_reaction_counts();