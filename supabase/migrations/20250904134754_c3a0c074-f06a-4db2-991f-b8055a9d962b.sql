-- Add missing database triggers that don't already exist

-- Check and create triggers that might be missing
DO $$
BEGIN
  -- Check for missing triggers and create them
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'before_insert_trending_thought_limit') THEN
    CREATE TRIGGER before_insert_trending_thought_limit
      BEFORE INSERT ON public.thoughts
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_trending_thought_woices_limit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'before_insert_voice_response_limit') THEN
    CREATE TRIGGER before_insert_voice_response_limit
      BEFORE INSERT ON public.voice_responses
      FOR EACH ROW
      EXECUTE FUNCTION public.check_trending_thought_reply_limit();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'after_insert_vote_credits') THEN
    CREATE TRIGGER after_insert_vote_credits
      AFTER INSERT ON public.user_votes
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_vote_credits();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'after_insert_update_vote_counts') THEN
    CREATE TRIGGER after_insert_update_vote_counts
      AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_vote_counts();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'before_insert_sales_inquiry_user_id') THEN
    CREATE TRIGGER before_insert_sales_inquiry_user_id
      BEFORE INSERT ON public.sales_inquiries
      FOR EACH ROW
      EXECUTE FUNCTION public.set_sales_inquiry_user_id();
  END IF;
END $$;

-- Make avatars bucket private for security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';