-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Create user_referrals table to track who referred whom
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_id) -- Each user can only be referred once
);

-- Enable RLS on user_referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Create membership_plans table (scaffold for future Stripe integration)
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval_type TEXT NOT NULL DEFAULT 'month' CHECK (interval_type IN ('month', 'year', 'lifetime')),
  stripe_price_id TEXT,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on membership_plans
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Create subscribers table (scaffold for future Stripe integration)
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for referral_codes
CREATE POLICY "Users can view codes assigned to them" ON public.referral_codes
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all referral codes" ON public.referral_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_referrals
CREATE POLICY "Users can view their own referrals" ON public.user_referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Admins can view all referrals" ON public.user_referrals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create referral records" ON public.user_referrals
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for membership_plans
CREATE POLICY "Anyone can view active plans" ON public.membership_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all plans" ON public.membership_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.subscribers
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Edge functions can manage subscriptions" ON public.subscribers
  FOR ALL USING (true);

-- Add admin visibility to existing tables
CREATE POLICY "Admins can view all thoughts" ON public.thoughts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all voice responses" ON public.voice_responses
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all user votes" ON public.user_votes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all saved thoughts" ON public.saved_thoughts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create function for admins to list basic auth user info
CREATE OR REPLACE FUNCTION public.get_auth_users_basic()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  WHERE public.has_role(auth.uid(), 'admin');
$$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin role for first user (you'll need to update this with your actual user ID)
-- This is commented out - you'll need to run this manually with your user ID
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');