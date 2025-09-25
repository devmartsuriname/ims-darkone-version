import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface WorkflowStageData {
  name: string
  count: number
  color: string
}

interface WorkflowData {
  stages: WorkflowStageData[]
  avgProcessingTime: number
  slaCompliance: number
  totalInPipeline: number
}

export const useWorkflowData = () => {
  const [data, setData] = useState<WorkflowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflowData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch applications with their current states
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('current_state, created_at, updated_at, submitted_at, completed_at, sla_deadline')

      if (appsError) throw appsError

      // Define workflow stages with colors
      const stageConfig = [
        { name: 'DRAFT', displayName: 'Draft', color: '#e9ecef' },
        { name: 'INTAKE_REVIEW', displayName: 'Intake Review', color: '#ffc107' },
        { name: 'CONTROL_ASSIGN', displayName: 'Control Assigned', color: '#fd7e14' },
        { name: 'CONTROL_VISIT_SCHEDULED', displayName: 'Control Visit', color: '#0dcaf0' },
        { name: 'CONTROL_IN_PROGRESS', displayName: 'Control In Progress', color: '#17a2b8' },
        { name: 'TECHNICAL_REVIEW', displayName: 'Technical Review', color: '#6f42c1' },
        { name: 'SOCIAL_REVIEW', displayName: 'Social Review', color: '#d63384' },
        { name: 'DIRECTOR_REVIEW', displayName: 'Director Review', color: '#198754' },
        { name: 'MINISTER_DECISION', displayName: 'Minister Decision', color: '#dc3545' },
        { name: 'CLOSURE', displayName: 'Approved', color: '#20c997' },
        { name: 'REJECTED', displayName: 'Rejected', color: '#6c757d' },
      ]

      // Count applications in each stage
      const stages: WorkflowStageData[] = stageConfig.map(stage => {
        const count = applications?.filter(app => app.current_state === stage.name).length || 0
        return {
          name: stage.displayName,
          count,
          color: stage.color
        }
      }).filter(stage => stage.count > 0) // Only show stages with applications

      // Calculate metrics
      const totalInPipeline = applications?.filter(app => 
        !['CLOSURE', 'REJECTED'].includes(app.current_state || '')
      ).length || 0

      // Calculate average processing time for completed applications
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
      const now = new Date()
      const totalWithSLA = applications?.filter(app => app.sla_deadline).length || 0
      const onTimeApps = applications?.filter(app => {
        if (!app.sla_deadline) return false
        if (['CLOSURE', 'REJECTED'].includes(app.current_state || '')) {
          return app.completed_at && new Date(app.completed_at) <= new Date(app.sla_deadline)
        }
        return new Date(app.sla_deadline) >= now
      }).length || 0

      const slaCompliance = totalWithSLA > 0 ? Math.round((onTimeApps / totalWithSLA) * 100) : 100

      setData({
        stages,
        avgProcessingTime,
        slaCompliance,
        totalInPipeline
      })
    } catch (err) {
      console.error('Error fetching workflow data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflowData()
  }, [])

  return { data, isLoading, error, refetch: fetchWorkflowData }
}