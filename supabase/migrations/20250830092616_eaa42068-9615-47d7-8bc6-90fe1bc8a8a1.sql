-- Improve security for sales_inquiries table

-- Add rate limiting constraint for submissions
CREATE TABLE IF NOT EXISTS public.sales_inquiry_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE public.sales_inquiry_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limits - only system can manage this
CREATE POLICY "Service role manages rate limits" ON public.sales_inquiry_rate_limits
  FOR ALL USING (true);

-- Add function to check submission rate limits
CREATE OR REPLACE FUNCTION public.check_sales_inquiry_rate_limit(
  p_user_id UUID,
  p_email TEXT,
  p_max_per_hour INTEGER DEFAULT 3
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  -- Count submissions in the last hour
  SELECT COUNT(*) INTO submission_count
  FROM public.sales_inquiries
  WHERE (user_id = p_user_id OR email = p_email)
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return false if limit exceeded
  IF submission_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update the INSERT policy to include rate limiting
DROP POLICY IF EXISTS "Authenticated users can submit sales inquiries" ON public.sales_inquiries;

CREATE POLICY "Rate limited authenticated users can submit sales inquiries" 
ON public.sales_inquiries
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.check_sales_inquiry_rate_limit(auth.uid(), NEW.email, 3)
);

-- Add data retention trigger to automatically clean old inquiries
CREATE OR REPLACE FUNCTION public.cleanup_old_sales_inquiries()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete inquiries older than 2 years for privacy compliance
  DELETE FROM public.sales_inquiries 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Delete old rate limit records
  DELETE FROM public.sales_inquiry_rate_limits 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Add audit logging for admin access
CREATE TABLE IF NOT EXISTS public.sales_inquiry_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  inquiry_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.sales_inquiry_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.sales_inquiry_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.sales_inquiry_audit_log
  FOR INSERT WITH CHECK (true);

-- Add email validation constraint
ALTER TABLE public.sales_inquiries 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add trigger to log admin access
CREATE OR REPLACE FUNCTION public.log_sales_inquiry_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if accessed by admin (not system operations)
  IF auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.sales_inquiry_audit_log (
      admin_user_id,
      action,
      inquiry_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit trigger
DROP TRIGGER IF EXISTS sales_inquiry_audit_trigger ON public.sales_inquiries;
CREATE TRIGGER sales_inquiry_audit_trigger
  AFTER SELECT OR UPDATE OR DELETE ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_sales_inquiry_access();