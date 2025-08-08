-- Regional vs Global support: columns and indexes (idempotent)

-- Add necessary columns if missing
ALTER TABLE public.thoughts
  ADD COLUMN IF NOT EXISTS thought_scope text NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city text;

-- Backfill null scope values to 'global' (in case column existed without default)
UPDATE public.thoughts SET thought_scope = 'global' WHERE thought_scope IS NULL;

-- Helpful indexes for filters and feed performance
CREATE INDEX IF NOT EXISTS idx_thoughts_scope ON public.thoughts(thought_scope);
CREATE INDEX IF NOT EXISTS idx_thoughts_country_code ON public.thoughts(country_code);
CREATE INDEX IF NOT EXISTS idx_thoughts_status_scope_country ON public.thoughts(status, thought_scope, country_code);
