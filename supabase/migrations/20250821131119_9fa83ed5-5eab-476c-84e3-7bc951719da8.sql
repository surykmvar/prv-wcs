-- Fix the function search path security issue
ALTER FUNCTION check_trending_thought_reply_limit() SET search_path = '';