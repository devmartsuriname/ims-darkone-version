import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const allowedOrigins = [
  'https://preview--ims-darkone-version.lovable.app',
  'https://ims-darkone-version.lovable.app',
  'http://localhost:5173'
];

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Workflow state machine definition
const WORKFLOW_STATES = {
  DRAFT: {
    next: ['INTAKE_REVIEW'],
    roles: ['admin', 'it', 'staff', 'front_office']
  },
  INTAKE_REVIEW: {
    next: ['CONTROL_ASSIGN', 'REJECTED'],
    roles: ['admin', 'it', 'staff', 'front_office']
  },
  CONTROL_ASSIGN: {
    next: ['CONTROL_VISIT_SCHEDULED'],
    roles: ['admin', 'it', 'control']
  },
  CONTROL_VISIT_SCHEDULED: {
    next: ['CONTROL_IN_PROGRESS'],
    roles: ['admin', 'it', 'control']
  },
  CONTROL_IN_PROGRESS: {
    next: ['TECHNICAL_REVIEW', 'SOCIAL_REVIEW'],
    roles: ['admin', 'it', 'control']
  },
  TECHNICAL_REVIEW: {
    next: ['DIRECTOR_REVIEW', 'NEEDS_MORE_INFO'],
    roles: ['admin', 'it', 'staff', 'control']
  },
  SOCIAL_REVIEW: {
    next: ['DIRECTOR_REVIEW', 'NEEDS_MORE_INFO'],
    roles: ['admin', 'it', 'staff']
  },
  DIRECTOR_REVIEW: {
    next: ['MINISTER_DECISION', 'REJECTED', 'NEEDS_MORE_INFO'],
    roles: ['admin', 'it', 'director']
  },
  MINISTER_DECISION: {
    next: ['CLOSURE', 'REJECTED'],
    roles: ['admin', 'it', 'minister']
  },
  CLOSURE: {
    next: [],
    roles: ['admin', 'it']
  },
  REJECTED: {
    next: [],
    roles: ['admin', 'it']
  },
  ON_HOLD: {
    next: ['INTAKE_REVIEW', 'CONTROL_ASSIGN', 'TECHNICAL_REVIEW', 'SOCIAL_REVIEW', 'DIRECTOR_REVIEW'],
    roles: ['admin', 'it', 'director']
  },
  NEEDS_MORE_INFO: {
    next: ['INTAKE_REVIEW'],
    roles: ['admin', 'it', 'staff', 'front_office']
  }
};

interface TransitionRequest {
  application_id: string;
  target_state: string;
  notes?: string;
  assigned_to?: string;
}

interface CreateTaskRequest {
  application_id: string;
  task_type: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: number;
  due_date?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // Parse body once
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (err) {
      console.error('Failed to parse request body:', err);
    }

