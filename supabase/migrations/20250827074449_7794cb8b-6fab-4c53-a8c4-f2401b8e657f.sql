-- Fix security vulnerabilities in financial data tables
-- Drop all existing policies and recreate with proper restrictions

-- Drop existing policies for subscribers table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.subscribers;

-- Drop existing policies for orders table  
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can manage orders" ON public.orders;

-- Drop existing policies for user_subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.user_subscriptions;

-- Drop existing policies for credits_ledger table
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.credits_ledger;
DROP POLICY IF EXISTS "Admins can view all credit transactions" ON public.credits_ledger;
DROP POLICY IF EXISTS "Edge functions can manage credits" ON public.credits_ledger;

-- Create secure policies for subscribers table
CREATE POLICY "Users can view own subscription only" ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriber data" ON public.subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages subscriptions" ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Block anon access to subscribers" ON public.subscribers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Create secure policies for orders table
CREATE POLICY "Users can view own orders only" ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all order data" ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages orders" ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Block anon access to orders" ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Create secure policies for user_subscriptions table
CREATE POLICY "Users can view own subscription data only" ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription data" ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all user subscription data" ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages user subscriptions" ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Block anon access to user subscriptions" ON public.user_subscriptions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Create secure policies for credits_ledger table
CREATE POLICY "Users can view own credit history only" ON public.credits_ledger
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all credit data" ON public.credits_ledger
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages credits" ON public.credits_ledger
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Block anon access to credits" ON public.credits_ledger
FOR ALL
TO anon
USING (false)
WITH CHECK (false);