import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ActivityItem {
  id: string
  type: 'application' | 'control' | 'review' | 'approval' | 'document'
  title: string
  description: string
  time: string
  icon: string
  color: string
  application_id?: string
}

export const useRecentActivities = (limit: number = 10) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get recent audit logs for activity feed
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (auditError) throw auditError

      // Transform audit logs into activity items
      const transformedActivities: ActivityItem[] = (auditLogs || []).map(log => {
        const timeAgo = formatTimeAgo(new Date(log.timestamp || new Date()))
        
        // Determine activity type and presentation based on operation and table
        let type: ActivityItem['type'] = 'application'
        let title = 'System Activity'
        let description = log.operation
        let icon = 'solar:document-broken'
        let color = 'primary'

        if (log.table_name === 'applications') {
          if (log.operation === 'INSERT') {
            title = 'New Application Submitted'
            description = `Application created`
            icon = 'solar:document-add-broken'
            color = 'primary'
            type = 'application'
          } else if (log.operation === 'UPDATE') {
            title = 'Application Updated'
            description = `Application status changed`
            icon = 'solar:refresh-broken'
            color = 'info'
            type = 'application'
          }
        } else if (log.table_name === 'control_visits') {
          title = 'Control Visit Activity'
          description = `Control visit ${log.operation.toLowerCase()}`
          icon = 'solar:home-2-broken'
          color = 'info'
          type = 'control'
        } else if (log.table_name === 'technical_reports') {
          title = 'Technical Report'
          description = `Technical assessment ${log.operation.toLowerCase()}`
          icon = 'solar:clipboard-check-broken'
          color = 'success'
          type = 'review'
        } else if (log.table_name === 'social_reports') {
          title = 'Social Report'
          description = `Social assessment ${log.operation.toLowerCase()}`
          icon = 'solar:user-check-broken'
          color = 'warning'
          type = 'review'
        } else if (log.table_name === 'documents') {
          title = 'Document Activity'
          description = `Document ${log.operation.toLowerCase()}`
          icon = 'solar:upload-broken'
          color = 'secondary'
          type = 'document'
        }

        return {
          id: log.id,
          type,
          title,
          description,
          time: timeAgo,
          icon,
          color,
          application_id: log.record_id
        }
      })

      setActivities(transformedActivities)
    } catch (err) {
      console.error('Error fetching recent activities:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      
      // Fallback to recent applications if audit logs fail
      try {
        const { data: applications } = await supabase
          .from('applications')
          .select('id, created_at, updated_at, application_number')
          .order('updated_at', { ascending: false })
          .limit(5)

        const fallbackActivities: ActivityItem[] = (applications || []).map(app => ({
          id: app.id,
          type: 'application' as const,
          title: 'Application Activity',
          description: `Application ${app.application_number}`,
          time: formatTimeAgo(new Date(app.updated_at || app.created_at || new Date())),
          icon: 'solar:document-broken',
          color: 'primary',
          application_id: app.id
        }))

        setActivities(fallbackActivities)
        setError(null)
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  useEffect(() => {
    fetchActivities()
    
    // Set up real-time subscription for audit logs
    const subscription = supabase
      .channel('audit_logs_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'audit_logs' }, 
        () => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [limit])

  return { activities, isLoading, error, refetch: fetchActivities }
}