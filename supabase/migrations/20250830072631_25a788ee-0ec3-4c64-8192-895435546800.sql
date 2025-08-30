-- Fix RLS policies for sales_inquiries table to prevent public read access
-- Drop the overly permissive policies and create secure ones

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Admins can manage sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Anyone can create sales inquiries" ON public.sales_inquiries;

-- Create secure policies
-- Only admins can view sales inquiries
CREATE POLICY "Admin read access to sales inquiries" 
ON public.sales_inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update/delete sales inquiries
CREATE POLICY "Admin write access to sales inquiries" 
ON public.sales_inquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete access to sales inquiries" 
ON public.sales_inquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anyone to submit contact forms (INSERT only)
CREATE POLICY "Public can submit sales inquiries" 
ON public.sales_inquiries 
FOR INSERT 
WITH CHECK (true);