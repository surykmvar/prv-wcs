-- SECURITY FIX: Remove the public_app_settings view entirely
-- Since it's not used in the application code and creates a security risk, 
-- we'll remove it completely

DROP VIEW IF EXISTS public.public_app_settings;

-- If public access to certain app settings is needed in the future,
-- it should be implemented through a controlled API endpoint rather than a database view
-- This eliminates the security definer view risk entirely