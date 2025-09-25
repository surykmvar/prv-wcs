-- Add woices_home column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='woices_home') THEN
        ALTER TABLE public.profiles ADD COLUMN woices_home TEXT;
    END IF;
END $$;

-- Create unique index to enforce uniqueness (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_woices_home ON public.profiles (lower(trim(woices_home))) WHERE woices_home IS NOT NULL;

-- Create function to validate woices home format
CREATE OR REPLACE FUNCTION public.validate_woices_home(home_name text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check if it's null or empty
  IF home_name IS NULL OR trim(home_name) = '' THEN
    RETURN false;
  END IF;
  
  -- Check length (3-30 characters)
  IF length(trim(home_name)) < 3 OR length(trim(home_name)) > 30 THEN
    RETURN false;
  END IF;
  
  -- Check format: letters, numbers, hyphens only
  IF NOT trim(home_name) ~ '^[a-zA-Z0-9-]+$' THEN
    RETURN false;
  END IF;
  
  -- Cannot start or end with hyphen
  IF trim(home_name) ~ '^-|-$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to check woices home uniqueness
CREATE OR REPLACE FUNCTION public.check_woices_home_uniqueness(user_uuid uuid, home_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Check if another user already has this woices home
  SELECT COUNT(*) INTO existing_count
  FROM public.profiles 
  WHERE lower(trim(woices_home)) = lower(trim(home_name))
    AND user_id != user_uuid;
    
  RETURN existing_count = 0;
END;
$$;