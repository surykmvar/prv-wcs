-- Check current policies and clean up properly
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies for sales_inquiries
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'sales_inquiries' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.sales_inquiries';
    END LOOP;
END $$;

-- Create clean, secure policies
-- Only admins can view sales inquiries (CRITICAL SECURITY FIX)
CREATE POLICY "Admin view sales inquiries"
ON public.sales_inquiries FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update sales inquiries
CREATE POLICY "Admin update sales inquiries" 
ON public.sales_inquiries FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete sales inquiries
CREATE POLICY "Admin delete sales inquiries"
ON public.sales_inquiries FOR DELETE  
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit logging for sales inquiry access
CREATE OR REPLACE FUNCTION public.log_sales_inquiry_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive sales data for security monitoring
  PERFORM public.log_sensitive_data_access(
    'sales_inquiries',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for audit logging
CREATE TRIGGER sales_inquiry_audit_trigger
  AFTER SELECT OR UPDATE OR DELETE ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_sales_inquiry_access();