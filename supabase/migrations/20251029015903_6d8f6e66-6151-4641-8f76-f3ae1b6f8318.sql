-- Performance Optimization: Add Strategic Indexes
-- This migration adds indexes to frequently queried columns for better performance

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_current_state ON applications(current_state) WHERE current_state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_assigned_to ON applications(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_sla_deadline ON applications(sla_deadline) WHERE sla_deadline IS NOT NULL AND completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);

-- Application steps indexes
CREATE INDEX IF NOT EXISTS idx_application_steps_application_id ON application_steps(application_id);
CREATE INDEX IF NOT EXISTS idx_application_steps_is_active ON application_steps(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_application_steps_assigned_to ON application_steps(assigned_to) WHERE assigned_to IS NOT NULL;

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_verification_status ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Control visits indexes
CREATE INDEX IF NOT EXISTS idx_control_visits_application_id ON control_visits(application_id);
CREATE INDEX IF NOT EXISTS idx_control_visits_assigned_inspector ON control_visits(assigned_inspector);
CREATE INDEX IF NOT EXISTS idx_control_visits_scheduled_date ON control_visits(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_control_visits_status ON control_visits(visit_status);

-- Control photos indexes
CREATE INDEX IF NOT EXISTS idx_control_photos_control_visit_id ON control_photos(control_visit_id);
CREATE INDEX IF NOT EXISTS idx_control_photos_application_id ON control_photos(application_id);
CREATE INDEX IF NOT EXISTS idx_control_photos_taken_by ON control_photos(taken_by);

-- Technical reports indexes
CREATE INDEX IF NOT EXISTS idx_technical_reports_application_id ON technical_reports(application_id);
CREATE INDEX IF NOT EXISTS idx_technical_reports_control_visit_id ON technical_reports(control_visit_id);
CREATE INDEX IF NOT EXISTS idx_technical_reports_inspector_id ON technical_reports(inspector_id);

-- Social reports indexes
CREATE INDEX IF NOT EXISTS idx_social_reports_application_id ON social_reports(application_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_social_worker_id ON social_reports(social_worker_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_application_id ON tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL AND status != 'COMPLETED';

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_application_id ON notifications(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active) WHERE is_active = true;

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_applications_state_assigned ON applications(current_state, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- Comment on optimization strategy
COMMENT ON INDEX idx_applications_sla_deadline IS 'Optimizes queries for applications with pending SLA deadlines';
COMMENT ON INDEX idx_tasks_due_date IS 'Optimizes queries for incomplete tasks with due dates';
COMMENT ON INDEX idx_notifications_recipient_unread IS 'Optimizes queries for unread notifications per user';