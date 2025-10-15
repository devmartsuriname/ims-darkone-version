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

  // ✅ Health check BEFORE authentication
  const body = await req.json().catch(() => ({}));
  if (body.action === 'health_check') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      service: 'reporting-service',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
      if (path === 'workflow-metrics') {
        return await getWorkflowMetrics();
      } else if (path === 'sla-report') {
        return await getSLAReport();
      } else if (path === 'bottleneck-analysis') {
        return await getBottleneckAnalysis();
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

async function getWorkflowMetrics(): Promise<Response> {
  // Get all applications with their states
  const { data: applications, error: appError } = await supabase
    .from('applications')
    .select('id, current_state, created_at, completed_at, sla_deadline');

  if (appError) throw appError;

  // Get tasks for SLA tracking
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('id, status, due_date, completed_at, sla_hours');

  if (taskError) throw taskError;

  // Calculate metrics
  const totalApplications = applications?.length || 0;
  const completedApplications = applications?.filter(app => 
    app.current_state === 'CLOSURE' && app.completed_at
  ) || [];

  const activeWorkflows = applications?.filter(app => 
    !['CLOSURE', 'REJECTED'].includes(app.current_state || '')
  ).length || 0;

  // Average processing time in days
  const avgProcessingTime = completedApplications.length > 0
    ? completedApplications.reduce((sum, app) => {
        if (app.created_at && app.completed_at) {
          const start = new Date(app.created_at).getTime();
          const end = new Date(app.completed_at).getTime();
          return sum + (end - start);
        }
        return sum;
      }, 0) / completedApplications.length / (1000 * 60 * 60 * 24)
    : 0;

  // SLA compliance
  const completedTasks = tasks?.filter(t => t.completed_at) || [];
  const tasksWithinSLA = completedTasks.filter(task => {
    if (!task.due_date || !task.completed_at) return true;
    return new Date(task.completed_at) <= new Date(task.due_date);
  });

  const slaCompliance = completedTasks.length > 0
    ? (tasksWithinSLA.length / completedTasks.length) * 100
    : 100;

  // Completion rate
  const completionRate = totalApplications > 0
    ? (completedApplications.length / totalApplications) * 100
    : 0;

  return new Response(JSON.stringify({
    averageProcessingTime: Math.round(avgProcessingTime * 10) / 10,
    slaCompliance: Math.round(slaCompliance * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10,
    activeWorkflows,
    totalApplications,
    completedApplications: completedApplications.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getSLAReport(): Promise<Response> {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, task_type, status, due_date, completed_at, sla_hours')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const report = (tasks || []).map(task => {
    const isCompleted = task.completed_at !== null;
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const completedDate = task.completed_at ? new Date(task.completed_at) : null;
    
    let slaStatus = 'PENDING';
    if (isCompleted && dueDate && completedDate) {
      slaStatus = completedDate <= dueDate ? 'MET' : 'VIOLATED';
    } else if (!isCompleted && dueDate && new Date() > dueDate) {
      slaStatus = 'AT_RISK';
    }

    return {
      ...task,
      slaStatus
    };
  });

  const summary = {
    total: report.length,
    met: report.filter(r => r.slaStatus === 'MET').length,
    violated: report.filter(r => r.slaStatus === 'VIOLATED').length,
    atRisk: report.filter(r => r.slaStatus === 'AT_RISK').length,
    pending: report.filter(r => r.slaStatus === 'PENDING').length
  };

  return new Response(JSON.stringify({ report, summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getBottleneckAnalysis(): Promise<Response> {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('id, current_state, created_at')
    .in('current_state', ['CONTROL_ASSIGN', 'TECHNICAL_REVIEW', 'SOCIAL_REVIEW', 'DIRECTOR_REVIEW']);

  if (error) throw error;

  const bottlenecks = (applications || []).reduce((acc, app) => {
    if (!app.current_state) return acc;
    
    const state = app.current_state;
    if (!acc[state]) {
      acc[state] = { count: 0, avgDaysInState: 0, applications: [] };
    }
    
    const daysInState = app.created_at 
      ? (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    
    acc[state].count++;
    acc[state].avgDaysInState += daysInState;
    acc[state].applications.push(app.id);
    
    return acc;
  }, {} as Record<string, { count: number; avgDaysInState: number; applications: string[] }>);

  // Calculate averages
  Object.keys(bottlenecks).forEach(state => {
    bottlenecks[state].avgDaysInState = 
      Math.round((bottlenecks[state].avgDaysInState / bottlenecks[state].count) * 10) / 10;
  });

  return new Response(JSON.stringify({ bottlenecks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
