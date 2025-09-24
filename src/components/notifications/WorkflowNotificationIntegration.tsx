import React from 'react';
import { useWorkflowNotifications } from '@/hooks/useWorkflowNotifications';
import { useSuccessNotification, useErrorNotification, useInfoNotification } from '@/components/ui/NotificationToasts';

/**
 * Component that integrates workflow state changes with notifications
 */
export const WorkflowNotificationIntegration: React.FC = () => {
  const { 
    notifyStatusChange, 
    notifyDirectorDecision, 
    notifyMinisterDecision,
    sendRoleNotification 
  } = useWorkflowNotifications();
  
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();
  const showInfo = useInfoNotification();

  // This component provides notification methods that can be used by other components
  React.useEffect(() => {
    // Register global notification methods on window object for easy access
    (window as any).workflowNotifications = {
      notifyStatusChange: async (applicationId: string, fromState: string, toState: string) => {
        try {
          await notifyStatusChange(applicationId, fromState, toState);
          showSuccess('Notification Sent', 'Status change notification sent to relevant users');
        } catch (error) {
          showError('Notification Failed', 'Failed to send status change notification');
        }
      },
      
      notifyDirectorDecision: async (applicationId: string, decision: string, notes: string) => {
        try {
          await notifyDirectorDecision(applicationId, decision, notes);
          showSuccess('Notification Sent', 'Director decision notification sent');
        } catch (error) {
          showError('Notification Failed', 'Failed to send director decision notification');
        }
      },
      
      notifyMinisterDecision: async (applicationId: string, decision: string, finalAmount?: number) => {
        try {
          await notifyMinisterDecision(applicationId, decision, finalAmount);
          showSuccess('Notification Sent', 'Minister decision notification sent');
        } catch (error) {
          showError('Notification Failed', 'Failed to send minister decision notification');
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
          showSuccess('Notification Sent', `Notification sent to all users with role: ${role}`);
        } catch (error) {
          showError('Notification Failed', `Failed to send notification to role: ${role}`);
        }
      }
    };
  }, [notifyStatusChange, notifyDirectorDecision, notifyMinisterDecision, sendRoleNotification, showSuccess, showError, showInfo]);

  return null; // This is a utility component with no visual output
};

export default WorkflowNotificationIntegration;