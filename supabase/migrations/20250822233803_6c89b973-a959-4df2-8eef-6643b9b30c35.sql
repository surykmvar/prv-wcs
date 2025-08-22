-- Fix the credits ledger constraint to allow 'activity' transaction type
ALTER TABLE public.credits_ledger 
DROP CONSTRAINT credits_ledger_transaction_type_check;

ALTER TABLE public.credits_ledger 
ADD CONSTRAINT credits_ledger_transaction_type_check 
CHECK (transaction_type = ANY (ARRAY['purchase'::text, 'referral_bonus'::text, 'admin_grant'::text, 'usage'::text, 'refund'::text, 'activity'::text]));