// Re-export database types
export * from './database.types';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from './database.types';

// Database Types
export type UserRole = 'organizer' | 'student';
export type OrganizerType = 'individual' | 'academy';
export type WorkshopStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type BillingPeriod = 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  user_type: OrganizerType;
  account_role: UserRole;
  created_at: string;
}

export interface Workshop {
  id: string;
  organizer_id: string;
  title: string;
  description?: string | null;
  organizer_type: OrganizerType;
  max_capacity: number;
  start_date: string;
  end_date: string;
  status: WorkshopStatus;
  custom_fields?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
  registration_link?: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface Registration {
  id: string;
  workshop_id: string;
  user_id?: string | null;
  student_name: string;
  student_phone: string;
  student_email: string;
  custom_data?: Json | null;
  status: RegistrationStatus;
  registered_at?: string | null;
  approved_at?: string | null;
  updated_at?: string | null;
  workshop?: Workshop;
}

export interface Certificate {
  id: string;
  workshop_id: string;
  template_type: 'template-1' | 'template-2' | 'template-3' | 'custom';
  custom_design_url?: string;
  dynamic_fields: DynamicField[];
  custom_message?: string;
  created_at: string;
}

export interface DynamicField {
  id: string;
  field_name: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
}

export interface CertificateIssued {
  id: string;
  registration_id: string;
  certificate_id: string;
  certificate_url: string;
  verification_code: string;
  issued_at: string;
  registration?: Registration;
  certificate?: Certificate;
}

// WhatsApp Types
export interface WhatsAppMessage {
  number: string;
  type: 'text';
  message: string;
  instance_id: string;
  access_token: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
}

// Form Types
export interface WorkshopFormData {
  title: string;
  description: string;
  organizer_type: OrganizerType;
  max_capacity: number;
  start_date: string;
  end_date: string;
  custom_fields?: CustomField[];
}

export interface RegistrationFormData {
  student_name: string;
  student_phone: string;
  student_email: string;
  custom_data?: Record<string, any>;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: PlanType;
  price_monthly: number;
  price_yearly: number;
  max_workshops: number | null;
  max_students_per_workshop: number | null;
  features: string[];
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

