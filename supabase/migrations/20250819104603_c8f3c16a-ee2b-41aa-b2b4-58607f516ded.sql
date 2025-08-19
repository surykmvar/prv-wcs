-- Fix security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_credits_balance(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT credits_balance FROM public.user_subscriptions WHERE user_id = user_uuid),
    0
  );
$$;

CREATE OR REPLACE FUNCTION public.update_user_credits(
  user_uuid uuid,
  credit_amount integer,
  transaction_type text,
  description text DEFAULT NULL,
  reference_uuid uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO current_balance 
  FROM public.user_subscriptions 
  WHERE user_id = user_uuid;
  
  -- If user subscription doesn't exist, create it
  IF current_balance IS NULL THEN
    INSERT INTO public.user_subscriptions (user_id, credits_balance)
    VALUES (user_uuid, 0);
    current_balance := 0;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + credit_amount;
  
  -- Don't allow negative balance for usage transactions
  IF transaction_type = 'usage' AND new_balance < 0 THEN
    RETURN false;
  END IF;
  
  -- Update balance
  UPDATE public.user_subscriptions 
  SET credits_balance = new_balance,
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO public.credits_ledger (
    user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    user_uuid, credit_amount, transaction_type, description, reference_uuid
  );
  
  RETURN true;
END;
$$;