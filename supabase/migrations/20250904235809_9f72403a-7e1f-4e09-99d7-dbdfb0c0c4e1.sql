-- Clean up duplicate RLS policies for sales_inquiries table
-- Drop all existing policies first
DROP POLICY IF EXISTS "Admins can delete sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admins can update sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admins can view all sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Only admins can delete sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Only admins can update sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Only admins can view sales inquiries" ON public.sales_inquiries;

-- Create new, consolidated policies with proper security
-- Only admins can view sales inquiries (most critical security fix)
CREATE POLICY "Admins can view sales inquiries"
ON public.sales_inquiries FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update sales inquiries
CREATE POLICY "Admins can update sales inquiries" 
ON public.sales_inquiries FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete sales inquiries
CREATE POLICY "Admins can delete sales inquiries"
ON public.sales_inquiries FOR DELETE  
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add audit logging trigger for sales inquiry access
CREATE OR REPLACE FUNCTION public.log_sales_inquiry_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive sales data
  PERFORM public.log_sensitive_data_access(
    'sales_inquiries',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;