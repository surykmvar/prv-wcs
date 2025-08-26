
BEGIN;

-- 1) Remove the old constraint that capped at 10
ALTER TABLE public.thoughts
  DROP CONSTRAINT IF EXISTS thoughts_max_woices_allowed_check;

-- 2) Recreate the constraint to allow up to 30 (and at least 5). Allow NULLs for safety.
ALTER TABLE public.thoughts
  ADD CONSTRAINT thoughts_max_woices_allowed_check
  CHECK (
    max_woices_allowed IS NULL
    OR (max_woices_allowed >= 5 AND max_woices_allowed <= 30)
  );

-- 3) Ensure the default remains 10
ALTER TABLE public.thoughts
  ALTER COLUMN max_woices_allowed SET DEFAULT 10;

COMMIT;
