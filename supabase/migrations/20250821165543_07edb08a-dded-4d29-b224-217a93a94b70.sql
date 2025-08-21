-- Create policy to allow reading active thoughts (for mixed feed)
CREATE POLICY "Anyone can view active thoughts" ON public.thoughts
FOR SELECT 
USING (status = 'active' AND expires_at > now());