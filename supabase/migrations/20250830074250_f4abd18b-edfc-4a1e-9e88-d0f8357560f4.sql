-- Fix security warnings and improve RLS policies

-- 1. Fix sales_inquiries table policies (currently allows public write access)
DROP POLICY IF EXISTS "Public can submit sales inquiries" ON public.sales_inquiries;

-- Create more secure policy for sales inquiries with rate limiting considerations
CREATE POLICY "Authenticated users can submit sales inquiries" 
ON public.sales_inquiries 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix profiles table - add proper RLS policies for user personal data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create secure policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin users can view all profiles for management purposes
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));