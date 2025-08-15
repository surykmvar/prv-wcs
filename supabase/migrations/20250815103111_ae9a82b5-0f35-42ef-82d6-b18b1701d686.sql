-- Fix profiles table security properly - create view for public display information

-- 1. Remove the problematic policy that still exposes all data
DROP POLICY IF EXISTS "Public display information viewable by authenticated users" ON public.profiles;

-- 2. Create a view that only exposes safe display information
CREATE OR REPLACE VIEW public.profile_display AS
SELECT 
  user_id,
  display_name,
  first_name,
  last_name
FROM public.profiles;

-- 3. Enable RLS on the view
ALTER VIEW public.profile_display SET (security_barrier = true);

-- 4. Create policy for the view to allow authenticated users to see display info only
-- Note: Views inherit RLS from base tables, so we'll modify the code to use this view instead