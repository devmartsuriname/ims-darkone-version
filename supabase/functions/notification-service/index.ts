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

interface SendNotificationRequest {
  type: 'email' | 'sms' | 'in_app';
  recipients: string[];
  subject?: string;
  message: string;
  template?: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

interface CreateTaskNotificationRequest {
  task_id: string;
  type: 'assignment' | 'reminder' | 'overdue';
}

interface CreateApplicationNotificationRequest {
  application_id: string;
  type: 'status_change' | 'document_request' | 'approval' | 'rejection';
  message?: string;
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
        if (path === 'send') {
          return await sendNotification(req, user.id);
        } else if (path === 'send_to_role') {
          return await sendNotificationToRole(req, user.id);
        } else if (path === 'send_to_role') {
          return await sendNotificationToRole(req, user.id);
        } else if (path === 'task-notification') {
          return await createTaskNotification(req, user.id);
        } else if (path === 'application-notification') {
          return await createApplicationNotification(req, user.id);
        } else if (path === 'sla-reminders') {
          return await sendSLAReminders();
        }
        break;
      case 'GET':
        if (path === 'list') {
          return await listNotifications(req, user.id);
        } else if (path === 'user-notifications') {
          return await getUserNotifications(req, user.id);
        }
        break;
      case 'PUT':
        if (path === 'mark-read') {
          return await markNotificationsAsRead(req, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in notification-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendNotification(req: Request, userId: string): Promise<Response> {
  const notificationData: SendNotificationRequest = await req.json();

  // Process each recipient
  const results = [];
  for (const recipient of notificationData.recipients) {
    try {
      let result;
      switch (notificationData.type) {
        case 'email':
          result = await sendEmailNotification(recipient, notificationData);
          break;
        case 'sms':
          result = await sendSMSNotification(recipient, notificationData);
          break;
        case 'in_app':
          result = await sendInAppNotification(recipient, notificationData);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notificationData.type}`);
      }
      results.push({ recipient, success: true, result });
    } catch (error) {
      console.error(`Failed to send notification to ${recipient}:`, error);
      results.push({ recipient, success: false, error: (error as Error).message });
    }
  }

  return new Response(JSON.stringify({
    message: 'Notifications processed',
    results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createTaskNotification(req: Request, userId: string): Promise<Response> {
  const { task_id, type }: CreateTaskNotificationRequest = await req.json();

  // Get task details
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select(`
      *,
      applications!inner(application_number),
      profiles!assigned_to(email, first_name, last_name)
    `)
    .eq('id', task_id)
    .single();

  if (taskError) {
    throw new Error(`Task not found: ${taskError.message}`);
  }

  if (!task.assigned_to) {
    return new Response(JSON.stringify({
      message: 'No user assigned to this task'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const messages = {
    assignment: `You have been assigned a new task: ${task.title} for application ${task.applications.application_number}`,
    reminder: `Reminder: Task "${task.title}" for application ${task.applications.application_number} is due soon`,
    overdue: `OVERDUE: Task "${task.title}" for application ${task.applications.application_number} is past due date`
  };

  const message = messages[type] || 'Task notification';
  const priority = type === 'overdue' ? 'high' : 'normal';

  await sendInAppNotification(task.assigned_to, {
    type: 'in_app',
    recipients: [task.assigned_to],
    subject: `Task ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    message,
    priority,
    data: {
      task_id,
      application_id: task.application_id,
      type: 'task_notification'
    }
  });

  // If user has email, send email notification for high priority
  if (priority === 'high' && task.profiles?.email) {
    await sendEmailNotification(task.profiles.email, {
      type: 'email',
      recipients: [task.profiles.email],
      subject: `URGENT: Overdue Task - ${task.title}`,
      message,
      priority
    });
  }

  return new Response(JSON.stringify({
    message: 'Task notification sent successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createApplicationNotification(req: Request, userId: string): Promise<Response> {
  const { application_id, type, message }: CreateApplicationNotificationRequest = await req.json();

  // Get application details
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select(`
      *,
      applicants!inner(*),
      profiles!created_by(email, first_name, last_name)
    `)
    .eq('id', application_id)
    .single();

  if (appError) {
    throw new Error(`Application not found: ${appError.message}`);
  }

  const messages = {
    status_change: message || `Application ${application.application_number} status has been updated to ${application.current_state}`,
    document_request: message || `Additional documents are required for application ${application.application_number}`,
    approval: message || `Congratulations! Application ${application.application_number} has been approved`,
    rejection: message || `Application ${application.application_number} has been rejected`
  };

  const finalMessage = messages[type] || message || 'Application update';
  const priority = ['approval', 'rejection'].includes(type) ? 'high' : 'normal';

  // Notify the application creator
  if (application.created_by) {
    await sendInAppNotification(application.created_by, {
      type: 'in_app',
      recipients: [application.created_by],
      subject: `Application ${type.replace('_', ' ').toUpperCase()}`,
      message: finalMessage,
      priority,
      data: {
        application_id,
        type: 'application_notification'
      }
    });
  }

  // For approval/rejection, also try to notify the applicant via email
  if (['approval', 'rejection'].includes(type) && application.applicants?.email) {
    await sendEmailNotification(application.applicants.email, {
      type: 'email',
      recipients: [application.applicants.email],
      subject: `Housing Subsidy Application ${type === 'approval' ? 'Approved' : 'Update'}`,
      message: finalMessage,
      priority
    });
  }

  return new Response(JSON.stringify({
    message: 'Application notification sent successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendSLAReminders(): Promise<Response> {
  // Get tasks approaching SLA deadline (within 24 hours)
  const { data: urgentTasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      *,
      applications!inner(application_number),
      profiles!assigned_to(email, first_name, last_name)
    `)
    .eq('status', 'PENDING')
    .not('assigned_to', 'is', null)
    .lt('due_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

  if (tasksError) {
    throw new Error(`Failed to fetch urgent tasks: ${tasksError.message}`);
  }

  let notificationsSent = 0;
  
  for (const task of urgentTasks || []) {
    try {
      const isOverdue = new Date(task.due_date) < new Date();
      const type = isOverdue ? 'overdue' : 'reminder';
      
      await createTaskNotification(
        new Request('', { 
          method: 'POST', 
          body: JSON.stringify({ task_id: task.id, type }) 
        }),
        'system'
      );
      
      notificationsSent++;
    } catch (error) {
      console.error(`Failed to send SLA reminder for task ${task.id}:`, error);
    }
  }

  return new Response(JSON.stringify({
    message: `SLA reminders sent: ${notificationsSent}`,
    tasks_processed: urgentTasks?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listNotifications(req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  // This would require a notifications table - for now return a placeholder
  return new Response(JSON.stringify({
    notifications: [],
    pagination: { page, limit, total: 0 }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUserNotifications(req: Request, userId: string): Promise<Response> {
  try {
    // Get user's notifications from the notifications table
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch user notifications:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      notifications: notifications || [],
      unread_count: notifications?.filter(n => !n.read_at).length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function markNotificationsAsRead(req: Request, userId: string): Promise<Response> {
  try {
    const { notification_ids } = await req.json();

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return new Response(JSON.stringify({ error: 'Invalid notification_ids' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', notification_ids)
      .eq('recipient_id', userId);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      message: 'Notifications marked as read',
      updated_count: notification_ids.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Helper functions for different notification types
async function sendEmailNotification(email: string, data: SendNotificationRequest): Promise<any> {
  try {
    // Call the email service
    const { error } = await supabase.functions.invoke('email-service', {
      body: {
        to: [email],
        subject: data.subject || 'IMS Notification',
        template: getEmailTemplate(data.data),
        templateData: {
          recipientName: 'User',
          message: data.message,
          systemUrl: Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://app.example.com',
          ...data.data
        }
      }
    });

    if (error) {
      console.error('Email service error:', error);
      throw error;
    }

    console.log(`Email sent successfully to ${email}: ${data.subject} - ${data.message}`);
    return { type: 'email', sent: true, provider: 'resend' };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

function getEmailTemplate(data: any): string {
  if (data?.type === 'application_notification') {
    return 'workflow_notification';
  } else if (data?.type === 'task_notification') {
    return 'reminder_notification';
  } else if (data?.decision) {
    return 'decision_notification';
  }
  return 'workflow_notification';
}

async function sendSMSNotification(phone: string, data: SendNotificationRequest): Promise<any> {
  // Placeholder for SMS integration (e.g., Twilio)
  console.log(`Would send SMS to ${phone}: ${data.message}`);
  return { type: 'sms', sent: true, provider: 'placeholder' };
}

async function sendNotificationToRole(req: Request, userId: string): Promise<Response> {
  const { role, title, message, type, category, application_id, metadata } = await req.json();

  try {
    // Get all users with the specified role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', role)
      .eq('is_active', true);

    if (roleError) {
      throw new Error(`Failed to fetch users with role ${role}: ${roleError.message}`);
    }

    if (!userRoles || userRoles.length === 0) {
      return new Response(JSON.stringify({
        message: `No active users found with role: ${role}`,
        recipients_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications for all users with the role
    const notifications = userRoles.map(userRole => ({
      recipient_id: userRole.user_id,
      title,
      message,
      type: type || 'INFO',
      category: category || 'APPLICATION',
      application_id: application_id || null,
      metadata: metadata || {}
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      throw new Error(`Failed to create notifications: ${insertError.message}`);
    }

    return new Response(JSON.stringify({
      message: `Notifications sent to ${userRoles.length} users with role: ${role}`,
      recipients_count: userRoles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in sendNotificationToRole:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function sendInAppNotification(userId: string, data: SendNotificationRequest): Promise<any> {
  try {
    // Store the notification in the database
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: userId,
        title: data.subject || 'Notification',
        message: data.message,
        type: data.priority === 'high' ? 'WARNING' : 'INFO',
        category: data.data?.type === 'task_notification' ? 'REMINDER' : 'APPLICATION',
        application_id: data.data?.application_id || null,
        metadata: data.data || {}
      });

    if (error) {
      console.error('Failed to create in-app notification:', error);
      throw error;
    }

    console.log(`Created in-app notification for user ${userId}: ${data.message}`);
    return { type: 'in_app', sent: true, user_id: userId };
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw error;
  }
}