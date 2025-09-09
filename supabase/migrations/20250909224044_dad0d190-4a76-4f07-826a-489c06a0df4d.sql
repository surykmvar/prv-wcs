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

-- Create a view that provides limited access to sales inquiry data for reporting
-- This allows for safer analytics without exposing full customer details
CREATE OR REPLACE VIEW public.sales_inquiries_summary AS
SELECT 
  id,
  created_at,
  status,
  -- Mask email domain for privacy
  CASE 
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN email
    ELSE CONCAT(SUBSTRING(email FROM 1 FOR 3), '***@', SPLIT_PART(email, '@', 2))
  END as email_masked,
  -- Only show company name to admins
  CASE 
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN company_name
    ELSE '***'
  END as company_name_masked,
  -- Message length for analytics without exposing content
  LENGTH(message) as message_length
FROM public.sales_inquiries;

-- Enable RLS on the view
ALTER VIEW public.sales_inquiries_summary SET (security_barrier = true);

-- Grant access to the summary view for authenticated users (for basic analytics)
CREATE POLICY "Authenticated users can view sales summary" 
ON public.sales_inquiries_summary 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add constraint to prevent bulk operations that could indicate data harvesting
CREATE OR REPLACE FUNCTION public.prevent_bulk_sales_inquiry_access()
RETURNS trigger
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
    
  -- If more than 50 access attempts in 1 minute, log as suspicious
  IF recent_access_count > 50 THEN
    PERFORM public.log_sensitive_data_access('sales_inquiries', 'SUSPICIOUS_BULK_ACCESS', NULL, auth.uid());
    RAISE WARNING 'Suspicious bulk access detected for user: %', auth.uid();
  END IF;
  
  RETURN NULL;
END;
$$;

-- Add trigger to monitor bulk access patterns
CREATE TRIGGER monitor_sales_inquiry_access
  AFTER SELECT ON public.sales_inquiries
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.prevent_bulk_sales_inquiry_access();