-- Create trending topics cache table
CREATE TABLE public.trending_topics_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  google_trends_keyword text NOT NULL,
  region text DEFAULT 'US',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.trending_topics_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view active trending topics
CREATE POLICY "Anyone can view active trending topics" 
ON public.trending_topics_cache 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Create policy for Edge Functions to manage trending topics
CREATE POLICY "Edge functions can manage trending topics" 
ON public.trending_topics_cache 
FOR ALL 
USING (true);

-- Create function to enforce max woices limit when materializing trending thoughts
CREATE OR REPLACE FUNCTION public.enforce_trending_thought_woices_limit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;