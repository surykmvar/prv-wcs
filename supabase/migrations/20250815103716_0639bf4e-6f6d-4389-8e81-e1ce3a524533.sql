-- Update secure function to include all required fields for proper typing
DROP FUNCTION IF EXISTS public.get_public_thoughts_for_feed();

CREATE OR REPLACE FUNCTION public.get_public_thoughts_for_feed()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  tags text[],
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  status text,
  final_status text,
  thought_scope text,
  country_code text,
  city text,
  max_woices_allowed integer,
  voice_response_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
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