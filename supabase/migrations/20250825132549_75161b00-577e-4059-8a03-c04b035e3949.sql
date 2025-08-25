-- Update the thought constraints to allow up to 30 Woices
ALTER TABLE public.thoughts 
ALTER COLUMN max_woices_allowed SET DEFAULT 10;

-- Update any existing thoughts that might have higher limits to be within bounds
UPDATE public.thoughts 
SET max_woices_allowed = LEAST(max_woices_allowed, 30)
WHERE max_woices_allowed > 30;