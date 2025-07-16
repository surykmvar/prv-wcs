-- Drop the existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON public.user_votes;

-- Create the trigger to automatically update vote counts
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_counts();