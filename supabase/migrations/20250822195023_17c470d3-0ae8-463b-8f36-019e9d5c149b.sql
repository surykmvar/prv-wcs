-- Create credit packages table for admin management
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  region TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  seasonal_offer_percentage INTEGER DEFAULT NULL,
  seasonal_offer_expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active packages" ON public.credit_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.credit_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update credits_ledger to support fractional points
ALTER TABLE public.credits_ledger 
  ALTER COLUMN amount TYPE DECIMAL(10,2);

-- Update user_subscriptions to support fractional points
ALTER TABLE public.user_subscriptions 
  ALTER COLUMN credits_balance TYPE DECIMAL(10,2);

-- Update the credits function to handle fractional points
CREATE OR REPLACE FUNCTION public.update_user_credits(
  user_uuid uuid, 
  credit_amount decimal(10,2), 
  transaction_type text, 
  description text DEFAULT NULL::text, 
  reference_uuid uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_balance decimal(10,2);
  new_balance decimal(10,2);
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
$function$;

-- Create function for activity-based point allocation
CREATE OR REPLACE FUNCTION public.allocate_activity_points(
  user_uuid uuid,
  activity_type text,
  target_user_uuid uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  points_to_add decimal(10,2) := 0;
  target_points decimal(10,2) := 0;
  success boolean := true;
BEGIN
  CASE activity_type
    WHEN 'post_voice' THEN
      points_to_add := 1.0;
    WHEN 'post_thought' THEN
      points_to_add := 1.0;
    WHEN 'vote_fact' THEN
      points_to_add := -0.5;
      target_points := 0.5;
    WHEN 'vote_myth' THEN
      points_to_add := -0.33;
    WHEN 'vote_unclear_delete' THEN
      points_to_add := 1.0;
      target_points := -1.0;
    WHEN 'vote_unclear_ignore' THEN
      points_to_add := 0.5;
      target_points := -0.5;
    WHEN 'vote_unclear_rerecord' THEN
      points_to_add := 1.0;
      target_points := -1.0;
    ELSE
      RETURN false;
  END CASE;

  -- Update user points
  IF points_to_add != 0 THEN
    success := public.update_user_credits(
      user_uuid, 
      points_to_add, 
      'activity', 
      activity_type
    );
    IF NOT success THEN RETURN false; END IF;
  END IF;

  -- Update target user points if applicable
  IF target_user_uuid IS NOT NULL AND target_points != 0 THEN
    success := public.update_user_credits(
      target_user_uuid, 
      target_points, 
      'activity', 
      activity_type || '_target'
    );
  END IF;

  RETURN success;
END;
$function$;

-- Insert default credit packages for different regions
INSERT INTO public.credit_packages (name, points, price_cents, currency, region, is_popular) VALUES
-- India packages
('Starter Pack', 50, 9900, 'INR', 'India', false),
('Popular Pack', 200, 39600, 'INR', 'India', true),
('Premium Pack', 500, 99000, 'INR', 'India', false),

-- Europe packages  
('Starter Pack', 50, 625, 'EUR', 'Europe', false),
('Popular Pack', 200, 2500, 'EUR', 'Europe', true),
('Premium Pack', 500, 6250, 'EUR', 'Europe', false),

-- US packages (default)
('Starter Pack', 50, 799, 'USD', 'US', false),
('Popular Pack', 200, 3199, 'USD', 'US', true),
('Premium Pack', 500, 7999, 'USD', 'US', false);