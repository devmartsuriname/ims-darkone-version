-- ✅ Phase 2: RLS Performance Optimization
-- Create cached role helper function for efficient RLS checks

-- 1. Create cached role retrieval function
CREATE OR REPLACE FUNCTION public.get_user_roles_cached(user_id_param UUID)
RETURNS TABLE(role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM user_roles ur
  WHERE ur.user_id = user_id_param
    AND ur.is_active = true;
END;
$$;

-- 2. Add performance indexes on hot columns
CREATE INDEX IF NOT EXISTS idx_user_roles_user_active 
  ON user_roles(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_active 
  ON user_roles(role, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_profiles_id 
  ON profiles(id);

CREATE INDEX IF NOT EXISTS idx_applications_state 
  ON applications(current_state);

CREATE INDEX IF NOT EXISTS idx_applications_assigned 
  ON applications(assigned_to) 
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_state_assigned 
  ON applications(current_state, assigned_to);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
  ON notifications(recipient_id, read_at) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_documents_application 
  ON documents(application_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned 
  ON tasks(assigned_to, status) 
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_control_visits_application 
  ON control_visits(application_id);

-- 3. Optimize existing helper functions to use the cached function
CREATE OR REPLACE FUNCTION public.is_admin_or_it()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 'admin'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'it'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())));
$$;

CREATE OR REPLACE FUNCTION public.can_manage_applications()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 'admin'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'it'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'staff'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'front_office'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())));
$$;

CREATE OR REPLACE FUNCTION public.can_control_inspect()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 'admin'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'it'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'control'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())));
$$;

CREATE OR REPLACE FUNCTION public.can_review_applications()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 'admin'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'it'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'staff'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'director'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'minister'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())));
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_roles_cached IS 'Returns all active roles for a given user. Used for efficient RLS policy checks.';
COMMENT ON INDEX idx_user_roles_user_active IS 'Phase 2: Optimize role lookups in RLS policies';
COMMENT ON INDEX idx_applications_state_assigned IS 'Phase 2: Optimize application queries by state and assignment';