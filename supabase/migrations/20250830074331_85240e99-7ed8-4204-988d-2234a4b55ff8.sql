-- Fix security warnings - update existing policies

-- 1. Fix sales_inquiries table policies 
DROP POLICY IF EXISTS "Public can submit sales inquiries" ON public.sales_inquiries;

-- Create more secure policy for sales inquiries requiring authentication
CREATE POLICY "Authenticated users can submit sales inquiries" 
ON public.sales_inquiries 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix profiles table policies - drop the public read policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;