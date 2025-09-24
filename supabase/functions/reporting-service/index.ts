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

    if (req.method === 'GET') {
      switch (path) {
        case 'overview':
          return await getSystemOverview();
        case 'applications-stats':
          return await getApplicationsStats(req);
        case 'performance-metrics':
          return await getPerformanceMetrics(req);
        case 'user-activity':
          return await getUserActivity(req);
        case 'export':
          return await exportData(req, user.id);
        default:
          return await getBasicStats();
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in reporting-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getSystemOverview(): Promise<Response> {
  // Get counts for different entities
  const [
    applicationsResult,
    usersResult,
    tasksResult,
    documentsResult
  ] = await Promise.allSettled([
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true })
  ]);

  // Get applications by status
  const { data: statusBreakdown, error: statusError } = await supabase
    .from('applications')
    .select('current_state')
    .neq('current_state', null);

  if (statusError) {
    console.error('Failed to get status breakdown:', statusError);
  }

  const statusCounts = statusBreakdown?.reduce((acc, app) => {
    acc[app.current_state] = (acc[app.current_state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return new Response(JSON.stringify({
    overview: {
      total_applications: applicationsResult.status === 'fulfilled' ? applicationsResult.value.count : 0,
      total_users: usersResult.status === 'fulfilled' ? usersResult.value.count : 0,
      total_tasks: tasksResult.status === 'fulfilled' ? tasksResult.value.count : 0,
      total_documents: documentsResult.status === 'fulfilled' ? documentsResult.value.count : 0,
    },
    status_breakdown: statusCounts,
    last_updated: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getApplicationsStats(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '30'; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Applications created in period
  const { data: newApplications, error: newAppsError } = await supabase
    .from('applications')
    .select('created_at, current_state')
    .gte('created_at', startDate.toISOString());

  if (newAppsError) {
    console.error('Failed to fetch new applications:', newAppsError);
  }

  // Applications completed in period
  const { data: completedApplications, error: completedError } = await supabase
    .from('applications')
    .select('completed_at, current_state')
    .gte('completed_at', startDate.toISOString())
    .not('completed_at', 'is', null);

  if (completedError) {
    console.error('Failed to fetch completed applications:', completedError);
  }

  // Average processing time
  const { data: processingTimes, error: timesError } = await supabase
    .from('applications')
    .select('created_at, completed_at')
    .not('completed_at', 'is', null);

  if (timesError) {
    console.error('Failed to fetch processing times:', timesError);
  }

  const avgProcessingTime = processingTimes ? processingTimes.reduce((sum: number, app: any) => {
    const created = new Date(app.created_at);
    const completed = new Date(app.completed_at);
    return sum + (completed.getTime() - created.getTime());
  }, 0) / (processingTimes.length || 1) : 0;

  const avgDays = Math.round(avgProcessingTime / (1000 * 60 * 60 * 24));

  return new Response(JSON.stringify({
    period_days: parseInt(period),
    applications_created: newApplications?.length || 0,
    applications_completed: completedApplications?.length || 0,
    average_processing_days: avgDays,
    new_applications_by_day: groupByDay(newApplications || []),
    completed_applications_by_day: groupByDay(completedApplications || [], 'completed_at')
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getPerformanceMetrics(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '30';
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // SLA compliance
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('due_date, completed_at, status')
    .gte('created_at', startDate.toISOString());

  if (tasksError) {
    console.error('Failed to fetch tasks for SLA:', tasksError);
  }

  let onTimeCompletions = 0;
  let overdueCompletions = 0;
  let pendingOverdue = 0;

  tasks?.forEach(task => {
    if (task.status === 'COMPLETED' && task.completed_at && task.due_date) {
      if (new Date(task.completed_at) <= new Date(task.due_date)) {
        onTimeCompletions++;
      } else {
        overdueCompletions++;
      }
    } else if (task.status === 'PENDING' && task.due_date && new Date() > new Date(task.due_date)) {
      pendingOverdue++;
    }
  });

  const totalCompleted = onTimeCompletions + overdueCompletions;
  const slaCompliance = totalCompleted > 0 ? (onTimeCompletions / totalCompleted) * 100 : 100;

  // Document verification stats
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('verification_status, upload_date, verified_at')
    .gte('upload_date', startDate.toISOString());

  if (docsError) {
    console.error('Failed to fetch documents:', docsError);
  }

  const verificationStats = {
    verified: documents?.filter(d => d.verification_status === 'VERIFIED').length || 0,
    pending: documents?.filter(d => d.verification_status === 'PENDING').length || 0,
    rejected: documents?.filter(d => d.verification_status === 'REJECTED').length || 0,
  };

  return new Response(JSON.stringify({
    period_days: parseInt(period),
    sla_compliance_percentage: Math.round(slaCompliance),
    on_time_completions: onTimeCompletions,
    overdue_completions: overdueCompletions,
    pending_overdue: pendingOverdue,
    document_verification: verificationStats
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUserActivity(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '7';
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get recent audit logs
  const { data: auditLogs, error: auditError } = await supabase
    .from('audit_logs')
    .select(`
      operation,
      table_name,
      timestamp,
      profiles!user_id(first_name, last_name, email)
    `)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })
    .limit(100);

  if (auditError) {
    console.error('Failed to fetch audit logs:', auditError);
  }

  // Get active users by role
  const { data: activeUsers, error: usersError } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      user_roles!inner(role, is_active)
    `)
    .eq('is_active', true)
    .eq('user_roles.is_active', true);

  if (usersError) {
    console.error('Failed to fetch active users:', usersError);
  }

  const usersByRole = activeUsers?.reduce((acc, user) => {
    const role = user.user_roles[0]?.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return new Response(JSON.stringify({
    period_days: parseInt(period),
    recent_activities: auditLogs?.slice(0, 20) || [],
    users_by_role: usersByRole,
    total_active_users: activeUsers?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exportData(req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'applications';
  const format = url.searchParams.get('format') || 'json';

  // Check if user has proper permissions
  const { data: hasPermission, error: permError } = await supabase
    .rpc('is_admin_or_it');

  if (permError || !hasPermission) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions for data export' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let data: any[] = [];
  let filename = `export_${type}_${new Date().toISOString().split('T')[0]}`;

  switch (type) {
    case 'applications':
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          applicants(*),
          application_steps(*)
        `)
        .order('created_at', { ascending: false });

      if (appsError) {
        throw new Error(`Failed to export applications: ${appsError.message}`);
      }
      data = applications || [];
      break;

    case 'users':
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        throw new Error(`Failed to export users: ${usersError.message}`);
      }
      data = users || [];
      break;

    case 'audit':
      const { data: audit, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (auditError) {
        throw new Error(`Failed to export audit logs: ${auditError.message}`);
      }
      data = audit || [];
      break;

    default:
      throw new Error(`Unsupported export type: ${type}`);
  }

  if (format === 'csv') {
    const csv = convertToCSV(data);
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`
      },
    });
  }

  return new Response(JSON.stringify({
    export_type: type,
    format,
    record_count: data.length,
    exported_at: new Date().toISOString(),
    data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getBasicStats(): Promise<Response> {
  const { data: stats, error } = await supabase
    .rpc('get_system_stats');

  if (error) {
    console.error('Failed to get basic stats:', error);
  }

  return new Response(JSON.stringify({
    message: 'Reporting service is operational',
    timestamp: new Date().toISOString(),
    basic_stats: stats || {}
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
function groupByDay(data: any[], dateField = 'created_at'): Record<string, number> {
  return data.reduce((acc, item) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}