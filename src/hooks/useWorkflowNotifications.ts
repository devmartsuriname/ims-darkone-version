import { useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { NotificationService } from '@/components/notifications/NotificationService'

/**
 * Hook for sending workflow-related notifications
 */
export const useWorkflowNotifications = () => {
  
  const notifyStatusChange = useCallback(async (
    applicationId: string,
    fromState: string,
    toState: string
  ) => {
    try {
      await NotificationService.notifyStatusChange(applicationId, fromState, toState)
    } catch (error) {
      console.error('Failed to send status change notification:', error)
    }
  }, [])

  const notifyDirectorDecision = useCallback(async (
    applicationId: string,
    decision: string,
    notes: string
  ) => {
    try {
      await NotificationService.notifyDirectorDecision(applicationId, decision, notes)
    } catch (error) {
      console.error('Failed to send director decision notification:', error)
    }
  }, [])

  const notifyMinisterDecision = useCallback(async (
    applicationId: string,
    decision: string,
    finalAmount?: number
  ) => {
    try {
      await NotificationService.notifyMinisterDecision(applicationId, decision, finalAmount)
    } catch (error) {
      console.error('Failed to send minister decision notification:', error)
    }
  }, [])

  const notifySLADeadline = useCallback(async (
    applicationId: string,
    hoursRemaining: number
  ) => {
    try {
      await NotificationService.notifySLADeadline(applicationId, hoursRemaining)
    } catch (error) {
      console.error('Failed to send SLA deadline notification:', error)
    }
  }, [])

  const sendCustomNotification = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
    category: 'APPLICATION' | 'SYSTEM' | 'REMINDER' | 'DECISION' = 'APPLICATION',
    applicationId?: string
  ) => {
    try {
      await NotificationService.sendNotification({
        recipient_id: recipientId,
        title,
        message,
        type,
        category,
        application_id: applicationId
      })
    } catch (error) {
      console.error('Failed to send custom notification:', error)
    }
  }, [])

  const sendRoleNotification = useCallback(async (
    role: string,
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
    category: 'APPLICATION' | 'SYSTEM' | 'REMINDER' | 'DECISION' = 'APPLICATION',
    applicationId?: string
  ) => {
    try {
      await NotificationService.sendNotificationToRole(role, {
        title,
        message,
        type,
        category,
        application_id: applicationId
      })
    } catch (error) {
      console.error('Failed to send role notification:', error)
    }
  }, [])

  const sendEmailNotification = useCallback(async (
    recipients: string[],
    subject: string,
    message: string,
    template?: string,
    data?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase.functions.invoke('email-service', {
        body: {
          to: recipients,
          subject,
          template: template || 'workflow_notification',
          templateData: {
            message,
            systemUrl: window.location.origin,
            ...data
          }
        }
      });

      if (error) throw error;
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }, [])

  const notifyTaskAssignment = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase.functions.invoke('notification-service', {
        body: {
          task_id: taskId,
          type: 'assignment'
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send task assignment notification:', error);
      throw error;
    }
  }, [])

  return {
    notifyStatusChange,
    notifyDirectorDecision,
    notifyMinisterDecision,
    notifySLADeadline,
    sendCustomNotification,
    sendRoleNotification,
    sendEmailNotification,
    notifyTaskAssignment
  }
}