
-- 1) REGIONAL PRICING: remove public read, require auth for SELECT

-- Drop public SELECT policy
DROP POLICY IF EXISTS "Anyone can view regional pricing" ON public.regional_pricing;

-- Ensure existing admin manage policy remains:
-- "Admins can manage regional pricing" (ALL using has_role(...)) already exists.

-- Add authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view regional pricing"
  ON public.regional_pricing
  FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- 2) CREDIT PACKAGES: remove public read, require auth for SELECT

-- Drop public SELECT policy
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.credit_packages;

-- Ensure existing admin manage policy remains:
-- "Admins can manage packages" (ALL using has_role(...)) already exists.

-- Add authenticated-only SELECT policy (still enforce active flag at RLS)
CREATE POLICY "Authenticated users can view active packages"
  ON public.credit_packages
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
