-- First, properly clean up existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'sales_inquiries' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.sales_inquiries';
    END LOOP;
END $$;

-- Create secure policies - CRITICAL SECURITY FIX
-- Only admins can view sales inquiries (prevents competitor access)
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