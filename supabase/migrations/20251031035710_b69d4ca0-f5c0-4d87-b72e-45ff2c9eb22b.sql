-- Create function to check if user can view all applications
CREATE OR REPLACE FUNCTION public.can_view_all_applications()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 'admin'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'it'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())))
    OR 'staff'::app_role = ANY(ARRAY(SELECT get_user_roles_cached(auth.uid())));
$$;

-- Update RLS policy to enforce role-based visibility
DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;

CREATE POLICY "Staff can view all applications"
ON public.applications FOR SELECT
USING (
  can_view_all_applications()
  OR can_review_applications()
  OR (created_by = auth.uid())
);