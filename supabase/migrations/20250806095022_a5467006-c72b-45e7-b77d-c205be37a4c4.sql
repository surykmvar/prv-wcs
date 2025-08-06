-- =====================================================
-- COMPLETE DATABASE FIX FOR WOICES APP
-- This script fixes vote counting, constraints, and data integrity
-- =====================================================

-- 1. DROP EXISTING PROBLEMATIC TRIGGERS AND CONSTRAINTS
-- =====================================================
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON public.user_votes;
ALTER TABLE public.voice_responses DROP CONSTRAINT IF EXISTS unique_user_session_per_thought;

-- 2. CREATE/UPDATE VOTE COUNTING FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE cases
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.voice_responses 
        SET 
            myth_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'myth'
            ),
            fact_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'fact'
            ),
            unclear_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = NEW.voice_response_id 
                AND vote_type = 'unclear'
            )
        WHERE id = NEW.voice_response_id;
    END IF;
    
    -- Handle DELETE case
    IF TG_OP = 'DELETE' THEN
        UPDATE public.voice_responses 
        SET 
            myth_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'myth'
            ),
            fact_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'fact'
            ),
            unclear_votes = (
                SELECT COUNT(*) 
                FROM public.user_votes 
                WHERE voice_response_id = OLD.voice_response_id 
                AND vote_type = 'unclear'
            )
        WHERE id = OLD.voice_response_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. CREATE NEW VOTE COUNTING TRIGGER
-- =====================================================
CREATE TRIGGER update_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- 4. ADD PROPER CONSTRAINTS FOR ONE VOICE RESPONSE PER USER PER THOUGHT
-- =====================================================
-- For authenticated users (user_id is not null)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_voice_response_user_thought
ON public.voice_responses (user_id, thought_id)
WHERE user_id IS NOT NULL;

-- For anonymous users (user_session is not null and user_id is null)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_voice_response_session_thought
ON public.voice_responses (user_session, thought_id)
WHERE user_id IS NULL AND user_session IS NOT NULL;

-- 5. ADD CONSTRAINT FOR ONE VOTE PER USER PER VOICE RESPONSE
-- =====================================================
-- For authenticated users
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_vote_user_voice
ON public.user_votes (user_id, voice_response_id)
WHERE user_id IS NOT NULL;

-- For anonymous users
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_vote_session_voice
ON public.user_votes (user_session, voice_response_id)
WHERE user_id IS NULL AND user_session IS NOT NULL;

-- 6. FIX ALL EXISTING VOTE COUNTS
-- =====================================================
UPDATE public.voice_responses 
SET 
    myth_votes = COALESCE((
        SELECT COUNT(*) 
        FROM public.user_votes 
        WHERE voice_response_id = voice_responses.id 
        AND vote_type = 'myth'
    ), 0),
    fact_votes = COALESCE((
        SELECT COUNT(*) 
        FROM public.user_votes 
        WHERE voice_response_id = voice_responses.id 
        AND vote_type = 'fact'
    ), 0),
    unclear_votes = COALESCE((
        SELECT COUNT(*) 
        FROM public.user_votes 
        WHERE voice_response_id = voice_responses.id 
        AND vote_type = 'unclear'
    ), 0);

-- 7. ADD HELPFUL INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_voice_responses_thought_id 
ON public.voice_responses (thought_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_voice_responses_user_id 
ON public.voice_responses (user_id) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_votes_voice_response_id 
ON public.user_votes (voice_response_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_votes_user_id 
ON public.user_votes (user_id) WHERE user_id IS NOT NULL;