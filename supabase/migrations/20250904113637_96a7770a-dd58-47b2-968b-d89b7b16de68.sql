-- Add unique constraint to prevent duplicate referrals (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_referral' 
        AND table_name = 'user_referrals'
    ) THEN
        ALTER TABLE public.user_referrals 
        ADD CONSTRAINT unique_user_referral UNIQUE (referrer_id, referred_id);
    END IF;
END $$;