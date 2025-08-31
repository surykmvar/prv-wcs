-- Phase 1: Critical Security Fixes (Fixed version)

-- 1. Fix storage security - make voice-recordings bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'voice-recordings';

-- Add RLS policies for voice recordings storage
DROP POLICY IF EXISTS "Authenticated users can upload voice recordings" ON storage.objects;
CREATE POLICY "Authenticated users can upload voice recordings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'voice-recordings' 
  AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Users can read their own voice recordings" ON storage.objects;
CREATE POLICY "Users can read their own voice recordings" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admins can manage all voice recordings" ON storage.objects;
CREATE POLICY "Admins can manage all voice recordings" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'voice-recordings' 
  AND has_role(auth.uid(), 'admin')
);

-- 2. Fix RLS policies for core tables

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can create thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Anyone can create votes" ON public.user_votes;
DROP POLICY IF EXISTS "Edge functions can manage trending topics" ON public.trending_topics_cache;

-- Secure thoughts table
DROP POLICY IF EXISTS "Authenticated users can create their own thoughts" ON public.thoughts;
CREATE POLICY "Authenticated users can create their own thoughts" 
ON public.thoughts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Secure voice_responses table - update existing policy
DROP POLICY IF EXISTS "Users can create voice responses for active thoughts" ON public.voice_responses;
DROP POLICY IF EXISTS "Authenticated users can create voice responses for active thoughts" ON public.voice_responses;
CREATE POLICY "Authenticated users can create voice responses for active thoughts" 
ON public.voice_responses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.thoughts 
    WHERE id = voice_responses.thought_id 
    AND status = 'active'
  )
);

-- Secure user_votes table
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.user_votes;
CREATE POLICY "Authenticated users can vote" 
ON public.user_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update their own votes" ON public.user_votes;
CREATE POLICY "Authenticated users can update their own votes" 
ON public.user_votes 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete their own votes" ON public.user_votes;
CREATE POLICY "Authenticated users can delete their own votes" 
ON public.user_votes 
FOR DELETE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Remove anonymous access policies from user_votes
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.user_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.user_votes;

-- Secure trending_topics_cache
DROP POLICY IF EXISTS "Service role and admins can manage trending topics" ON public.trending_topics_cache;
CREATE POLICY "Service role and admins can manage trending topics" 
ON public.trending_topics_cache 
FOR ALL 
USING (
  auth.role() = 'service_role' 
  OR has_role(auth.uid(), 'admin')
);

-- 4. Fix sales inquiry rate limiting
-- Add user_id column if it doesn't exist
ALTER TABLE public.sales_inquiries 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create trigger to set user_id automatically
DROP TRIGGER IF EXISTS set_sales_inquiry_user_id_trigger ON public.sales_inquiries;
CREATE OR REPLACE FUNCTION public.set_sales_inquiry_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_sales_inquiry_user_id_trigger
  BEFORE INSERT ON public.sales_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sales_inquiry_user_id();

-- Update rate limiting function to fix the bug
CREATE OR REPLACE FUNCTION public.check_sales_inquiry_rate_limit(
  p_user_id UUID,
  p_email TEXT,
  p_max_per_hour INTEGER DEFAULT 3
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  -- Count submissions in the last hour from this user or email
  SELECT COUNT(*) INTO submission_count
  FROM public.sales_inquiries
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) 
    OR email = p_email
  )
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return false if limit exceeded
  IF submission_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update sales inquiry policy to use fixed rate limiting
DROP POLICY IF EXISTS "Secure sales inquiry submissions" ON public.sales_inquiries;
CREATE POLICY "Secure sales inquiry submissions" 
ON public.sales_inquiries 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND check_sales_inquiry_rate_limit(auth.uid(), email, 3)
  AND length(name) >= 2 
  AND length(email) >= 5 
  AND length(message) >= 10 
  AND length(message) <= 5000
);