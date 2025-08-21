-- Fix security warning: Set search_path for the function
CREATE OR REPLACE FUNCTION public.enforce_trending_thought_woices_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- When inserting a new thought from trending topics cache, set max_woices_allowed to 10
  IF NEW.title IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.trending_topics_cache 
    WHERE title = NEW.title AND is_active = true
  ) THEN
    NEW.max_woices_allowed := 10;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the woices limit on thoughts table
CREATE TRIGGER enforce_trending_thought_woices_limit_trigger
  BEFORE INSERT ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_trending_thought_woices_limit();