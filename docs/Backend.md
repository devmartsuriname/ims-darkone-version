# IMS Backend Architecture - Supabase Integration

## Database Schema

### Users & Authentication

#### users (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Extended with custom claims for roles
```

#### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'IT', 'Staff', 'Control', 'Director', 'Minister', 'Front Office')),
  department TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Core Application Tables

#### applicants
```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  municipality TEXT NOT NULL,
  emergency_contact JSONB,
  household_composition JSONB, -- Array of household members
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### applications
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,
  applicant_id UUID REFERENCES applicants(id) NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'SUBSIDY',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'INTAKE_REVIEW', 'CONTROL_ASSIGN', 'CONTROL_VISIT_SCHEDULED',
    'CONTROL_IN_PROGRESS', 'TECHNICAL_REVIEW', 'SOCIAL_REVIEW',
    'DIRECTOR_REVIEW', 'MINISTER_DECISION', 'CLOSURE', 'REJECTED', 'ON_HOLD'
  )),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  property_details JSONB NOT NULL, -- Property information
  technical_defects JSONB, -- Defects assessment
  social_information JSONB, -- Social assessment data
  employment_income JSONB, -- Employment and income details
  required_documents_status JSONB, -- 12 required documents checklist
  completion_percentage INTEGER DEFAULT 0,
  assigned_control_officer UUID REFERENCES profiles(id),
  assigned_technical_reviewer UUID REFERENCES profiles(id),
  assigned_social_reviewer UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

#### application_steps
```sql
CREATE TABLE application_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  assigned_to UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Document Management

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  document_type TEXT NOT NULL, -- Maps to 12 required documents
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_status TEXT DEFAULT 'PENDING' CHECK (upload_status IN ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED')),
  verification_status TEXT CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### attachments
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'application', 'control_visit', 'report'
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Control & Inspection

#### control_visits
```sql
CREATE TABLE control_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  scheduled_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_officer UUID REFERENCES profiles(id) NOT NULL,
  visit_status TEXT DEFAULT 'SCHEDULED' CHECK (visit_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
  visit_type TEXT DEFAULT 'INITIAL' CHECK (visit_type IN ('INITIAL', 'FOLLOW_UP', 'FINAL')),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  location_coordinates POINT,
  weather_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### control_photos
```sql
CREATE TABLE control_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_visit_id UUID REFERENCES control_visits(id) NOT NULL,
  application_id UUID REFERENCES applications(id) NOT NULL,
  photo_category TEXT NOT NULL, -- 'exterior', 'interior', 'defects', 'documentation'
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  photo_metadata JSONB, -- GPS, timestamp, camera info, hash
  description TEXT,
  taken_by UUID REFERENCES profiles(id) NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reports & Assessments

#### technical_reports
```sql
CREATE TABLE technical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  control_visit_id UUID REFERENCES control_visits(id),
  assessment_date DATE NOT NULL,
  foundation_condition TEXT,
  floor_condition TEXT,
  roof_condition TEXT,
  windows_doors_condition TEXT,
  sanitation_condition TEXT,
  sewerage_condition TEXT,
  electrical_condition TEXT,
  water_supply_condition TEXT,
  overall_assessment TEXT NOT NULL,
  estimated_repair_cost DECIMAL(10,2),
  recommendations TEXT,
  technical_score INTEGER CHECK (technical_score BETWEEN 1 AND 10),
  photos_attached INTEGER DEFAULT 0,
  report_status TEXT DEFAULT 'DRAFT' CHECK (report_status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION_REQUIRED')),
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  reviewed_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### social_reports
```sql
CREATE TABLE social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  assessment_date DATE NOT NULL,
  household_size INTEGER NOT NULL,
  vulnerable_members JSONB, -- Elderly, disabled, children details
  health_conditions JSONB,
  income_assessment JSONB,
  social_needs_priority TEXT NOT NULL,
  housing_urgency_score INTEGER CHECK (housing_urgency_score BETWEEN 1 AND 10),
  community_integration TEXT,
  support_network TEXT,
  recommendations TEXT,
  social_worker_notes TEXT,
  report_status TEXT DEFAULT 'DRAFT' CHECK (report_status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION_REQUIRED')),
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  reviewed_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### income_records
```sql
CREATE TABLE income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  applicant_id UUID REFERENCES applicants(id) NOT NULL,
  income_type TEXT NOT NULL, -- 'salary', 'pension', 'benefits', 'self_employed', 'other'
  income_source TEXT NOT NULL,
  monthly_amount DECIMAL(10,2) NOT NULL,
  verification_document_id UUID REFERENCES documents(id),
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  valid_from DATE NOT NULL,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Workflow & Tasks

#### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  due_date TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Audit & Compliance

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Make audit_logs immutable
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Reference Data

#### reference_data
```sql
CREATE TABLE reference_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'document_types', 'municipalities', 'denial_reasons'
  code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_nl TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, code)
);
```

### Integration & Events

#### outbox_events
```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_data JSONB NOT NULL,
  event_version INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Profile Access
```sql
-- Users can view their own profile and admins can view all
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'IT'))
  );

-- Users can update their own profile, admins can update all
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'IT'))
  );
