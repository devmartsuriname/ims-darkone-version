import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreateApplicationRequest {
  applicant: {
    first_name: string;
    last_name: string;
    national_id: string;
    email?: string;
    phone?: string;
    address?: string;
    district?: string;
    marital_status?: string;
    nationality?: string;
    date_of_birth?: string;
    household_size?: number;
    children_count?: number;
    monthly_income?: number;
    spouse_income?: number;
    employment_status?: string;
    employer_name?: string;
  };
  application: {
    service_type: string;
    property_address?: string;
    property_district?: string;
    property_type?: string;
    title_type?: string;
    ownership_status?: string;
    property_surface_area?: number;
    requested_amount?: number;
    reason_for_request?: string;
    special_circumstances?: string;
  };
}

interface UpdateApplicationStateRequest {
  application_id: string;
  new_state: string;
  notes?: string;
  assigned_to?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        if (path === 'create') {
          return await createApplication(req, user.id);
        } else if (path === 'update-state') {
          return await updateApplicationState(req, user.id);
        }
        break;
      case 'GET':
        if (path === 'list') {
          return await listApplications(req, user.id);
        } else if (path && path !== 'application-service') {
          return await getApplication(path, user.id);
        }
        break;
      case 'PUT':
        if (path && path !== 'application-service') {
          return await updateApplication(req, path, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in application-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createApplication(req: Request, userId: string): Promise<Response> {
  const { applicant, application }: CreateApplicationRequest = await req.json();

  // Generate application number
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  const application_number = `SUB-${timestamp}-${random}`.toUpperCase();

  // Create applicant first
  const { data: applicantData, error: applicantError } = await supabase
    .from('applicants')
    .insert([applicant])
    .select('id')
    .single();

  if (applicantError) {
    throw new Error(`Failed to create applicant: ${applicantError.message}`);
  }

  // Create application
  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .insert([{
      ...application,
      application_number,
      applicant_id: applicantData.id,
      created_by: userId,
      current_state: 'DRAFT',
      priority_level: 3,
      sla_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }])
    .select('*')
    .single();

  if (applicationError) {
    throw new Error(`Failed to create application: ${applicationError.message}`);
  }

  // Create initial workflow step
  const { error: stepError } = await supabase
    .from('application_steps')
    .insert([{
      application_id: applicationData.id,
      step_name: 'DRAFT',
      started_at: new Date().toISOString(),
      sla_hours: 72,
    }]);

  if (stepError) {
    console.error('Failed to create initial step:', stepError);
  }

  // Create audit log
  await logAuditEvent('INSERT', 'applications', applicationData.id, null, applicationData, userId);

  return new Response(JSON.stringify({
    message: 'Application created successfully',
    application: applicationData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateApplicationState(req: Request, userId: string): Promise<Response> {
  const { application_id, new_state, notes, assigned_to }: UpdateApplicationStateRequest = await req.json();

  // Get current application
  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', application_id)
    .single();

  if (fetchError) {
    throw new Error(`Application not found: ${fetchError.message}`);
  }

  // Update application state
  const updateData: any = {
    current_state: new_state,
    updated_at: new Date().toISOString(),
  };

  if (assigned_to) {
    updateData.assigned_to = assigned_to;
  }

  if (new_state === 'COMPLETED') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', application_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  // Complete current step and create new step
  const { error: completeStepError } = await supabase
    .from('application_steps')
    .update({
      completed_at: new Date().toISOString(),
      is_active: false,
      notes,
    })
    .eq('application_id', application_id)
    .eq('is_active', true);

  if (completeStepError) {
    console.error('Failed to complete current step:', completeStepError);
  }

  // Create new step
  const slaHours = getSLAHours(new_state);
  const { error: newStepError } = await supabase
    .from('application_steps')
    .insert([{
      application_id,
      step_name: new_state,
      started_at: new Date().toISOString(),
      assigned_to,
      sla_hours,
    }]);

  if (newStepError) {
    console.error('Failed to create new step:', newStepError);
  }

  // Create audit log
  await logAuditEvent('UPDATE', 'applications', application_id, currentApp, updatedApp, userId);

  return new Response(JSON.stringify({
    message: 'Application state updated successfully',
    application: updatedApp
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listApplications(req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status');
  const assigned_to = url.searchParams.get('assigned_to');

  let query = supabase
    .from('applications')
    .select(`
      *,
      applicants!inner(*),
      application_steps!inner(*)
    `)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('current_state', status);
  }

  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return new Response(JSON.stringify({
    applications: data,
    pagination: { page, limit, total: data?.length || 0 }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getApplication(applicationId: string, userId: string): Promise<Response> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      applicants(*),
      application_steps(*),
      documents(*),
      control_visits(*),
      technical_reports(*),
      social_reports(*)
    `)
    .eq('id', applicationId)
    .single();

  if (error) {
    throw new Error(`Application not found: ${error.message}`);
  }

  return new Response(JSON.stringify({ application: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateApplication(req: Request, applicationId: string, userId: string): Promise<Response> {
  const updateData = await req.json();

  const { data: currentApp, error: fetchError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchError) {
    throw new Error(`Application not found: ${fetchError.message}`);
  }

  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  // Create audit log
  await logAuditEvent('UPDATE', 'applications', applicationId, currentApp, updatedApp, userId);

  return new Response(JSON.stringify({
    message: 'Application updated successfully',
    application: updatedApp
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function logAuditEvent(
  operation: string,
  tableName: string,
  recordId: string,
  oldValues: any,
  newValues: any,
  userId: string
) {
  try {
    await supabase.from('audit_logs').insert([{
      operation,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      user_id: userId,
    }]);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

function getSLAHours(state: string): number {
  const slaMapping: Record<string, number> = {
    'DRAFT': 72,
    'INTAKE_REVIEW': 48,
    'CONTROL_ASSIGN': 24,
    'CONTROL_VISIT_SCHEDULED': 168, // 1 week
    'CONTROL_IN_PROGRESS': 72,
    'TECHNICAL_REVIEW': 120, // 5 days
    'SOCIAL_REVIEW': 120, // 5 days
    'DIRECTOR_REVIEW': 168, // 1 week
    'MINISTER_DECISION': 240, // 10 days
    'CLOSURE': 0,
  };
  return slaMapping[state] || 72;
}