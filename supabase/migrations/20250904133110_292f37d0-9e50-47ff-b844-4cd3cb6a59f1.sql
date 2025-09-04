-- Add explicit blocking policy for profiles table to prevent unauthorized access to personal information
-- This addresses the security concern about customer personal information being stolen

-- Drop existing policies to recreate them with better security organization
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create comprehensive security policies for profiles table

-- 1. Explicit blocking policy - denies all unauthorized access
CREATE POLICY "Block unauthorized access to profiles"
ON public.profiles
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2. Users can only view their own profile
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Users can only insert their own profile
CREATE POLICY "Users can insert their own profile only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Users can only update their own profile
CREATE POLICY "Users can update their own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Admin access for profile management (if needed)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));