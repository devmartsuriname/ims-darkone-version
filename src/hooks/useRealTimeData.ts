import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealTimeDataOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useRealTimeData<T = any>(
  fetchFunction: () => Promise<T>,
  options: UseRealTimeDataOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Real-time data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    if (!options.enabled) return;

    // Initial fetch
    fetchData();

    // Set up real-time channel
    const channel = supabase
      .channel(`realtime-${options.table}`)
      .on(
        'postgres_changes' as any,
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter
        },
        (payload: any) => {
          console.log(`Real-time ${options.table} change:`, payload);
          // Debounce rapid changes
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            fetchData();
          }, 500);
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Set up periodic refresh as fallback
    const interval = options.refreshInterval ? setInterval(fetchData, options.refreshInterval) : null;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (interval) {
        clearInterval(interval);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData, options.enabled, options.table, options.event, options.filter, options.refreshInterval]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch,
    isConnected: channelRef.current?.state === 'joined'
  };
}

// Specialized hook for application statistics with real-time updates
export function useRealTimeApplicationStats() {
  const fetchStats = useCallback(async () => {
    const { data: applications } = await supabase
      .from('applications')
      .select('current_state, created_at, assigned_to');

    const { data: controlVisits } = await supabase
      .from('control_visits')
      .select('visit_status');

    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, assigned_to, due_date');

    const total = applications?.length || 0;
    const pending = applications?.filter(app => 
      app.current_state && !['CLOSURE', 'REJECTED'].includes(app.current_state)
    ).length || 0;
    const approved = applications?.filter(app => 
      app.current_state === 'CLOSURE'
    ).length || 0;
    const controlVisitsCount = controlVisits?.length || 0;
    const slaViolations = tasks?.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'COMPLETED'
    ).length || 0;
    const currentUser = await supabase.auth.getUser();
    const myQueue = tasks?.filter(task => 
      task.assigned_to === currentUser.data.user?.id
    ).length || 0;

    return {
      total,
      pending,
      approved,
      controlVisits: controlVisitsCount,
      slaViolations,
      myQueue
    };
  }, []);

  return useRealTimeData(fetchStats, {
    table: 'applications',
    event: '*',
    refreshInterval: 60000, // Refresh every minute as fallback
    enabled: true
  });
}