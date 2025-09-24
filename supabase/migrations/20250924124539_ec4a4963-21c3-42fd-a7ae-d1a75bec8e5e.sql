-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = _role 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_it()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'it')
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_applications()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'it', 'staff', 'front_office')
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_control_inspect()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'it', 'control')
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_review_applications()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'it', 'staff', 'director', 'minister')
    AND is_active = true
  );
$$;

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin/IT can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_it());

CREATE POLICY "Admin/IT can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin_or_it());

CREATE POLICY "Admin/IT can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin_or_it());

-- User roles table policies  
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin/IT can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin_or_it());

CREATE POLICY "Admin/IT can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin_or_it());

-- Applicants table policies
CREATE POLICY "Staff can view all applicants" ON public.applicants
  FOR SELECT USING (public.can_manage_applications());

CREATE POLICY "Staff can manage applicants" ON public.applicants
  FOR ALL USING (public.can_manage_applications());

-- Applications table policies
CREATE POLICY "Staff can view all applications" ON public.applications
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can create applications" ON public.applications
  FOR INSERT WITH CHECK (public.can_manage_applications());

CREATE POLICY "Staff can update applications" ON public.applications
  FOR UPDATE USING (public.can_manage_applications());

CREATE POLICY "Reviewers can update assigned applications" ON public.applications
  FOR UPDATE USING (
    public.can_review_applications() AND 
    (assigned_to = auth.uid() OR public.is_admin_or_it())
  );

CREATE POLICY "Admin/IT can delete applications" ON public.applications
  FOR DELETE USING (public.is_admin_or_it());

-- Application steps table policies
CREATE POLICY "Staff can view application steps" ON public.application_steps
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can manage application steps" ON public.application_steps
  FOR ALL USING (public.can_manage_applications());

CREATE POLICY "Assigned users can update their steps" ON public.application_steps
  FOR UPDATE USING (
    public.can_review_applications() AND 
    (assigned_to = auth.uid() OR public.is_admin_or_it())
  );

-- Documents table policies
CREATE POLICY "Staff can view documents" ON public.documents
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can manage documents" ON public.documents
  FOR ALL USING (public.can_manage_applications());

CREATE POLICY "Control can verify documents" ON public.documents
  FOR UPDATE USING (public.can_control_inspect() OR public.can_review_applications());

-- Control visits table policies
CREATE POLICY "Control can view all visits" ON public.control_visits
  FOR SELECT USING (public.can_control_inspect() OR public.can_review_applications());

CREATE POLICY "Control can manage visits" ON public.control_visits
  FOR ALL USING (public.can_control_inspect());

CREATE POLICY "Assigned inspectors can update visits" ON public.control_visits
  FOR UPDATE USING (
    public.can_control_inspect() AND 
    (assigned_inspector = auth.uid() OR public.is_admin_or_it())
  );

-- Control photos table policies
CREATE POLICY "Control can view photos" ON public.control_photos
  FOR SELECT USING (public.can_control_inspect() OR public.can_review_applications());

CREATE POLICY "Control can manage photos" ON public.control_photos
  FOR ALL USING (public.can_control_inspect());

CREATE POLICY "Photo takers can manage their photos" ON public.control_photos
  FOR ALL USING (
    public.can_control_inspect() AND 
    (taken_by = auth.uid() OR public.is_admin_or_it())
  );

-- Technical reports table policies
CREATE POLICY "Staff can view technical reports" ON public.technical_reports
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Control can create technical reports" ON public.technical_reports
  FOR INSERT WITH CHECK (public.can_control_inspect());

CREATE POLICY "Inspector can update own reports" ON public.technical_reports
  FOR UPDATE USING (
    public.can_control_inspect() AND 
    (inspector_id = auth.uid() OR public.is_admin_or_it())
  );

CREATE POLICY "Reviewers can approve reports" ON public.technical_reports
  FOR UPDATE USING (public.can_review_applications());

CREATE POLICY "Admin/IT can delete technical reports" ON public.technical_reports
  FOR DELETE USING (public.is_admin_or_it());

-- Social reports table policies
CREATE POLICY "Staff can view social reports" ON public.social_reports
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can create social reports" ON public.social_reports
  FOR INSERT WITH CHECK (public.can_manage_applications());

CREATE POLICY "Social worker can update own reports" ON public.social_reports
  FOR UPDATE USING (
    public.can_manage_applications() AND 
    (social_worker_id = auth.uid() OR public.is_admin_or_it())
  );

CREATE POLICY "Reviewers can approve social reports" ON public.social_reports
  FOR UPDATE USING (public.can_review_applications());

CREATE POLICY "Admin/IT can delete social reports" ON public.social_reports
  FOR DELETE USING (public.is_admin_or_it());

-- Income records table policies
CREATE POLICY "Staff can view income records" ON public.income_records
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can manage income records" ON public.income_records
  FOR ALL USING (public.can_manage_applications());

CREATE POLICY "Verifiers can verify income" ON public.income_records
  FOR UPDATE USING (public.can_review_applications());

-- Tasks table policies
CREATE POLICY "Users can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    public.can_manage_applications() OR 
    public.can_review_applications()
  );

CREATE POLICY "Staff can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (public.can_manage_applications());

CREATE POLICY "Assigned users can update tasks" ON public.tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    public.can_manage_applications()
  );

CREATE POLICY "Admin/IT can delete tasks" ON public.tasks
  FOR DELETE USING (public.is_admin_or_it());

-- Audit logs table policies (read-only for most, admin access)
CREATE POLICY "Admin/IT can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin_or_it());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Reference data table policies
CREATE POLICY "All authenticated users can view reference data" ON public.reference_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin/IT can manage reference data" ON public.reference_data
  FOR ALL USING (public.is_admin_or_it());

-- Attachments table policies
CREATE POLICY "Staff can view attachments" ON public.attachments
  FOR SELECT USING (public.can_manage_applications() OR public.can_review_applications());

CREATE POLICY "Staff can manage attachments" ON public.attachments
  FOR ALL USING (public.can_manage_applications());

CREATE POLICY "Uploaders can manage their attachments" ON public.attachments
  FOR ALL USING (
    uploaded_by = auth.uid() OR 
    public.can_manage_applications()
  );

-- Outbox events table policies (system use)
CREATE POLICY "Admin/IT can view outbox events" ON public.outbox_events
  FOR SELECT USING (public.is_admin_or_it());

CREATE POLICY "System can manage outbox events" ON public.outbox_events
  FOR ALL USING (public.is_admin_or_it());

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  -- Assign default 'applicant' role to new users
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (new.id, 'applicant', new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();