-- Fix security warnings by adding search_path to functions

-- Fix function 1: check_sales_inquiry_rate_limit
CREATE OR REPLACE FUNCTION public.check_sales_inquiry_rate_limit(
  p_user_id UUID,
  p_email TEXT,
  p_max_per_hour INTEGER DEFAULT 3
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  -- Count submissions in the last hour from this user or email
  SELECT COUNT(*) INTO submission_count
  FROM public.sales_inquiries
  WHERE (p_user_id IS NOT NULL AND p_user_id = auth.uid()) 
    OR email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return false if limit exceeded
  IF submission_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Fix function 2: cleanup_old_sales_inquiries
CREATE OR REPLACE FUNCTION public.cleanup_old_sales_inquiries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete inquiries older than 2 years for privacy compliance
  DELETE FROM public.sales_inquiries 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;