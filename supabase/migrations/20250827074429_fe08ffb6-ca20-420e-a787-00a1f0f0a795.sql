-- Fix security vulnerabilities in financial data tables
-- Add explicit deny-by-default policies and ensure proper access controls

-- First, drop existing permissive policies and recreate with proper restrictions
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Edge functions can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Edge functions can manage credits" ON public.credits_ledger;

-- Subscribers table - restrict to user's own data only
CREATE POLICY "Users can view their own subscription only" ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert/update for stripe operations
CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Orders table - restrict to user's own orders only
CREATE POLICY "Users can view their own orders only" ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage orders for payment processing
CREATE POLICY "Service role can manage orders" ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- User subscriptions table - restrict to user's own data only
CREATE POLICY "Users can view their own subscription data only" ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all subscription data" ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage subscriptions for credit operations
CREATE POLICY "Service role can manage user subscriptions" ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Credits ledger - restrict to user's own transactions only
CREATE POLICY "Users can view their own credit transactions only" ON public.credits_ledger
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all credit transactions" ON public.credits_ledger
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage credits for payment processing
CREATE POLICY "Service role can manage credits" ON public.credits_ledger
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure no public access to sensitive financial data
-- Add explicit deny policies for anon users
CREATE POLICY "Deny anonymous access to subscribers" ON public.subscribers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to orders" ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to user subscriptions" ON public.user_subscriptions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to credits ledger" ON public.credits_ledger
FOR ALL
TO anon
USING (false)
WITH CHECK (false);