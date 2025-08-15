-- Fix critical thoughts table data exposure and storage security

-- 1. Create secure function for public thoughts feed (excludes sensitive user data)
CREATE OR REPLACE FUNCTION public.get_public_thoughts_for_feed()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  tags text[],
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  status text,
  thought_scope text,
  country_code text,
  city text,
  max_woices_allowed integer,
  voice_response_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    t.thought_scope,
    t.country_code,
    t.city,
    t.max_woices_allowed,
    COUNT(vr.id) as voice_response_count
  FROM public.thoughts t
  LEFT JOIN public.voice_responses vr ON t.id = vr.thought_id
  WHERE t.status = 'active'
  GROUP BY t.id, t.title, t.description, t.tags, t.created_at, t.expires_at, t.status, t.thought_scope, t.country_code, t.city, t.max_woices_allowed
  ORDER BY t.created_at DESC;
$$;

-- 2. Remove the overly permissive thoughts policy that exposes user data
DROP POLICY IF EXISTS "Anyone can view active thoughts" ON public.thoughts;

-- 3. Create more restrictive policies for thoughts
CREATE POLICY "Users can view own thoughts with full data" 
ON public.thoughts 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Secure voice recordings storage bucket access
CREATE POLICY "Users can only access their own voice recordings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'voice-recordings' 
  AND (
    -- Allow access to own recordings (user ID in path)
    auth.uid()::text = (storage.foldername(name))[1]
    OR 
    -- Allow access to public recordings (no user folder structure)
    NOT (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
  )
);

CREATE POLICY "Users can upload their own voice recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice recordings"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);