import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  controlVisits: number
  slaViolations: number
  myQueue: number
  avgProcessingTime: number
  slaCompliance: number
}

export const useApplicationStats = (userRole?: string) => {
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch applications
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id, current_state, created_at, updated_at, assigned_to, submitted_at, completed_at, sla_deadline')

      if (appsError) throw appsError

      // Fetch control visits
      const { data: controlVisits, error: visitsError } = await supabase
        .from('control_visits')
        .select('id, scheduled_date, visit_status')

      if (visitsError) throw visitsError

      // Fetch tasks for SLA tracking
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, due_date, completed_at, status')

      if (tasksError) throw tasksError

      // Get current user ID for "My Queue"
      const { data: { user } } = await supabase.auth.getUser()
      
      // Calculate statistics
      const now = new Date()
      const total = applications?.length || 0
      
      const pending = applications?.filter(app => 
        app.current_state && !['CLOSURE', 'REJECTED'].includes(app.current_state)
      ).length || 0
      
      const approved = applications?.filter(app => 
        app.current_state === 'CLOSURE'
      ).length || 0
      
      const rejected = applications?.filter(app => 
        app.current_state === 'REJECTED'
      ).length || 0

      const scheduledVisits = controlVisits?.filter(visit => 
        visit.visit_status === 'SCHEDULED' && 
        visit.scheduled_date && 
        new Date(visit.scheduled_date) >= now
      ).length || 0

      // Calculate SLA violations
      const overdueApplications = applications?.filter(app => 
        app.sla_deadline && 
        new Date(app.sla_deadline) < now && 
        !['CLOSURE', 'REJECTED'].includes(app.current_state || '')
      ).length || 0

      // Calculate my queue (applications assigned to current user)
      const myQueue = applications?.filter(app => 
        app.assigned_to === user?.id
      ).length || 0

      // Calculate average processing time
      const completedApps = applications?.filter(app => 
        ['CLOSURE', 'REJECTED'].includes(app.current_state || '') && 
        app.submitted_at && app.completed_at
      ) || []

      const avgProcessingTime = completedApps.length > 0 
        ? Math.round(
            completedApps.reduce((sum, app) => {
              const start = new Date(app.submitted_at!)
              const end = new Date(app.completed_at!)
              return sum + (end.getTime() - start.getTime())
            }, 0) / completedApps.length / (1000 * 60 * 60 * 24)
          )
        : 0

      // Calculate SLA compliance
      const totalTasks = tasks?.length || 0
      const onTimeTasks = tasks?.filter(task => {
        if (task.completed_at && task.due_date) {
          return new Date(task.completed_at) <= new Date(task.due_date)
        }
        if (task.due_date) {
          return new Date(task.due_date) >= now
        }
        return false
      }).length || 0

      const slaCompliance = totalTasks > 0 ? Math.round((onTimeTasks / totalTasks) * 100) : 100

      setStats({
        total,
        pending,
        approved,
        rejected,
        controlVisits: scheduledVisits,
        slaViolations: overdueApplications,
        myQueue,
        avgProcessingTime,
        slaCompliance
      })
    } catch (err) {
      console.error('Error fetching application stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [userRole])

  return { stats, isLoading, error, refetch: fetchStats }
}