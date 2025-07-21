-- First drop all existing policies and recreate them to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can create votes" ON public.user_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.user_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.user_votes;
DROP POLICY IF EXISTS "Anyone can create votes" ON public.user_votes;

-- Allow anyone to create votes (both authenticated and anonymous users)
CREATE POLICY "Anyone can create votes" 
ON public.user_votes 
FOR INSERT 
WITH CHECK (true);

-- Allow users to delete their own votes (both authenticated and anonymous)
CREATE POLICY "Users can delete their own votes" 
ON public.user_votes 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
);

-- Allow users to update their own votes (both authenticated and anonymous)
CREATE POLICY "Users can update their own votes" 
ON public.user_votes 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_session IS NOT NULL)
);