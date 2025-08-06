-- Create saved_thoughts table for bookmarking functionality
CREATE TABLE IF NOT EXISTS public.saved_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);

-- Enable RLS
ALTER TABLE public.saved_thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_thoughts
CREATE POLICY "Users can view their own saved thoughts" 
ON public.saved_thoughts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save thoughts" 
ON public.saved_thoughts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved thoughts" 
ON public.saved_thoughts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to get user's saved thoughts
CREATE OR REPLACE FUNCTION public.get_user_saved_thoughts(user_uuid uuid)
RETURNS TABLE(
  id uuid, 
  title text, 
  description text, 
  tags text[], 
  created_at timestamp with time zone, 
  expires_at timestamp with time zone,
  status text,
  saved_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    st.created_at as saved_at
  FROM public.thoughts t
  JOIN public.saved_thoughts st ON t.id = st.thought_id
  WHERE st.user_id = user_uuid
  ORDER BY st.created_at DESC;
$$;