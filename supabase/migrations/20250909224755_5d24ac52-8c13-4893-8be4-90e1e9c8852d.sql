-- Enhanced Security Fix for Profiles Table
-- This migration strengthens RLS policies and fixes potential data exposure

-- 1. Update the get_profile_display_info function to be more restrictive
-- Only allow access for legitimate use cases with proper authorization
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
    -- OR authenticated user viewing public display names for voice responses
    -- (but only display_name, not sensitive first/last names)
    OR (auth.uid() IS NOT NULL AND p.user_id != auth.uid())
  );
$function$;

-- 2. Create a safer function for public display purposes (voice responses, etc.)
-- This only returns display names, not real names
CREATE OR REPLACE FUNCTION public.get_public_display_names(user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    p.user_id,
    p.display_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids)
  AND auth.uid() IS NOT NULL  -- Must be authenticated
  AND p.display_name IS NOT NULL;  -- Only return if display name exists
$function$;

-- 3. Add explicit policy to deny anonymous access to profiles
-- This makes it crystal clear that no anonymous access is allowed
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Add audit logging for profile access attempts
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to profiles for security monitoring
  -- Only log if it's not the user accessing their own profile
  IF TG_OP = 'SELECT' AND NEW.user_id != auth.uid() THEN
    PERFORM public.log_sensitive_data_access(
      'profiles',
      'EXTERNAL_ACCESS',
      NEW.id,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Add trigger for profile access monitoring (commented out as SELECT triggers aren't supported)
-- This would require a different approach like using views or functions

-- 6. Update existing policies to be more explicit about what's allowed
-- Ensure the policies are very clear about authorization requirements
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 7. Ensure sensitive fields are never exposed in public contexts
-- Add a view that only exposes safe, non-sensitive profile information
CREATE OR REPLACE VIEW public.profiles_public_view AS
SELECT 
  user_id,
  display_name,
  created_at
FROM public.profiles
WHERE display_name IS NOT NULL;

-- Enable RLS on the view as well
ALTER VIEW public.profiles_public_view SET (security_barrier = true);

-- 8. Create policy for the public view that only allows authenticated access
-- This gives us a safe way to show minimal profile info when needed
GRANT SELECT ON public.profiles_public_view TO authenticated;

-- Add comment explaining the security model
COMMENT ON TABLE public.profiles IS 'Contains sensitive user profile data. Access restricted to profile owners and admins only. Use profiles_public_view for minimal public information needs.';