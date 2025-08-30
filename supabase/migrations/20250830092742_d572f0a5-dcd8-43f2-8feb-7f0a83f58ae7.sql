-- Improve security for sales_inquiries table - Fixed NEW reference

-- Add rate limiting for submissions
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
  -- Count submissions in the last hour from this user or email
  SELECT COUNT(*) INTO submission_count
  FROM public.sales_inquiries
  WHERE (p_user_id IS NOT NULL AND auth.uid() = p_user_id) 
    OR email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return false if limit exceeded
  IF submission_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update the INSERT policy to include rate limiting and better validation
DROP POLICY IF EXISTS "Authenticated users can submit sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Rate limited authenticated users can submit sales inquiries" ON public.sales_inquiries;

CREATE POLICY "Secure sales inquiry submissions" 
ON public.sales_inquiries
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.check_sales_inquiry_rate_limit(auth.uid(), email, 3)
  AND length(name) >= 2
  AND length(email) >= 5
  AND length(message) >= 10
  AND length(message) <= 5000
);

-- Add audit logging table for admin access
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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_email_format' 
    AND table_name = 'sales_inquiries'
  ) THEN
    ALTER TABLE public.sales_inquiries 
    ADD CONSTRAINT valid_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Add function for data retention (to be called by cron job)
CREATE OR REPLACE FUNCTION public.cleanup_old_sales_inquiries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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