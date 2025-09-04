-- Critical Security Fixes for Customer Data Protection
-- Phase 1: Fix RLS Policies for Sensitive Tables

-- 1. Strengthen sales_inquiries table security
-- Drop existing blocking policy and replace with proper restrictive policies
DROP POLICY IF EXISTS "Block unauthorized access to sales inquiries" ON public.sales_inquiries;

-- Create proper admin-only access policies for sales inquiries
CREATE POLICY "Only admins can view sales inquiries"
ON public.sales_inquiries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update sales inquiries"
ON public.sales_inquiries
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete sales inquiries"
ON public.sales_inquiries
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep the existing secure INSERT policy for authenticated users
-- (it already has rate limiting and validation)

-- 2. Strengthen subscribers table security
-- Add more restrictive policies to prevent unauthorized access
CREATE POLICY "Block direct anon access to subscribers"
ON public.subscribers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Only allow authenticated users to view their own subscription
CREATE POLICY "Users can only view own subscription details"
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Prevent direct updates by users (only service role should update)
CREATE POLICY "Block direct user updates to subscribers"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- 3. Add audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name TEXT,
  operation TEXT,
  record_id UUID,
  user_id UUID DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive data for security monitoring
  INSERT INTO public.audit_log (
    table_name,
    operation,
    record_id,
    user_id,
    timestamp,
    ip_address
  ) VALUES (
    table_name,
    operation,
    record_id,
    COALESCE(user_id, auth.uid()),
    now(),
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if audit logging fails
    NULL;
END;
$$;

-- 4. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5. Add data validation functions for better input security
CREATE OR REPLACE FUNCTION public.validate_email_format(email TEXT)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Basic email validation regex
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
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

-- 6. Update sales_inquiries INSERT policy with better validation
DROP POLICY IF EXISTS "Authenticated users can submit secure sales inquiries" ON public.sales_inquiries;

CREATE POLICY "Authenticated users can submit secure sales inquiries"
ON public.sales_inquiries
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND check_sales_inquiry_rate_limit(auth.uid(), email, 3)
  AND length(trim(name)) >= 2
  AND length(trim(email)) >= 5
  AND validate_email_format(email)
  AND length(trim(message)) >= 10
  AND length(trim(message)) <= 5000
  -- Ensure input is sanitized
  AND name = sanitize_html_input(name)
  AND email = sanitize_html_input(email)
  AND message = sanitize_html_input(message)
);