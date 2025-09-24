import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SendEmailRequest {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  template?: 'workflow_notification' | 'decision_notification' | 'reminder_notification';
  templateData?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    if (req.method === 'POST' && path === 'send') {
      return await sendEmail(req);
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in email-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmail(req: Request): Promise<Response> {
  try {
    const emailData: SendEmailRequest = await req.json();
    
    let html = emailData.html;
    let text = emailData.text;

    // Generate content from template if specified
    if (emailData.template && emailData.templateData) {
      const templateContent = generateEmailTemplate(emailData.template, emailData.templateData);
      html = templateContent.html;
      text = templateContent.text;
    }

    const { data, error } = await resend.emails.send({
      from: 'IMS - Internal Management System <noreply@resend.dev>',
      to: emailData.to,
      subject: emailData.subject,
      html: html || undefined,
      text: text || undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      emailId: data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Failed to send email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function generateEmailTemplate(template: string, data: Record<string, any>) {
  switch (template) {
    case 'workflow_notification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">IMS - Internal Management System</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2 style="color: #1e40af;">Application Status Update</h2>
              <p>Dear ${data.recipientName || 'User'},</p>
              <p>Application <strong>${data.applicationNumber}</strong> has been updated:</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Status:</strong> ${data.newStatus}</p>
                <p><strong>Applicant:</strong> ${data.applicantName}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
                ${data.nextSteps ? `<p><strong>Next Steps:</strong> ${data.nextSteps}</p>` : ''}
              </div>
              <p>Please log into the IMS system to view full details and take any required actions.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.systemUrl || '#'}" 
                   style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Access IMS System
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated notification from the Internal Management System. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
IMS - Internal Management System

Application Status Update

Dear ${data.recipientName || 'User'},

Application ${data.applicationNumber} has been updated:

Status: ${data.newStatus}
Applicant: ${data.applicantName}
${data.notes ? `Notes: ${data.notes}` : ''}
${data.nextSteps ? `Next Steps: ${data.nextSteps}` : ''}

Please log into the IMS system to view full details and take any required actions.

System URL: ${data.systemUrl || 'Please contact your administrator for the system URL'}

This is an automated notification from the Internal Management System.
        `
      };

    case 'decision_notification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${data.approved ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">IMS - Decision Notification</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2 style="color: ${data.approved ? '#059669' : '#dc2626'};">
                Application ${data.approved ? 'Approved' : 'Decision'}
              </h2>
              <p>Dear ${data.recipientName || 'User'},</p>
              <p>A decision has been made regarding application <strong>${data.applicationNumber}</strong>:</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${data.approved ? '#059669' : '#dc2626'};">
                <p><strong>Decision:</strong> ${data.decision}</p>
                <p><strong>Applicant:</strong> ${data.applicantName}</p>
                ${data.finalAmount ? `<p><strong>Approved Amount:</strong> SRD ${data.finalAmount.toLocaleString()}</p>` : ''}
                ${data.decisionNotes ? `<p><strong>Notes:</strong> ${data.decisionNotes}</p>` : ''}
              </div>
              ${data.nextSteps ? `<p><strong>Next Steps:</strong> ${data.nextSteps}</p>` : ''}
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.systemUrl || '#'}" 
                   style="background-color: ${data.approved ? '#059669' : '#dc2626'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Application Details
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated notification from the Internal Management System. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
IMS - Decision Notification

Application ${data.approved ? 'Approved' : 'Decision'}

Dear ${data.recipientName || 'User'},

A decision has been made regarding application ${data.applicationNumber}:

Decision: ${data.decision}
Applicant: ${data.applicantName}
${data.finalAmount ? `Approved Amount: SRD ${data.finalAmount.toLocaleString()}` : ''}
${data.decisionNotes ? `Notes: ${data.decisionNotes}` : ''}

${data.nextSteps ? `Next Steps: ${data.nextSteps}` : ''}

System URL: ${data.systemUrl || 'Please contact your administrator for the system URL'}

This is an automated notification from the Internal Management System.
        `
      };

    case 'reminder_notification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">IMS - Reminder</h1>
            </div>
            <div style="padding: 20px; background-color: #f8fafc;">
              <h2 style="color: #f59e0b;">Action Required</h2>
              <p>Dear ${data.recipientName || 'User'},</p>
              <p>This is a reminder about an application that requires your attention:</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Application:</strong> ${data.applicationNumber}</p>
                <p><strong>Applicant:</strong> ${data.applicantName}</p>
                <p><strong>Current Status:</strong> ${data.currentStatus}</p>
                <p><strong>Days Remaining:</strong> ${data.daysRemaining || 'Overdue'}</p>
                ${data.reminderMessage ? `<p><strong>Message:</strong> ${data.reminderMessage}</p>` : ''}
              </div>
              <p>Please take the necessary action to avoid SLA deadline violations.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.systemUrl || '#'}" 
                   style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Take Action Now
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated notification from the Internal Management System. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
IMS - Reminder

Action Required

Dear ${data.recipientName || 'User'},

This is a reminder about an application that requires your attention:

Application: ${data.applicationNumber}
Applicant: ${data.applicantName}
Current Status: ${data.currentStatus}
Days Remaining: ${data.daysRemaining || 'Overdue'}
${data.reminderMessage ? `Message: ${data.reminderMessage}` : ''}

Please take the necessary action to avoid SLA deadline violations.

System URL: ${data.systemUrl || 'Please contact your administrator for the system URL'}

This is an automated notification from the Internal Management System.
        `
      };

    default:
      return {
        html: `<p>${data.message || 'No content provided'}</p>`,
        text: data.message || 'No content provided'
      };
  }
}