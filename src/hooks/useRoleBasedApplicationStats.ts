import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuthContext } from '@/context/useAuthContext'

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

export const useRoleBasedApplicationStats = () => {
  const { user, roles } = useAuthContext()
  
  const userRole = roles?.[0]?.role

  return useQuery({
    queryKey: ['role-based-application-stats', user?.id, userRole],
    queryFn: async (): Promise<ApplicationStats> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Build base query
      let applicationsQuery = supabase.from('applications').select('*')

      // Apply role-based filtering
      if (userRole === 'front_office') {
        // Front office sees only applications they created
        applicationsQuery = applicationsQuery.eq('created_by', user.id)
      } else if (userRole === 'control') {
        // Control sees applications assigned to them or in control states
        applicationsQuery = applicationsQuery.or(
          `assigned_to.eq.${user.id},current_state.in.(CONTROL_ASSIGN,CONTROL_VISIT_SCHEDULED,CONTROL_IN_PROGRESS)`
        )
      } else if (userRole === 'director') {
        // Director sees only applications awaiting their review
        applicationsQuery = applicationsQuery.eq('current_state', 'DIRECTOR_REVIEW')
      } else if (userRole === 'minister') {
        // Minister sees only applications awaiting their decision
        applicationsQuery = applicationsQuery.eq('current_state', 'MINISTER_DECISION')
      }
      // admin, it, staff see all (no filter applied)

      const { data: applications, error: appsError } = await applicationsQuery

      if (appsError) throw appsError

      // Fetch control visits (apply same role filtering)
      let visitsQuery = supabase.from('control_visits').select('*')
      
      if (userRole === 'control') {
        visitsQuery = visitsQuery.eq('assigned_inspector', user.id)
      } else if (userRole === 'front_office') {
        // Front office shouldn't see control visits
        visitsQuery = visitsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { data: controlVisits } = await visitsQuery

      // Fetch tasks (apply same role filtering)
      let tasksQuery = supabase.from('tasks').select('*')
      
      if (userRole !== 'admin' && userRole !== 'it' && userRole !== 'staff') {
        tasksQuery = tasksQuery.eq('assigned_to', user.id)
      }

      const { data: tasks } = await tasksQuery

      // Calculate statistics
      const total = applications?.length || 0
      const pending = applications?.filter(
        (app) =>
          app.current_state &&
          !['CLOSURE', 'REJECTED'].includes(app.current_state)
      ).length || 0
      const approved = applications?.filter(
        (app) => app.current_state === 'CLOSURE'
      ).length || 0
      const rejected = applications?.filter(
        (app) => app.current_state === 'REJECTED'
      ).length || 0

      const scheduledVisits = controlVisits?.filter(
        (visit) => visit.visit_status === 'SCHEDULED'
      ).length || 0

      const overdueApps = applications?.filter((app) => {
        if (!app.sla_deadline) return false
        return new Date(app.sla_deadline) < new Date() && 
               !['CLOSURE', 'REJECTED'].includes(app.current_state || '')
      }).length || 0

      const myQueueTasks = tasks?.filter(
        (task) => task.assigned_to === user.id && task.status === 'PENDING'
      ).length || 0

      // Calculate average processing time for completed applications
      const completedApps = applications?.filter(
        (app) => app.completed_at && app.submitted_at
      )
      const avgTime = completedApps && completedApps.length > 0
        ? completedApps.reduce((sum, app) => {
            const start = new Date(app.submitted_at!).getTime()
            const end = new Date(app.completed_at!).getTime()
            return sum + (end - start)
          }, 0) / completedApps.length / (1000 * 60 * 60 * 24)
        : 0

      // Calculate SLA compliance
      const allTasks = tasks || []
      const completedTasks = allTasks.filter((t) => t.completed_at)
      const onTimeTasks = completedTasks.filter((t) => {
        if (!t.due_date || !t.completed_at) return false
        return new Date(t.completed_at) <= new Date(t.due_date)
      })
      const slaCompliance = completedTasks.length > 0
        ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
        : 100

      return {
        total,
        pending,
        approved,
        rejected,
        controlVisits: scheduledVisits,
        slaViolations: overdueApps,
        myQueue: myQueueTasks,
        avgProcessingTime: Math.round(avgTime),
        slaCompliance,
      }
    },
    enabled: !!user?.id && !!userRole,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}
