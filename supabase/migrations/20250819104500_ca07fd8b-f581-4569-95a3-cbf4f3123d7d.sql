-- Enhanced referral codes table with discount support
ALTER TABLE public.referral_codes 
ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS discount_value integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_reward integer DEFAULT 0;

-- Create credits ledger for point tracking
CREATE TABLE IF NOT EXISTS public.credits_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'referral_bonus', 'admin_grant', 'usage', 'refund')),
  description text,
  reference_id uuid, -- Links to orders, referrals, etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Create regional pricing table
CREATE TABLE IF NOT EXISTS public.regional_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL UNIQUE,
  currency text NOT NULL,
  price_per_point decimal(10,4) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default regional pricing
INSERT INTO public.regional_pricing (region, currency, price_per_point) VALUES
('India', 'INR', 1.98),
('Europe', 'EUR', 0.125)
ON CONFLICT (region) DO UPDATE SET
  currency = EXCLUDED.currency,
  price_per_point = EXCLUDED.price_per_point,
  updated_at = now();

-- Create user subscriptions table for premium membership tracking
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits_balance integer DEFAULT 0,
  total_credits_purchased integer DEFAULT 0,
  region text,
  is_premium boolean DEFAULT false,
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create orders table for purchase tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL,
  points_purchased integer NOT NULL,
  region text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create app settings table for global configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default app settings
INSERT INTO public.app_settings (key, value, description) VALUES
('min_credits_for_premium', '50', 'Minimum credits required for premium features'),
('vpn_detection_enabled', 'true', 'Whether to enable VPN detection'),
('referral_bonus_credits', '25', 'Credits awarded for successful referral')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credits_ledger
CREATE POLICY "Users can view their own credit transactions" ON public.credits_ledger
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all credit transactions" ON public.credits_ledger
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Edge functions can manage credits" ON public.credits_ledger
  FOR ALL USING (true);

-- RLS Policies for regional_pricing
CREATE POLICY "Anyone can view regional pricing" ON public.regional_pricing
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage regional pricing" ON public.regional_pricing
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Edge functions can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Edge functions can manage orders" ON public.orders
  FOR ALL USING (true);

-- RLS Policies for app_settings
CREATE POLICY "Anyone can view app settings" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage app settings" ON public.app_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create function to get user credits balance
CREATE OR REPLACE FUNCTION public.get_user_credits_balance(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT credits_balance FROM public.user_subscriptions WHERE user_id = user_uuid),
    0
  );
$$;

-- Create function to update credits balance
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_id ON public.credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_created_at ON public.credits_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Update referral codes with enhanced functionality
UPDATE public.referral_codes 
SET discount_type = 'percentage',
    discount_value = 10,
    points_reward = 25
WHERE discount_value = 0;