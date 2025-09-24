-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types and enums
CREATE TYPE public.application_state AS ENUM (
  'DRAFT',
  'INTAKE_REVIEW', 
  'CONTROL_ASSIGN',
  'CONTROL_VISIT_SCHEDULED',
  'CONTROL_IN_PROGRESS',
  'TECHNICAL_REVIEW',
  'SOCIAL_REVIEW',
  'DIRECTOR_REVIEW',
  'MINISTER_DECISION',
  'CLOSURE',
  'REJECTED',
  'ON_HOLD'
);

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'it',
  'staff', 
  'control',
  'director',
  'minister',
  'front_office',
  'applicant'
);

CREATE TYPE public.task_status AS ENUM (
  'PENDING',
  'IN_PROGRESS', 
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
);

CREATE TYPE public.document_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'MISSING'
);

CREATE TYPE public.property_type AS ENUM (
  'RESIDENTIAL',
  'COMMERCIAL',
  'INDUSTRIAL',
  'AGRICULTURAL',
  'OTHER'
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Create applicants table
CREATE TABLE public.applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  national_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT DEFAULT 'Surinamese',
  marital_status TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  household_size INTEGER DEFAULT 1,
  children_count INTEGER DEFAULT 0,
  employment_status TEXT,
  employer_name TEXT,
  monthly_income DECIMAL(12,2),
  spouse_name TEXT,
  spouse_income DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number TEXT UNIQUE NOT NULL,
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE,
  service_type TEXT DEFAULT 'SUBSIDY',
  current_state public.application_state DEFAULT 'DRAFT',
  priority_level INTEGER DEFAULT 3,
  property_address TEXT,
  property_district TEXT,
  property_type public.property_type,
  property_surface_area DECIMAL(10,2),
  title_type TEXT,
  ownership_status TEXT,
  requested_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  reason_for_request TEXT,
  special_circumstances TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create application_steps table (workflow tracking)
CREATE TABLE public.application_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  step_name public.application_state NOT NULL,
  status TEXT DEFAULT 'PENDING',
  assigned_to UUID REFERENCES public.profiles(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id),
  verification_status public.document_status DEFAULT 'PENDING',
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create control_visits table
CREATE TABLE public.control_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  visit_type TEXT DEFAULT 'TECHNICAL_INSPECTION',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  actual_date TIMESTAMP WITH TIME ZONE,
  assigned_inspector UUID REFERENCES public.profiles(id),
  visit_status TEXT DEFAULT 'SCHEDULED',
  location_notes TEXT,
  weather_conditions TEXT,
  access_granted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create control_photos table
CREATE TABLE public.control_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_visit_id UUID REFERENCES public.control_visits(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  photo_category TEXT NOT NULL,
  photo_description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  taken_by UUID REFERENCES public.profiles(id),
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  photo_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create technical_reports table
CREATE TABLE public.technical_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  control_visit_id UUID REFERENCES public.control_visits(id),
  inspector_id UUID REFERENCES public.profiles(id),
  foundation_condition TEXT,
  floor_condition TEXT,
  roof_condition TEXT,
  walls_condition TEXT,
  windows_doors_condition TEXT,
  sanitation_condition TEXT,
  sewerage_condition TEXT,
  electrical_condition TEXT,
  water_supply_condition TEXT,
  structural_issues TEXT,
  recommended_repairs TEXT,
  estimated_cost DECIMAL(12,2),
  urgency_level INTEGER DEFAULT 3,
  technical_conclusion TEXT,
  recommendations TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create social_reports table
CREATE TABLE public.social_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  social_worker_id UUID REFERENCES public.profiles(id),
  household_situation TEXT,
  health_conditions TEXT,
  special_needs TEXT,
  income_verification TEXT,
  living_conditions_assessment TEXT,
  community_integration TEXT,
  support_network TEXT,
  vulnerability_score INTEGER,
  social_priority_level INTEGER DEFAULT 3,
  social_conclusion TEXT,
  recommendations TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create income_records table
CREATE TABLE public.income_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  income_type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency TEXT DEFAULT 'MONTHLY',
  employer_name TEXT,
  position TEXT,
  income_period_start DATE,
  income_period_end DATE,
  verification_document TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_by UUID REFERENCES public.profiles(id),
  status public.task_status DEFAULT 'PENDING',
  priority INTEGER DEFAULT 3,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sla_hours INTEGER,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table (immutable)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reference_data table
CREATE TABLE public.reference_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  name_nl TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_code TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category, code)
);

-- Create attachments table (file storage metadata)
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checksum TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create outbox_events table (for integration)
CREATE TABLE public.outbox_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON public.applicants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_control_visits_updated_at
    BEFORE UPDATE ON public.control_visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reference_data_updated_at
    BEFORE UPDATE ON public.reference_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX idx_applications_current_state ON public.applications(current_state);
CREATE INDEX idx_applications_assigned_to ON public.applications(assigned_to);
CREATE INDEX idx_applications_created_at ON public.applications(created_at);
CREATE INDEX idx_applications_number ON public.applications(application_number);

CREATE INDEX idx_documents_application_id ON public.documents(application_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_status ON public.documents(verification_status);

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_application_id ON public.tasks(application_id);

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

CREATE INDEX idx_reference_data_category ON public.reference_data(category);
CREATE INDEX idx_reference_data_code ON public.reference_data(category, code);
CREATE INDEX idx_reference_data_active ON public.reference_data(is_active);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active);

CREATE INDEX idx_control_photos_visit_id ON public.control_photos(control_visit_id);
CREATE INDEX idx_control_photos_application_id ON public.control_photos(application_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;