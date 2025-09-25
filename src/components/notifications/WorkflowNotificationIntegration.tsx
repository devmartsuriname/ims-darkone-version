import React from 'react';
import { useWorkflowNotifications } from '@/hooks/useWorkflowNotifications';
import { toast } from 'react-toastify';

/**
 * Component that integrates workflow state changes with notifications
 * This component provides global notification methods that can be used throughout the app
 */
export const WorkflowNotificationIntegration: React.FC = () => {
  const { 
    notifyStatusChange, 
    notifyDirectorDecision, 
    notifyMinisterDecision,
    sendRoleNotification,
    sendEmailNotification,
    notifyTaskAssignment,
    notifySLADeadline
  } = useWorkflowNotifications();

  // Register global notification methods on window object for easy access
  React.useEffect(() => {
    (window as any).workflowNotifications = {
      notifyStatusChange: async (applicationId: string, fromState: string, toState: string) => {
        try {
          await notifyStatusChange(applicationId, fromState, toState);
          toast.success('Status change notification sent to relevant users');
        } catch (error) {
          toast.error('Failed to send status change notification');
        }
      },
      
      notifyDirectorDecision: async (applicationId: string, decision: string, notes: string) => {
        try {
          await notifyDirectorDecision(applicationId, decision, notes);
          toast.success('Director decision notification sent');
        } catch (error) {
          toast.error('Failed to send director decision notification');
        }
      },
      
      notifyMinisterDecision: async (applicationId: string, decision: string, finalAmount?: number) => {
        try {
          await notifyMinisterDecision(applicationId, decision, finalAmount);
          toast.success('Minister decision notification sent');
        } catch (error) {
          toast.error('Failed to send minister decision notification');
        }
      },
      
      sendRoleNotification: async (
        role: string, 
        title: string, 
        message: string, 
        type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO'
      ) => {
        try {
          await sendRoleNotification(role, title, message, type);
          toast.success(`Notification sent to all users with role: ${role}`);
        } catch (error) {
          toast.error(`Failed to send notification to role: ${role}`);
        }
      },

      sendEmailNotification: async (
        recipients: string[],
        subject: string,
        message: string,
        template?: string,
        data?: Record<string, any>
      ) => {
        try {
          await sendEmailNotification(recipients, subject, message, template, data);
          toast.success('Email notification sent successfully');
        } catch (error) {
          toast.error('Failed to send email notification');
        }
      },

      notifyTaskAssignment: async (taskId: string) => {
        try {
          await notifyTaskAssignment(taskId);
          toast.success('Task assignment notification sent');
        } catch (error) {
          toast.error('Failed to send task assignment notification');
        }
      },

      notifySLADeadline: async (applicationId: string, hoursRemaining: number) => {
        try {
          await notifySLADeadline(applicationId, hoursRemaining);
          toast.success('SLA deadline notification sent');
        } catch (error) {
          toast.error('Failed to send SLA deadline notification');
        }
      }
    };
  }, [
    notifyStatusChange, 
    notifyDirectorDecision, 
    notifyMinisterDecision, 
    sendRoleNotification,
    sendEmailNotification,
    notifyTaskAssignment,
    notifySLADeadline
  ]);

  return null; // This is a utility component with no visual output
};

export default WorkflowNotificationIntegration;