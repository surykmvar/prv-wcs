-- Ensure voice_responses broadcasts complete rows for realtime updates
ALTER TABLE public.voice_responses REPLICA IDENTITY FULL;

-- Add to realtime publication (idempotent: will error if already added, so use DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'voice_responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_responses;
  END IF;
END $$;

-- Create partial unique indexes to enforce one vote per user per voice
DO $$
BEGIN
  -- Authenticated users: unique on (voice_response_id, user_id) when user_id is not null
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'uniq_user_votes_auth'
      AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX uniq_user_votes_auth
      ON public.user_votes (voice_response_id, user_id)
      WHERE user_id IS NOT NULL;
  END IF;

  -- Anonymous users: unique on (voice_response_id, user_session) when user_id is null
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'uniq_user_votes_anon'
      AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX uniq_user_votes_anon
      ON public.user_votes (voice_response_id, user_session)
      WHERE user_id IS NULL;
  END IF;
END $$;

-- Create trigger to keep voice_responses vote counts in sync
DO $$
BEGIN
  -- After INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_votes_aiuad_update_counts_insert'
  ) THEN
    CREATE TRIGGER trg_user_votes_aiuad_update_counts_insert
    AFTER INSERT ON public.user_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vote_counts();
  END IF;

  -- After UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_votes_aiuad_update_counts_update'
  ) THEN
    CREATE TRIGGER trg_user_votes_aiuad_update_counts_update
    AFTER UPDATE ON public.user_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vote_counts();
  END IF;

  -- After DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_votes_aiuad_update_counts_delete'
  ) THEN
    CREATE TRIGGER trg_user_votes_aiuad_update_counts_delete
    AFTER DELETE ON public.user_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vote_counts();
  END IF;
END $$;

-- Allow owners to update/delete their own voice_responses (needed for re-record/delete)
ALTER TABLE public.voice_responses ENABLE ROW LEVEL SECURITY;

-- UPDATE policy (owner only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'voice_responses' AND policyname = 'Users can update their own voice responses'
  ) THEN
    CREATE POLICY "Users can update their own voice responses"
      ON public.voice_responses
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- DELETE policy (owner only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'voice_responses' AND policyname = 'Users can delete their own voice responses'
  ) THEN
    CREATE POLICY "Users can delete their own voice responses"
      ON public.voice_responses
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
