
-- Add authorization check to update_user_credits
CREATE OR REPLACE FUNCTION public.update_user_credits(user_uuid uuid, credit_amount integer, transaction_type text, description text DEFAULT NULL::text, reference_uuid uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Authorization check: only allow self-updates or admin/service role
  IF user_uuid != auth.uid() 
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) 
     AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify other users credits';
  END IF;

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
$function$;