    // Health check (supports both 'health_check' and 'health-check')
    if (body.action === 'health_check' || body.action === 'health-check') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        service: 'workflow-service',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authentication
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

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        if (path === 'transition') {
          return await transitionState(body, user.id);
        } else if (path === 'create-task') {
          return await createTask(body, user.id);
        } else if (path === 'validate-transition') {
          return await validateTransition(body, user.id);
        }
        break;
      case 'GET':
        if (path === 'available-transitions') {
          return await getAvailableTransitions(url, user.id);
        } else if (path === 'workflow-status') {
          return await getWorkflowStatus(url, user.id);
        } else if (path === 'tasks') {
          return await getTasks(url, user.id);
        }
        break;
      case 'PUT':
        if (path === 'complete-task') {
          return await completeTask(body, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in workflow-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function transitionState(data: TransitionRequest, userId: string): Promise<Response> {
  const { application_id, target_state, notes, assigned_to } = data;

  // Get current application state
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('current_state, assigned_to')
    .eq('id', application_id)
    .single();

  if (appError) {
    throw new Error(`Application not found: ${appError.message}`);
  }

  // Validate transition
  const validationResult = await validateStateTransition(
    application.current_state,
    target_state,
    userId
  );

  if (!validationResult.valid) {
    throw new Error(validationResult.reason);
  }

  // Perform pre-transition validations
  const preValidation = await performPreTransitionValidations(application_id, target_state);
  if (!preValidation.valid) {
    throw new Error(preValidation.reason);
  }

  // Update application state
  const { data: updatedApp, error: updateError } = await supabase
    .from('applications')
    .update({
      current_state: target_state,
      assigned_to: assigned_to || application.assigned_to,
      updated_at: new Date().toISOString(),
    })
    .eq('id', application_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  // Complete current application step
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

  // Create new application step
  const slaHours = getSLAHours(target_state);
  const { error: newStepError } = await supabase
    .from('application_steps')
    .insert([{
      application_id,
      step_name: target_state,
      started_at: new Date().toISOString(),
      assigned_to: assigned_to,
      sla_hours: slaHours,
    }]);

  if (newStepError) {
    console.error('Failed to create new step:', newStepError);
  }

  // Create automatic tasks based on state
  await createAutomaticTasks(application_id, target_state, assigned_to);

  // Send notifications for state transition
  await sendStateTransitionNotifications(application_id, application.current_state, target_state, authHeader, assigned_to);

  // Create audit log
  await logWorkflowEvent(application_id, application.current_state, target_state, userId, notes);

  return new Response(JSON.stringify({
    message: 'State transition completed successfully',
    application: updatedApp
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function validateTransition(data: any, userId: string): Promise<Response> {
  const { application_id, target_state } = data;

  // Get current application state
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('current_state')
    .eq('id', application_id)
    .single();

  if (appError) {
    throw new Error(`Application not found: ${appError.message}`);
  }

  // Validate transition
  const validationResult = await validateStateTransition(
    application.current_state,
    target_state,
    userId
  );

  // Perform pre-transition validations
  const preValidation = await performPreTransitionValidations(application_id, target_state);

  return new Response(JSON.stringify({
    valid: validationResult.valid && preValidation.valid,
    reasons: [
      ...(validationResult.valid ? [] : [validationResult.reason]),
      ...(preValidation.valid ? [] : [preValidation.reason])
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getAvailableTransitions(url: URL, userId: string): Promise<Response> {
  const application_id = url.searchParams.get('application_id');

  if (!application_id) {
    throw new Error('Application ID is required');
  }

  // Get current application state
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('current_state')
    .eq('id', application_id)
    .single();

  if (appError) {
    throw new Error(`Application not found: ${appError.message}`);
  }

  const currentState = application.current_state;
  const availableStates = (WORKFLOW_STATES as any)[currentState]?.next || [];
  
  const validTransitions = [];
  for (const state of availableStates) {
    const validation = await validateStateTransition(currentState, state, userId);
    if (validation.valid) {
      validTransitions.push({
        state,
        label: formatStateName(state),
        requirements: getStateRequirements(state)
      });
    }
  }

  return new Response(JSON.stringify({
    current_state: currentState,
    available_transitions: validTransitions
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getWorkflowStatus(url: URL, userId: string): Promise<Response> {
  const application_id = url.searchParams.get('application_id');

  if (!application_id) {
    throw new Error('Application ID is required');
  }

  // Get application with all workflow steps
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select(`
      *,
      application_steps(*)
    `)
    .eq('id', application_id)
    .single();

  if (appError) {
    throw new Error(`Application not found: ${appError.message}`);
  }

  // Calculate progress
  const totalSteps = Object.keys(WORKFLOW_STATES).length - 2; // Exclude REJECTED and ON_HOLD
  const completedSteps = application.application_steps.filter((step: any) => step.completed_at).length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return new Response(JSON.stringify({
    application_id,
    current_state: application.current_state,
    progress,
    completed_steps: completedSteps,
    total_steps: totalSteps,
    workflow_history: application.application_steps.sort((a: any, b: any) => 
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    )
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createTask(taskData: CreateTaskRequest, userId: string): Promise<Response> {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert([{
      ...taskData,
      assigned_by: userId,
      status: 'PENDING',
      auto_generated: false,
    }])
    .select('*')
    .single();

  if (taskError) {
    throw new Error(`Failed to create task: ${taskError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Task created successfully',
    task
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getTasks(url: URL, userId: string): Promise<Response> {
  const application_id = url.searchParams.get('application_id');
  const assigned_to = url.searchParams.get('assigned_to');
  const status = url.searchParams.get('status');

  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (application_id) {
    query = query.eq('application_id', application_id);
  }

  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return new Response(JSON.stringify({ tasks: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function completeTask(data: any, userId: string): Promise<Response> {
  const { task_id, notes } = data;

  const { data: existingTask, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', task_id)
    .single();

  if (fetchError || !existingTask) {
    throw new Error(`Task not found: ${fetchError?.message}`);
  }

  const { data: task, error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      description: notes ? `${existingTask.description}\n\nCompletion Notes: ${notes}` : existingTask.description,
    })
    .eq('id', task_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to complete task: ${updateError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Task completed successfully',
    task
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
async function validateStateTransition(currentState: string, targetState: string, userId: string): Promise<{valid: boolean, reason: string}> {
  if (!(WORKFLOW_STATES as any)[currentState]?.next.includes(targetState)) {
    return { valid: false, reason: `Transition from ${currentState} to ${targetState} is not allowed` };
  }

  const { data: userRole, error: roleError } = await supabase
    .rpc('get_current_user_role');

  if (roleError || !userRole) {
    return { valid: false, reason: 'Unable to determine user role' };
  }

  if (!(WORKFLOW_STATES as any)[targetState].roles.includes(userRole)) {
    return { valid: false, reason: `User role ${userRole} is not authorized for this transition` };
  }

  return { valid: true, reason: '' };
}

async function performPreTransitionValidations(applicationId: string, targetState: string): Promise<{valid: boolean, reason: string}> {
  if (targetState === 'DIRECTOR_REVIEW') {
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('verification_status, document_type, document_name')
      .eq('application_id', applicationId)
      .eq('is_required', true);

    if (docError) {
      return { valid: false, reason: 'Error checking document verification status' };
    }

    const unverifiedDocs = documents?.filter(doc => doc.verification_status !== 'VERIFIED') || [];
    if (unverifiedDocs.length > 0) {
      const docNames = unverifiedDocs.map(doc => doc.document_name).join(', ');
      return { valid: false, reason: `Required documents not verified: ${docNames}` };
    }

    const { data: photos, error: photoError } = await supabase
      .from('control_photos')
      .select('id, photo_category')
      .eq('application_id', applicationId);

    if (photoError) {
      return { valid: false, reason: 'Error checking control visit photos' };
    }

    if (!photos || photos.length < 8) {
      return { valid: false, reason: `Minimum 8 photos required from control visit (currently ${photos?.length || 0})` };
    }

    const requiredCategories = ['EXTERIOR_FRONT', 'INTERIOR_MAIN', 'STRUCTURAL_ISSUES', 'UTILITIES'];
    const photoCategories = photos.map(p => p.photo_category);
    const missingCategories = requiredCategories.filter(cat => !photoCategories.includes(cat));
    
    if (missingCategories.length > 0) {
      return { valid: false, reason: `Missing required photo categories: ${missingCategories.join(', ')}` };
    }

    const { data: techReport, error: techError } = await supabase
      .from('technical_reports')
      .select('id, technical_conclusion, recommendations, submitted_at')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (techError) {
      return { valid: false, reason: 'Error checking technical report' };
    }

    if (!techReport) {
      return { valid: false, reason: 'Technical assessment report is required before director review' };
    }

    if (!techReport.technical_conclusion || !techReport.recommendations) {
      return { valid: false, reason: 'Technical report must include conclusion and recommendations' };
    }

    const { data: socialReport, error: socialError } = await supabase
      .from('social_reports')
      .select('id, social_conclusion, recommendations, submitted_at')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (socialError) {
      return { valid: false, reason: 'Error checking social report' };
    }

    if (!socialReport) {
      return { valid: false, reason: 'Social assessment report is required before director review' };
    }

    if (!socialReport.social_conclusion || !socialReport.recommendations) {
      return { valid: false, reason: 'Social report must include conclusion and recommendations' };
    }

    const { data: controlVisit, error: visitError } = await supabase
      .from('control_visits')
      .select('visit_status, actual_date')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (visitError) {
      return { valid: false, reason: 'Error checking control visit status' };
    }

    if (!controlVisit || controlVisit.visit_status !== 'COMPLETED') {
      return { valid: false, reason: 'Control visit must be completed before director review' };
    }
  }

  if (targetState === 'MINISTER_DECISION') {
    const { data: directorSteps, error: directorError } = await supabase
      .from('application_steps')
      .select('notes, completed_at')
      .eq('application_id', applicationId)
      .eq('step_name', 'DIRECTOR_REVIEW')
      .eq('status', 'COMPLETED')
      .maybeSingle();

    if (directorError) {
      return { valid: false, reason: 'Error checking director review status' };
    }

    if (!directorSteps || !directorSteps.notes) {
      return { valid: false, reason: 'Director recommendation is required before minister decision' };
    }
  }

  return { valid: true, reason: '' };
}

async function createAutomaticTasks(applicationId: string, state: string, assignedTo?: string): Promise<void> {
  const taskTemplates: Record<string, {title: string, description: string, priority: number}> = {
    'INTAKE_REVIEW': {
      title: 'Review Application Intake',
      description: 'Review and validate all application information and documents',
      priority: 3
    },
    'CONTROL_ASSIGN': {
      title: 'Assign Control Inspector',
      description: 'Assign a qualified inspector for property control visit',
      priority: 3
    },
    'CONTROL_VISIT_SCHEDULED': {
      title: 'Conduct Control Visit',
      description: 'Perform on-site property inspection and document findings',
      priority: 2
    },
    'TECHNICAL_REVIEW': {
      title: 'Prepare Technical Report',
      description: 'Analyze technical aspects and prepare comprehensive technical report',
      priority: 3
    },
    'SOCIAL_REVIEW': {
      title: 'Prepare Social Report',
      description: 'Assess social circumstances and prepare social impact report',
      priority: 3
    },
    'DIRECTOR_REVIEW': {
      title: 'Director Review and Recommendation',
      description: 'Review all reports and provide recommendation for ministerial decision',
      priority: 1
    },
    'MINISTER_DECISION': {
      title: 'Ministerial Decision Required',
      description: 'Final decision on subsidy application approval and amount',
      priority: 1
    }
  };

  const template = taskTemplates[state];
  if (!template) return;

  try {
    await supabase
      .from('tasks')
      .insert([{
        application_id: applicationId,
        task_type: 'WORKFLOW_STEP',
        title: template.title,
        description: template.description,
        assigned_to: assignedTo,
        priority: template.priority,
        auto_generated: true,
        status: 'PENDING',
      }]);
  } catch (error) {
    console.error('Failed to create automatic task:', error);
  }
}

async function logWorkflowEvent(
  applicationId: string,
  fromState: string,
  toState: string,
  userId: string,
  notes?: string
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([{
      operation: 'WORKFLOW_TRANSITION',
      table_name: 'applications',
      record_id: applicationId,
      old_values: { state: fromState },
      new_values: { state: toState, notes },
      user_id: userId,
    }]);
  } catch (error) {
    console.error('Failed to log workflow event:', error);
  }
}

function getSLAHours(state: string): number {
  const slaMapping: Record<string, number> = {
    'DRAFT': 72,
    'INTAKE_REVIEW': 48,
    'CONTROL_ASSIGN': 24,
    'CONTROL_VISIT_SCHEDULED': 168,
    'CONTROL_IN_PROGRESS': 72,
    'TECHNICAL_REVIEW': 120,
    'SOCIAL_REVIEW': 120,
    'DIRECTOR_REVIEW': 168,
    'MINISTER_DECISION': 240,
    'CLOSURE': 0,
  };
  return slaMapping[state] || 72;
}

function formatStateName(state: string): string {
  return state.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

function getStateRequirements(state: string): string[] {
  const requirements: Record<string, string[]> = {
    'DIRECTOR_REVIEW': [
      'All required documents verified',
      'Minimum 5 control photos uploaded',
      'Technical report submitted',
      'Social report submitted'
    ],
    'MINISTER_DECISION': [
      'Director recommendation provided'
    ]
  };
  return requirements[state] || [];
}

async function sendStateTransitionNotifications(
  applicationId: string, 
  fromState: string, 
  toState: string, 
  authToken: string,
  assignedTo?: string
): Promise<void> {
  try {
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        application_number,
        applicant_id,
        applicants!applicant_id (first_name, last_name)
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      console.error('Failed to fetch application for notifications:', error);
      return;
    }

    const applicantName = application.applicants && Array.isArray(application.applicants) && application.applicants.length > 0
      ? `${application.applicants[0].first_name} ${application.applicants[0].last_name}`
      : application.applicants && !Array.isArray(application.applicants)
      ? `${(application.applicants as any).first_name} ${(application.applicants as any).last_name}`
      : 'Unknown Applicant';

    if (assignedTo) {
      await supabase.functions.invoke('notification-service', {
        body: {
          type: 'in_app',
          recipients: [assignedTo],
          subject: 'Application Assignment',
          message: `Application ${application.application_number} (${applicantName}) has been assigned to you for ${formatStateName(toState)}`,
          data: {
            application_id: applicationId,
            category: 'APPLICATION',
            type: 'assignment'
          }
        },
        headers: { Authorization: authToken }
      });
    }

    const roleMap: Record<string, string> = {
      'CONTROL_ASSIGN': 'control',
      'TECHNICAL_REVIEW': 'staff',
      'SOCIAL_REVIEW': 'staff', 
      'DIRECTOR_REVIEW': 'director',
      'MINISTER_DECISION': 'minister'
    };

    const targetRole = roleMap[toState];
    if (targetRole) {
      await supabase.functions.invoke('notification-service', {
        body: {
          action: 'send_to_role',
          role: targetRole,
          title: 'New Application Assignment',
          message: `Application ${application.application_number} (${applicantName}) is now ready for ${formatStateName(toState)}`,
          type: 'INFO'
        },
        headers: { Authorization: authToken }
      });
    }

    console.log(`Notifications sent for state transition: ${fromState} → ${toState}`);
  } catch (error) {
    console.error('Failed to send state transition notifications:', error);
  }
}
