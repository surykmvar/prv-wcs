-- Resolve ambiguous function error for allocate_activity_credits
-- Drop the older 4-argument version so only the 5-argument (with defaults) remains
DROP FUNCTION IF EXISTS public.allocate_activity_credits(uuid, text, uuid, uuid);