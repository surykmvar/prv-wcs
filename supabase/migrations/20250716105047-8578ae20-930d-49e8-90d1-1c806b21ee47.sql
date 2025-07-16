-- Create trigger to automatically update vote counts when user_votes table changes
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_counts();