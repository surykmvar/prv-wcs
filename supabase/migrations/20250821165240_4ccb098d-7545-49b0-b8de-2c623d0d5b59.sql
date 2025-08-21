-- Allow the app to read active thoughts for public viewing
-- Adds a safe SELECT policy limited to active, non-expired thoughts
CREATE POLICY IF NOT EXISTS "Anyone can view active thoughts"
ON public.thoughts
FOR SELECT
USING (status = 'active' AND expires_at > now());