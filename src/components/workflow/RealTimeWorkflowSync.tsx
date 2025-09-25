import React, { useEffect, useCallback, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface RealTimeWorkflowSyncProps {
  applicationId: string
  onStateChange?: (newState: string, metadata?: any) => void
  onDocumentUpdate?: () => void
  onTaskUpdate?: () => void
}

interface WorkflowEvent {
  type: 'state_change' | 'document_update' | 'task_update' | 'notification'
  data: any
  timestamp: string
}

export const RealTimeWorkflowSync: React.FC<RealTimeWorkflowSyncProps> = ({
  applicationId,
  onStateChange,
  onDocumentUpdate,
  onTaskUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [recentEvents, setRecentEvents] = useState<WorkflowEvent[]>([])

  const handleApplicationUpdate = useCallback((payload: any) => {
    console.log('Application update received:', payload)
    const { new: newRecord, old: oldRecord } = payload
    
    // State change detection
    if (newRecord.current_state !== oldRecord?.current_state) {
      const event: WorkflowEvent = {
        type: 'state_change',
        data: {
          from: oldRecord?.current_state,
          to: newRecord.current_state,
          assigned_to: newRecord.assigned_to
        },
        timestamp: new Date().toISOString()
      }
      
      setRecentEvents(prev => [event, ...prev.slice(0, 4)])
      setLastUpdate(new Date())
      onStateChange?.(newRecord.current_state, event.data)
      
      toast.info(`Application state changed to ${newRecord.current_state.replace('_', ' ')}`, {
        icon: <IconifyIcon icon="bx:sync" />
      })
    }

    // Assignment change detection
    if (newRecord.assigned_to !== oldRecord?.assigned_to) {
      const event: WorkflowEvent = {
        type: 'task_update',
        data: {
          type: 'assignment_change',
          assigned_to: newRecord.assigned_to,
          previous_assignee: oldRecord?.assigned_to
        },
        timestamp: new Date().toISOString()
      }
      
      setRecentEvents(prev => [event, ...prev.slice(0, 4)])
      onTaskUpdate?.()
    }
  }, [onStateChange, onTaskUpdate])

  const handleDocumentUpdate = useCallback((payload: any) => {
    console.log('Document update received:', payload)
    const { new: newRecord, old: oldRecord } = payload
    
    // Verification status change
    if (newRecord.verification_status !== oldRecord?.verification_status) {
      const event: WorkflowEvent = {
        type: 'document_update',
        data: {
          document_name: newRecord.document_name,
          status: newRecord.verification_status,
          previous_status: oldRecord?.verification_status
        },
        timestamp: new Date().toISOString()
      }
      
      setRecentEvents(prev => [event, ...prev.slice(0, 4)])
      setLastUpdate(new Date())
      onDocumentUpdate?.()
      
      toast.info(`Document "${newRecord.document_name}" ${newRecord.verification_status.toLowerCase()}`, {
        icon: <IconifyIcon icon="bx:file-check" />
      })
    }
  }, [onDocumentUpdate])

  const handleTaskUpdate = useCallback((payload: any) => {
    console.log('Task update received:', payload)
    const { new: newRecord, old: oldRecord } = payload
    
    if (newRecord.status !== oldRecord?.status) {
      const event: WorkflowEvent = {
        type: 'task_update',
        data: {
          task_type: newRecord.task_type,
          status: newRecord.status,
          title: newRecord.title
        },
        timestamp: new Date().toISOString()
      }
      
      setRecentEvents(prev => [event, ...prev.slice(0, 4)])
      setLastUpdate(new Date())
      onTaskUpdate?.()
      
      if (newRecord.status === 'COMPLETED') {
        toast.success(`Task completed: ${newRecord.title}`, {
          icon: <IconifyIcon icon="bx:task" />
        })
      }
    }
  }, [onTaskUpdate])

  const handleNotificationUpdate = useCallback((payload: any) => {
    console.log('Notification received:', payload)
    const { new: notification } = payload
    
    if (notification.application_id === applicationId) {
      const event: WorkflowEvent = {
        type: 'notification',
        data: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category
        },
        timestamp: new Date().toISOString()
      }
      
      setRecentEvents(prev => [event, ...prev.slice(0, 4)])
      
      // Show toast for workflow notifications
      if (notification.category === 'APPLICATION') {
        toast.info(notification.message, {
          icon: <IconifyIcon icon="bx:bell" />
        })
      }
    }
  }, [applicationId])

  useEffect(() => {
    if (!applicationId) return

    console.log('Setting up real-time subscriptions for application:', applicationId)

    // Subscribe to application changes
    const applicationChannel = supabase
      .channel(`application_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `id=eq.${applicationId}`
        },
        handleApplicationUpdate
      )
      .subscribe((status) => {
        console.log('Application subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Subscribe to document changes for this application
    const documentChannel = supabase
      .channel(`documents_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `application_id=eq.${applicationId}`
        },
        handleDocumentUpdate
      )
      .subscribe()

    // Subscribe to task changes for this application
    const taskChannel = supabase
      .channel(`tasks_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `application_id=eq.${applicationId}`
        },
        handleTaskUpdate
      )
      .subscribe()

    // Subscribe to notifications for current user related to this application
    const notificationChannel = supabase
      .channel(`notifications_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `application_id=eq.${applicationId}`
        },
        handleNotificationUpdate
      )
      .subscribe()

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions')
      supabase.removeChannel(applicationChannel)
      supabase.removeChannel(documentChannel)
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(notificationChannel)
    }
  }, [applicationId, handleApplicationUpdate, handleDocumentUpdate, handleTaskUpdate, handleNotificationUpdate])

  // Connection status indicator
  if (!isConnected && applicationId) {
    return (
      <Alert variant="warning" className="mb-3">
        <IconifyIcon icon="bx:wifi-off" className="me-2" />
        Real-time sync disconnected. Changes may not appear immediately.
      </Alert>
    )
  }

  // Recent events display (optional)
  if (recentEvents.length > 0) {
    return (
      <div className="mb-3">
        <div className="d-flex align-items-center text-success small mb-2">
          <IconifyIcon icon="bx:sync" className="me-1" />
          Real-time sync active
          {lastUpdate && (
            <span className="ms-2 text-muted">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default RealTimeWorkflowSync