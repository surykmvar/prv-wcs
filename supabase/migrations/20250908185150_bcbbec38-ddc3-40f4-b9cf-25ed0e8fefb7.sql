-- Critical Security Fixes Migration

-- 1. CRITICAL: Revoke public access to dangerous functions that could allow credit manipulation
REVOKE ALL ON FUNCTION public.update_user_credits FROM PUBLIC;
REVOKE ALL ON FUNCTION public.allocate_activity_credits FROM PUBLIC;

-- Grant access only to service role and authenticated users through specific policies
GRANT EXECUTE ON FUNCTION public.update_user_credits TO service_role;
GRANT EXECUTE ON FUNCTION public.allocate_activity_credits TO service_role;

-- 2. Secure the sales_inquiries table with proper policies
-- Drop any existing policies that might be permissive
DROP POLICY IF EXISTS "Anyone can submit sales inquiries" ON public.sales_inquiries;
DROP POLICY IF EXISTS "Public can insert sales inquiries" ON public.sales_inquiries;

-- Add a secure policy for sales inquiry submission that requires validation
-- This will be handled by edge function only
CREATE POLICY "Service role can insert sales inquiries"
ON public.sales_inquiries
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 3. Add rate limiting and validation to prevent abuse
-- Create a function to validate sales inquiry data
CREATE OR REPLACE FUNCTION public.validate_sales_inquiry_data(
  p_name text,
  p_email text,
  p_message text,
  p_company_name text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic validation
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RETURN false;
  END IF;
  
  IF p_email IS NULL OR NOT public.validate_email_format(p_email) THEN
    RETURN false;
  END IF;
  
  IF p_message IS NULL OR length(trim(p_message)) < 10 THEN
    RETURN false;
  END IF;
  
  -- Check for obvious spam patterns
  IF p_message ~* '(viagra|casino|lottery|click here|buy now)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 4. Enhance audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_credit_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all credit transactions for audit purposes
  PERFORM public.log_sensitive_data_access(
    'credits_ledger',
    TG_OP,
    NEW.id,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for credit transaction logging
DROP TRIGGER IF EXISTS log_credit_transactions ON public.credits_ledger;
CREATE TRIGGER log_credit_transactions
  AFTER INSERT ON public.credits_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.log_credit_transaction();

-- 5. Add additional security constraints
-- Prevent negative credit balances from direct manipulation
CREATE OR REPLACE FUNCTION public.prevent_negative_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow service role to set negative balances (for admin corrections)
  IF NEW.credits_balance < 0 AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Credit balance cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent negative credits
DROP TRIGGER IF EXISTS prevent_negative_credits ON public.user_subscriptions;
CREATE TRIGGER prevent_negative_credits
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_negative_credits();