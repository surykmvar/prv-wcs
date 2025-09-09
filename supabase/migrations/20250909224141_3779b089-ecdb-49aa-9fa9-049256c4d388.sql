-- Enhanced security for sales_inquiries table
-- Add additional audit logging and access controls

-- Create a more restrictive function for sales inquiry access that logs all access
CREATE OR REPLACE FUNCTION public.can_access_sales_inquiries()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Only allow admin access and log the access attempt
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    -- Log admin access to sales inquiries for audit trail
    PERFORM public.log_sensitive_data_access('sales_inquiries', 'ACCESS_ATTEMPT', NULL, auth.uid());
    RETURN true;
  END IF;
  
  -- Log unauthorized access attempts
  PERFORM public.log_sensitive_data_access('sales_inquiries', 'UNAUTHORIZED_ACCESS_ATTEMPT', NULL, auth.uid());
  RETURN false;
END;
$$;

-- Update RLS policies to use the enhanced access function
DROP POLICY IF EXISTS "Admin view sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admin update sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admin delete sales inquiries" ON public.sales_inquiries;

-- Create more secure policies with enhanced logging
CREATE POLICY "Enhanced admin view sales inquiries" 
ON public.sales_inquiries 
FOR SELECT 
USING (public.can_access_sales_inquiries());

CREATE POLICY "Enhanced admin update sales inquiries" 
ON public.sales_inquiries 
FOR UPDATE 
USING (public.can_access_sales_inquiries())
WITH CHECK (public.can_access_sales_inquiries());

CREATE POLICY "Enhanced admin delete sales inquiries" 
ON public.sales_inquiries 
FOR DELETE 
USING (public.can_access_sales_inquiries());

-- Add rate limiting function to prevent bulk data extraction
CREATE OR REPLACE FUNCTION public.check_sales_inquiry_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  -- Check if admin is accessing too many records in a short time (potential data dump)
  SELECT COUNT(*) INTO recent_access_count
  FROM public.audit_log
  WHERE user_id = auth.uid()
    AND table_name = 'sales_inquiries'
    AND operation = 'ACCESS_ATTEMPT'
    AND timestamp > NOW() - INTERVAL '1 minute';
    
  -- If more than 20 access attempts in 1 minute, block further access
  IF recent_access_count > 20 THEN
    PERFORM public.log_sensitive_data_access('sales_inquiries', 'RATE_LIMIT_EXCEEDED', NULL, auth.uid());
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update the access function to include rate limiting
CREATE OR REPLACE FUNCTION public.can_access_sales_inquiries()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Check rate limiting first
  IF NOT public.check_sales_inquiry_rate_limit() THEN
    RETURN false;
  END IF;

  -- Only allow admin access and log the access attempt
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    -- Log admin access to sales inquiries for audit trail
    PERFORM public.log_sensitive_data_access('sales_inquiries', 'ACCESS_ATTEMPT', NULL, auth.uid());
    RETURN true;
  END IF;
  
  -- Log unauthorized access attempts
  PERFORM public.log_sensitive_data_access('sales_inquiries', 'UNAUTHORIZED_ACCESS_ATTEMPT', NULL, auth.uid());
  RETURN false;
END;
$$;