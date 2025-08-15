-- Fix search path security warning
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
SET search_path TO ''
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.first_name,
    p.last_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;