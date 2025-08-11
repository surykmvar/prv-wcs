-- Ensure vote count columns exist on voice_responses
ALTER TABLE public.voice_responses
  ADD COLUMN IF NOT EXISTS myth_votes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fact_votes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unclear_votes integer NOT NULL DEFAULT 0;

-- Create user_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  voice_response_id uuid NOT NULL REFERENCES public.voice_responses(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('myth','fact','unclear')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, voice_response_id)
);

-- Enable RLS on user_votes
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_votes' AND policyname='Users can select their own votes'
  ) THEN
    CREATE POLICY "Users can select their own votes"
    ON public.user_votes
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_votes' AND policyname='Users can insert their own votes'
  ) THEN
    CREATE POLICY "Users can insert their own votes"
    ON public.user_votes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_votes' AND policyname='Users can update their own votes'
  ) THEN
    CREATE POLICY "Users can update their own votes"
    ON public.user_votes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_votes' AND policyname='Users can delete their own votes'
  ) THEN
    CREATE POLICY "Users can delete their own votes"
    ON public.user_votes
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger to keep vote counts in sync (only if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='user_votes' AND t.tgname='trg_user_votes_update_counts'
  ) THEN
    CREATE TRIGGER trg_user_votes_update_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_votes_voice_response_id ON public.user_votes(voice_response_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON public.user_votes(user_id);

-- Backfill vote counts for existing voice responses
UPDATE public.voice_responses vr
SET 
  myth_votes = COALESCE((SELECT COUNT(*) FROM public.user_votes uv WHERE uv.voice_response_id = vr.id AND uv.vote_type='myth'),0),
  fact_votes = COALESCE((SELECT COUNT(*) FROM public.user_votes uv WHERE uv.voice_response_id = vr.id AND uv.vote_type='fact'),0),
  unclear_votes = COALESCE((SELECT COUNT(*) FROM public.user_votes uv WHERE uv.voice_response_id = vr.id AND uv.vote_type='unclear'),0);
