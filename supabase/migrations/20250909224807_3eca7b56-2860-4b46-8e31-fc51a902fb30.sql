-- Fix Security Definer View Issue
-- Remove the problematic view and replace with safer alternatives

-- 1. Drop the security definer view that was flagged
DROP VIEW IF EXISTS public.profiles_public_view;

-- 2. Create a regular view without security definer (safer approach)
CREATE VIEW public.profiles_public_view AS
SELECT 
  user_id,
  display_name,
  created_at
FROM public.profiles
WHERE display_name IS NOT NULL;

-- 3. Apply RLS to the view in the standard way
ALTER VIEW public.profiles_public_view ENABLE ROW LEVEL SECURITY;

-- 4. Create proper RLS policy for the view
CREATE POLICY "Authenticated users can view public profile info"
ON public.profiles_public_view
FOR SELECT
TO authenticated
USING (true);

-- 5. Grant access to authenticated users only
GRANT SELECT ON public.profiles_public_view TO authenticated;
REVOKE SELECT ON public.profiles_public_view FROM anon;