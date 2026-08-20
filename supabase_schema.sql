-- Migration: Init Aegis Schema

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  stripe_product_id text UNIQUE,
  stripe_price_id text UNIQUE,
  billing_interval text,
  price integer,
  currency text DEFAULT 'usd',
  is_active boolean DEFAULT true,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Entitlements Table
CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  source text,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  value text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Licenses Table
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  license_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  product text NOT NULL,
  issued_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  last_activated_at timestamp with time zone,
  activation_limit integer DEFAULT 1,
  activation_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Releases Table
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  platform text NOT NULL,
  architecture text NOT NULL,
  download_url text NOT NULL,
  checksum text,
  is_active boolean DEFAULT true,
  release_notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(version, platform, architecture)
);

-- Stripe Events Table
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS)

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Entitlements
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entitlements" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

-- Licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own licenses" ON public.licenses FOR SELECT USING (auth.uid() = user_id);

-- Releases
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active releases" ON public.releases FOR SELECT USING (is_active = true);

-- Stripe Events (internal only, no read/write from client)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Audit Logs (insert via backend only, read by user if their own)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_plans
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_subscriptions
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_entitlements
BEFORE UPDATE ON public.entitlements
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_licenses
BEFORE UPDATE ON public.licenses
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Create trigger for handling new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  
  -- Create audit log
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id)
  VALUES (new.id, 'USER_REGISTERED', 'auth.users', new.id::text);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
