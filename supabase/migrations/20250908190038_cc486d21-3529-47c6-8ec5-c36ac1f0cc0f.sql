-- Fix profiles table security vulnerability
-- Revoke public access to the security definer function that bypasses RLS
REVOKE ALL ON FUNCTION public.get_profile_display_info(uuid[]) FROM PUBLIC;

-- Grant access only to authenticated users for legitimate use cases
GRANT EXECUTE ON FUNCTION public.get_profile_display_info(uuid[]) TO authenticated;

-- Add additional protection: modify the function to only return data for users that the current user should see
CREATE OR REPLACE FUNCTION public.get_profile_display_info(user_ids uuid[])
 RETURNS TABLE(user_id uuid, display_name text, first_name text, last_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    p.user_id,
    p.display_name,
    p.first_name,
    p.last_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids)
  AND (
    -- User can see their own profile
    p.user_id = auth.uid() 
    -- OR user is an admin who can see all profiles
    OR public.has_role(auth.uid(), 'admin'::app_role)
    -- OR this is for public display purposes (like voice response authors)
    -- We can add additional conditions here if needed for legitimate use cases
  );
$function$;

-- Ensure RLS policies are comprehensive for direct table access
-- The existing policies already cover this, but let's add a catch-all deny policy for safety
CREATE POLICY "Block all other profile access" ON public.profiles
FOR ALL
TO PUBLIC
USING (false);

-- This policy should be the lowest priority (last to be evaluated)
-- The existing allow policies will take precedence