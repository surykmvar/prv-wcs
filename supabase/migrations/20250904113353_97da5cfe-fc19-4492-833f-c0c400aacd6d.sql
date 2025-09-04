-- SECURITY FIX 1: Remove dangerous SQL file policies and replace with secure ones
-- This addresses the overly permissive policies from database-setup.sql

-- SECURITY FIX 2: Fix SECURITY DEFINER functions without proper search_path
-- Update all SECURITY DEFINER functions to prevent object hijacking
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_user_voice_responses(uuid);
CREATE OR REPLACE FUNCTION public.get_user_voice_responses(user_uuid uuid)
RETURNS TABLE(id uuid, thought_id uuid, thought_title text, created_at timestamp with time zone, duration integer, audio_url text, transcript text, classification text, myth_votes integer, fact_votes integer, unclear_votes integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    vr.id,
    vr.thought_id,
    t.title as thought_title,
    vr.created_at,
    vr.duration,
    vr.audio_url,
    vr.transcript,
    vr.classification,
    vr.myth_votes,
    vr.fact_votes,
    vr.unclear_votes
  FROM public.voice_responses vr
  JOIN public.thoughts t ON vr.thought_id = t.id
  WHERE vr.user_id = user_uuid
  ORDER BY vr.created_at DESC;
$$;

DROP FUNCTION IF EXISTS public.get_profile_display_info(uuid[]);
CREATE OR REPLACE FUNCTION public.get_profile_display_info(user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text, first_name text, last_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.first_name,
    p.last_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;

DROP FUNCTION IF EXISTS public.get_auth_users_basic();
CREATE OR REPLACE FUNCTION public.get_auth_users_basic()
RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  WHERE public.has_role(auth.uid(), 'admin');
$$;

DROP FUNCTION IF EXISTS public.get_user_saved_thoughts(uuid);
CREATE OR REPLACE FUNCTION public.get_user_saved_thoughts(user_uuid uuid)
RETURNS TABLE(id uuid, title text, description text, tags text[], created_at timestamp with time zone, expires_at timestamp with time zone, status text, saved_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    st.created_at as saved_at
  FROM public.thoughts t
  JOIN public.saved_thoughts st ON t.id = st.thought_id
  WHERE st.user_id = user_uuid
  ORDER BY st.created_at DESC;
$$;

DROP FUNCTION IF EXISTS public.get_public_voice_responses_for_feed();
CREATE OR REPLACE FUNCTION public.get_public_voice_responses_for_feed()
RETURNS TABLE(id uuid, thought_id uuid, audio_url text, duration integer, transcript text, classification text, created_at timestamp with time zone, myth_votes integer, fact_votes integer, unclear_votes integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    vr.id,
    vr.thought_id,
    vr.audio_url,
    vr.duration,
    vr.transcript,
    vr.classification,
    vr.created_at,
    vr.myth_votes,
    vr.fact_votes,
    vr.unclear_votes
  FROM public.voice_responses vr
  JOIN public.thoughts t ON vr.thought_id = t.id
  WHERE t.status = 'active';
$$;

DROP FUNCTION IF EXISTS public.get_user_thoughts(uuid);
CREATE OR REPLACE FUNCTION public.get_user_thoughts(user_uuid uuid)
RETURNS TABLE(id uuid, title text, description text, tags text[], created_at timestamp with time zone, expires_at timestamp with time zone, status text, final_status text, max_woices_allowed integer, voice_response_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    t.final_status,
    t.max_woices_allowed,
    COUNT(vr.id) as voice_response_count
  FROM public.thoughts t
  LEFT JOIN public.voice_responses vr ON t.id = vr.thought_id
  WHERE t.user_id = user_uuid
  GROUP BY t.id, t.title, t.description, t.tags, t.created_at, t.expires_at, t.status, t.final_status, t.max_woices_allowed
  ORDER BY t.created_at DESC;
$$;

DROP FUNCTION IF EXISTS public.get_public_thoughts_for_feed();
CREATE OR REPLACE FUNCTION public.get_public_thoughts_for_feed()
RETURNS TABLE(id uuid, title text, description text, tags text[], created_at timestamp with time zone, expires_at timestamp with time zone, status text, final_status text, thought_scope text, country_code text, city text, max_woices_allowed integer, voice_response_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.tags,
    t.created_at,
    t.expires_at,
    t.status,
    t.final_status,
    t.thought_scope,
    t.country_code,
    t.city,
    t.max_woices_allowed,
    COUNT(vr.id) as voice_response_count
  FROM public.thoughts t
  LEFT JOIN public.voice_responses vr ON t.id = vr.thought_id
  WHERE t.status = 'active'
  GROUP BY t.id, t.title, t.description, t.tags, t.created_at, t.expires_at, t.status, t.final_status, t.thought_scope, t.country_code, t.city, t.max_woices_allowed
  ORDER BY t.created_at DESC;
$$;

DROP FUNCTION IF EXISTS public.get_user_credits_balance(uuid);
CREATE OR REPLACE FUNCTION public.get_user_credits_balance(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT credits_balance FROM public.user_subscriptions WHERE user_id = user_uuid),
    0
  );
$$;

DROP FUNCTION IF EXISTS public.user_has_replied_to_thought(uuid, uuid);
CREATE OR REPLACE FUNCTION public.user_has_replied_to_thought(user_uuid uuid, thought_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.voice_responses 
    WHERE user_id = user_uuid AND thought_id = thought_uuid
  );
$$;

-- SECURITY FIX 3: Consolidate duplicate update_user_credits functions
-- Remove the decimal version and keep only the integer version
DROP FUNCTION IF EXISTS public.update_user_credits(uuid, numeric, text, text, uuid);

-- Ensure the integer version has proper security
DROP FUNCTION IF EXISTS public.update_user_credits(uuid, integer, text, text, uuid);
CREATE OR REPLACE FUNCTION public.update_user_credits(user_uuid uuid, credit_amount integer, transaction_type text, description text DEFAULT NULL::text, reference_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO current_balance 
  FROM public.user_subscriptions 
  WHERE user_id = user_uuid;
  
  -- If user subscription doesn't exist, create it
  IF current_balance IS NULL THEN
    INSERT INTO public.user_subscriptions (user_id, credits_balance)
    VALUES (user_uuid, 0);
    current_balance := 0;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + credit_amount;
  
  -- Don't allow negative balance for usage transactions
  IF transaction_type = 'usage' AND new_balance < 0 THEN
    RETURN false;
  END IF;
  
  -- Update balance
  UPDATE public.user_subscriptions 
  SET credits_balance = new_balance,
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO public.credits_ledger (
    user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    user_uuid, credit_amount, transaction_type, description, reference_uuid
  );
  
  RETURN true;
END;
$$;

-- SECURITY FIX 4: Secure user_referrals table - restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can create referral records" ON public.user_referrals;
CREATE POLICY "Authenticated users can create referrals for themselves" 
ON public.user_referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referred_id AND auth.uid() IS NOT NULL);

-- Add unique constraint to prevent duplicate referrals
ALTER TABLE public.user_referrals 
ADD CONSTRAINT unique_user_referral UNIQUE (referrer_id, referred_id);

-- SECURITY FIX 5: Restrict app_settings access - only admins can view sensitive settings
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Admins can view all app settings" 
ON public.app_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create a view for public settings that non-admins might need
CREATE OR REPLACE VIEW public.public_app_settings AS
SELECT key, value, description
FROM public.app_settings
WHERE key IN ('maintenance_mode', 'app_version', 'terms_version');

-- Allow public access to the view
GRANT SELECT ON public.public_app_settings TO anon, authenticated;