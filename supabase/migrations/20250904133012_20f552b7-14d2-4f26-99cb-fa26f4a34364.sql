-- Add explicit blocking policy for sales_inquiries to prevent any unauthorized access
-- This addresses the security concern about customer contact information harvesting

-- Drop existing policies to recreate them with better organization
DROP POLICY IF EXISTS "Admin delete access to sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admin read access to sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admin write access to sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Secure sales inquiry submissions" ON public.sales_inquiries;

-- Create comprehensive security policies for sales_inquiries table

-- 1. Explicit blocking policy - denies all unauthorized access
CREATE POLICY "Block unauthorized access to sales inquiries"
ON public.sales_inquiries
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2. Admin-only access for viewing inquiries
CREATE POLICY "Admins can view all sales inquiries"
ON public.sales_inquiries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Admin-only access for updating inquiries  
CREATE POLICY "Admins can update sales inquiries"
ON public.sales_inquiries
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Admin-only access for deleting inquiries
CREATE POLICY "Admins can delete sales inquiries"
ON public.sales_inquiries
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Secure submission policy for authenticated users only
CREATE POLICY "Authenticated users can submit secure sales inquiries"
ON public.sales_inquiries
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND check_sales_inquiry_rate_limit(auth.uid(), email, 3)
  AND length(name) >= 2 
  AND length(email) >= 5 
  AND length(message) >= 10 
  AND length(message) <= 5000
);