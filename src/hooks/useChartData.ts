import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface MonthlyData {
  month: string
  submitted: number
  processed: number
  approved: number
}

export const useChartData = () => {
  const [chartData, setChartData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get applications data
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id, current_state, submitted_at, completed_at, created_at')
        .order('created_at', { ascending: true })

      if (appsError) throw appsError

      // Process data for the last 12 months
      const now = new Date()
      const monthsData: MonthlyData[] = []
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const monthName = monthDate.toLocaleDateString('en', { month: 'short' })

        // Filter applications for this month
        const monthApplications = applications?.filter(app => {
          if (!app.created_at) return false
          const createdDate = new Date(app.created_at)
          return createdDate >= monthDate && createdDate < nextMonth
        }) || []

        const submitted = monthApplications.length

        const processed = monthApplications.filter(app => 
          app.completed_at || ['CLOSURE', 'REJECTED'].includes(app.current_state || '')
        ).length

        const approved = monthApplications.filter(app => 
          app.current_state === 'CLOSURE'
        ).length

        monthsData.push({
          month: monthName,
          submitted,
          processed,
          approved
        })
      }

      setChartData(monthsData)
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [])

  return { chartData, isLoading, error, refetch: fetchChartData }
}