```

### Application Access
```sql
-- Role-based application access
CREATE POLICY applications_select_policy ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        p.role = 'Admin' OR
        p.role = 'IT' OR
        (p.role = 'Front Office' AND created_by = p.id) OR
        (p.role = 'Staff') OR
        (p.role = 'Control' AND assigned_control_officer = p.id) OR
        (p.role = 'Director') OR
        (p.role = 'Minister')
      )
    )
  );

-- Application creation by authorized roles
CREATE POLICY applications_insert_policy ON applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Staff', 'Front Office')
    )
  );

-- Application updates based on role and status
CREATE POLICY applications_update_policy ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        p.role IN ('Admin', 'IT') OR
        (p.role IN ('Staff', 'Front Office') AND status IN ('DRAFT', 'INTAKE_REVIEW')) OR
        (p.role = 'Control' AND assigned_control_officer = p.id) OR
        (p.role = 'Director' AND status = 'DIRECTOR_REVIEW') OR
        (p.role = 'Minister' AND status = 'MINISTER_DECISION')
      )
    )
  );
```

### Document Security
```sql
-- Document access based on application access
CREATE POLICY documents_select_policy ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = application_id AND (
        p.role IN ('Admin', 'IT', 'Director', 'Minister') OR
        (p.role = 'Staff') OR
        (p.role = 'Front Office' AND a.created_by = p.id) OR
        (p.role = 'Control' AND a.assigned_control_officer = p.id)
      )
    )
  );

-- Document upload by authorized users
CREATE POLICY documents_insert_policy ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = application_id AND (
        p.role IN ('Admin', 'IT', 'Staff', 'Front Office') OR
        (p.role = 'Control' AND a.assigned_control_officer = p.id)
      )
    )
  );
```

### Control Visit Security
```sql
-- Control department access to visits
CREATE POLICY control_visits_select_policy ON control_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        p.role IN ('Admin', 'IT', 'Director', 'Minister') OR
        p.role = 'Control' OR
        assigned_officer = p.id
      )
    )
  );

-- Only control officers can create/update visits
CREATE POLICY control_visits_insert_policy ON control_visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Control')
    )
  );
```

### Audit Log Security
```sql
-- Audit logs are read-only for authorized roles
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Director')
    )
  );

-- No updates or deletes allowed on audit logs
CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE USING (false);
```

## Storage Configuration

### Bucket Setup
```sql
-- Documents bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Control photos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('control-photos', 'control-photos', false);
```

### Storage Policies
```sql
-- Document storage access
CREATE POLICY documents_storage_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents d
      JOIN applications a ON a.id = d.application_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE d.file_path = name AND (
        p.role IN ('Admin', 'IT', 'Director', 'Minister') OR
        (p.role = 'Staff') OR
        (p.role = 'Front Office' AND a.created_by = p.id) OR
        (p.role = 'Control' AND a.assigned_control_officer = p.id)
      )
    )
  );

-- Document upload permission
CREATE POLICY documents_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Staff', 'Front Office', 'Control')
    )
  );

-- Control photos access
CREATE POLICY control_photos_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'control-photos' AND
    EXISTS (
      SELECT 1 FROM control_photos cp
      JOIN applications a ON a.id = cp.application_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE cp.file_path = name AND (
        p.role IN ('Admin', 'IT', 'Director', 'Minister') OR
        p.role = 'Control' OR
        cp.taken_by = p.id
      )
    )
  );
```

## Edge Functions

### Audit Logging Function
```typescript
// supabase/functions/audit-log/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { action, entity_type, entity_id, old_values, new_values } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: req.headers.get('user-id'),
      session_id: req.headers.get('session-id'),
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address: req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent')
    })

  return new Response(JSON.stringify({ success: !error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Workflow State Machine
```typescript
// supabase/functions/workflow-transition/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { application_id, new_status, user_id } = await req.json()
  
  // Validate transition rules
  const isValidTransition = await validateTransition(application_id, new_status)
  
  if (!isValidTransition) {
    return new Response(JSON.stringify({ error: 'Invalid transition' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Update application status
  // Create automatic tasks
  // Send notifications
  // Log audit trail
  
  return new Response(JSON.stringify({ success: true }))
})
```

### SLA Monitoring
```typescript
// supabase/functions/sla-monitor/index.ts
// Cron job to check SLA deadlines and create escalation tasks
```

## Database Triggers

### Automatic Timestamping
```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Audit Trigger
```sql
-- Automatic audit logging for sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, entity_type, entity_id, old_values, new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to critical tables
CREATE TRIGGER applications_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Performance Optimization

### Indexes
```sql
-- Application search indexes
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_number ON applications(application_number);

-- Document search indexes
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(verification_status);

-- Audit log performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Task management indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Data Retention Policies
```sql
-- Partition audit logs by month for performance
CREATE TABLE audit_logs_template (LIKE audit_logs INCLUDING ALL);

-- Create monthly partitions via cron job
-- Archive old partitions to cold storage
```

## Backup & Recovery

### Automated Backups
- Daily full database backups
- Continuous WAL archiving
- Point-in-time recovery capability
- Cross-region backup replication

### Testing Procedures
- Monthly restore testing
- Data integrity verification
- Performance benchmarking
- Disaster recovery drills