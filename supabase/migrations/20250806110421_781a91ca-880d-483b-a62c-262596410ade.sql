-- Fix security warnings
-- 1. Fix function search path for update_vote_counts function
ALTER FUNCTION public.update_vote_counts() SET search_path = '';

-- 2. Fix function search path for other functions
ALTER FUNCTION public.get_user_thoughts(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_voice_responses(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.evaluate_thought_status() SET search_path = '';
ALTER FUNCTION public.update_expired_thoughts() SET search_path = '';