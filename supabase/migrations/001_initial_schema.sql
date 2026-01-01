-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('organizer', 'student');
CREATE TYPE organizer_type AS ENUM ('individual', 'academy');
CREATE TYPE workshop_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  full_name TEXT NOT NULL,
  user_type organizer_type,
  account_role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshops table
CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  organizer_type organizer_type NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 50,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status workshop_status NOT NULL DEFAULT 'draft',
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_email TEXT NOT NULL,
  custom_data JSONB DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL DEFAULT 'template-1',
  custom_design_url TEXT,
  dynamic_fields JSONB DEFAULT '[]'::jsonb,
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workshop_id)
);

-- Certificate issued table
CREATE TABLE public.certificate_issued (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registration_id)
);

-- WhatsApp templates table
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (for future Stripe integration)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_workshops_organizer ON public.workshops(organizer_id);
CREATE INDEX idx_workshops_status ON public.workshops(status);
CREATE INDEX idx_workshops_dates ON public.workshops(start_date, end_date);
CREATE INDEX idx_registrations_workshop ON public.registrations(workshop_id);
CREATE INDEX idx_registrations_user ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_certificate_issued_registration ON public.certificate_issued(registration_id);
CREATE INDEX idx_certificate_issued_verification ON public.certificate_issued(verification_code);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_issued ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Workshops policies
CREATE POLICY "Anyone can view active workshops" ON public.workshops
  FOR SELECT USING (status = 'active' OR organizer_id = auth.uid());

CREATE POLICY "Organizers can create workshops" ON public.workshops
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their workshops" ON public.workshops
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their workshops" ON public.workshops
  FOR DELETE USING (auth.uid() = organizer_id);

-- Registrations policies
CREATE POLICY "Anyone can register for workshops" ON public.registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their registrations" ON public.registrations
  FOR SELECT USING (
    user_id = auth.uid() OR 
    workshop_id IN (SELECT id FROM public.workshops WHERE organizer_id = auth.uid())
  );

CREATE POLICY "Organizers can update registrations for their workshops" ON public.registrations
  FOR UPDATE USING (
    workshop_id IN (SELECT id FROM public.workshops WHERE organizer_id = auth.uid())
  );

-- Certificates policies
CREATE POLICY "Organizers can manage certificates for their workshops" ON public.certificates
  FOR ALL USING (
    workshop_id IN (SELECT id FROM public.workshops WHERE organizer_id = auth.uid())
  );

-- Certificate issued policies
CREATE POLICY "Anyone can view issued certificates" ON public.certificate_issued
  FOR SELECT USING (true);

CREATE POLICY "Organizers can issue certificates" ON public.certificate_issued
  FOR INSERT WITH CHECK (
    certificate_id IN (
      SELECT c.id FROM public.certificates c
      JOIN public.workshops w ON c.workshop_id = w.id
      WHERE w.organizer_id = auth.uid()
    )
  );

-- WhatsApp templates policies
CREATE POLICY "Users can manage their own templates" ON public.whatsapp_templates
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON public.workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update workshop status based on dates
CREATE OR REPLACE FUNCTION update_workshop_status()
RETURNS void AS $$
BEGIN
  UPDATE public.workshops
  SET status = 'completed'
  WHERE status = 'active' AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));
END;
$$ LANGUAGE plpgsql;

