import { useCallback } from 'react'
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

  return {
    notifyStatusChange,
    notifyDirectorDecision,
    notifyMinisterDecision,
    notifySLADeadline,
    sendCustomNotification,
    sendRoleNotification
  }
}