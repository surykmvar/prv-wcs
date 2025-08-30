-- Improve security for sales_inquiries table (fixed version)

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

-- Add data retention function
CREATE OR REPLACE FUNCTION public.cleanup_old_sales_inquiries()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete inquiries older than 2 years for privacy compliance
  DELETE FROM public.sales_inquiries 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Log cleanup action
  INSERT INTO public.sales_inquiry_audit_log (
    admin_user_id,
    action,
    details
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'CLEANUP',
    jsonb_build_object(
      'action', 'automated_cleanup',
      'timestamp', NOW()
    )
  );
END;
$$;