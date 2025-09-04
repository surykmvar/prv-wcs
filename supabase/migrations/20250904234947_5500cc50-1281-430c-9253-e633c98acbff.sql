-- Fix security linter warnings for function search paths
-- Update functions to have proper search_path set

-- Fix validate_email_format function
CREATE OR REPLACE FUNCTION public.validate_email_format(email TEXT)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Basic email validation regex
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Fix sanitize_html_input function
CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove potentially dangerous HTML tags and scripts
  -- This is a basic sanitization - for production, consider using a more robust solution
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi'),
      '<[^>]*>', '', 'g'
    ),
    '&[^;]+;', '', 'g'
  );
END;
$$;