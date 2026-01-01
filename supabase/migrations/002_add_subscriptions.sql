-- Create subscription plans table
CREATE TYPE plan_type_enum AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TABLE subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  plan_type plan_type_enum NOT NULL,
  price_monthly decimal(10,2) NOT NULL DEFAULT 0,
  price_yearly decimal(10,2) NOT NULL DEFAULT 0,
  max_workshops integer,
  max_students_per_workshop integer,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user subscriptions table
CREATE TYPE subscription_status_enum AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE billing_period_enum AS ENUM ('monthly', 'yearly');

CREATE TABLE user_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status subscription_status_enum DEFAULT 'active' NOT NULL,
  billing_period billing_period_enum NOT NULL,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create webhook events log table (for Stripe webhooks)
CREATE TABLE webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone." ON subscription_plans FOR SELECT USING (is_active = true);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions." ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- No public access to webhook events

-- Add indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Insert default plans
INSERT INTO subscription_plans (name, plan_type, price_monthly, price_yearly, max_workshops, max_students_per_workshop, features) VALUES
  ('مجاني', 'free', 0, 0, 3, 20, '["إنشاء حتى 3 ورش", "حتى 20 طالب لكل ورشة", "شهادات أساسية", "دعم عبر البريد"]'::jsonb),
  ('أساسي', 'basic', 29.99, 299.99, 10, 50, '["إنشاء حتى 10 ورش", "حتى 50 طالب لكل ورشة", "شهادات مخصصة", "إشعارات WhatsApp", "دعم ذو أولوية"]'::jsonb),
  ('احترافي', 'premium', 79.99, 799.99, NULL, NULL, '["ورش غير محدودة", "طلاب غير محدودين", "شهادات مخصصة بالكامل", "تقارير متقدمة", "دعم مباشر 24/7"]'::jsonb),
  ('مؤسسات', 'enterprise', 199.99, 1999.99, NULL, NULL, '["كل ميزات الاحترافي", "حسابات متعددة", "API مخصص", "تكامل مخصص", "مدير حساب مخصص"]'::jsonb);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add subscription_id to users table for quick reference
ALTER TABLE users ADD COLUMN subscription_id uuid REFERENCES user_subscriptions(id);

