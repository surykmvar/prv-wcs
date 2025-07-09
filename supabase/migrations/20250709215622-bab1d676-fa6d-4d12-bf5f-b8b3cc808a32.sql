-- Add max_woices_allowed column to thoughts table
ALTER TABLE public.thoughts 
ADD COLUMN max_woices_allowed integer DEFAULT 10 CHECK (max_woices_allowed >= 5 AND max_woices_allowed <= 10);