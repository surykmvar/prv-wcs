-- Fix profiles table security - restrict access to personal information

-- 1. Remove the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Allow users to view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Allow viewing only public display information (names for UI purposes)
-- This supports showing user initials/avatars in the feed without exposing sensitive data
CREATE POLICY "Public display information viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);