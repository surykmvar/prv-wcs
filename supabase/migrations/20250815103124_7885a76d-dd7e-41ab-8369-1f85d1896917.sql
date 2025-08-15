-- Fix profiles security with a safer approach using security definer function

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.profile_display;

-- 2. Create a security definer function to get safe profile display info
CREATE OR REPLACE FUNCTION public.get_profile_display_info(user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  display_name text,
  first_name text,
  last_name text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.first_name,
    p.last_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;