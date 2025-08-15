-- Fix security issues with voice recordings and user profiles

-- 1. Remove the overly permissive policy that allows anyone to view voice responses
DROP POLICY IF EXISTS "Anyone can view voice responses" ON public.voice_responses;

-- 2. Remove the overly permissive policy that allows anyone to create voice responses
DROP POLICY IF EXISTS "Anyone can create voice responses" ON public.voice_responses;

-- 3. Create a more secure policy for viewing voice responses
-- Users can view voice responses for active thoughts (for the feed functionality)
-- or their own voice responses
CREATE POLICY "Users can view voice responses for active thoughts or own responses" 
ON public.voice_responses 
FOR SELECT 
USING (
  -- User can see their own voice responses
  auth.uid() = user_id 
  OR 
  -- Or voice responses for thoughts that are publicly visible (active status)
  EXISTS (
    SELECT 1 FROM public.thoughts 
    WHERE thoughts.id = voice_responses.thought_id 
    AND thoughts.status = 'active'
  )
);

-- 4. Create a secure policy for creating voice responses
-- Only allow creation if the thought is active and publicly accessible
CREATE POLICY "Users can create voice responses for active thoughts" 
ON public.voice_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.thoughts 
    WHERE thoughts.id = voice_responses.thought_id 
    AND thoughts.status = 'active'
  )
);

-- 5. Fix profiles table - remove public access and restrict to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 6. Create a more secure policy for viewing profiles
-- Only authenticated users can view profiles (for displaying author info)
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);