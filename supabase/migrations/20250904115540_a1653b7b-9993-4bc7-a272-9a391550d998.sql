-- SECURITY FIX: Address Security Definer View issue
-- The issue is that views owned by postgres are considered security definer
-- Let's drop and recreate the view to ensure it doesn't have security definer properties

-- Drop the existing view
DROP VIEW IF EXISTS public.public_app_settings;

-- Recreate the view without any security definer properties
-- This view provides access to only non-sensitive app settings
CREATE VIEW public.public_app_settings AS
SELECT 
    key,
    value,
    description
FROM public.app_settings
WHERE key = ANY(ARRAY['maintenance_mode', 'app_version', 'terms_version']);

-- Grant specific permissions to roles
GRANT SELECT ON public.public_app_settings TO anon;
GRANT SELECT ON public.public_app_settings TO authenticated;

-- Add a comment to clarify the purpose
COMMENT ON VIEW public.public_app_settings IS 'Public view for non-sensitive application settings that can be accessed by all users';