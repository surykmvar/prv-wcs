-- Add missing database triggers for business logic enforcement

-- Trigger for handling thought credits before insertion
CREATE TRIGGER before_insert_thought_credits
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_thought_credits();

-- Trigger for enforcing trending thought woices limit before insertion  
CREATE TRIGGER before_insert_trending_thought_limit
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_trending_thought_woices_limit();

-- Trigger for handling voice response credits before insertion
CREATE TRIGGER before_insert_voice_response_credits
  BEFORE INSERT ON public.voice_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_voice_response_credits();

-- Trigger for checking trending thought reply limit before insertion
CREATE TRIGGER before_insert_voice_response_limit
  BEFORE INSERT ON public.voice_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trending_thought_reply_limit();

-- Trigger for handling vote credits after insertion
CREATE TRIGGER after_insert_vote_credits
  AFTER INSERT ON public.user_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_credits();

-- Trigger for updating vote counts after insert/update/delete
CREATE TRIGGER after_insert_update_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_counts();

-- Trigger for setting sales inquiry user ID before insertion
CREATE TRIGGER before_insert_sales_inquiry_user_id
  BEFORE INSERT ON public.sales_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sales_inquiry_user_id();

-- Make avatars bucket private for security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';