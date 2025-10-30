import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthChartData {
  responseTime: {
    timestamps: string[];
    authTimes: number[];
    storageTimes: number[];
    databaseTimes: number[];
  };
  availability: {
    timestamps: string[];
    authUptime: number[];
    storageUptime: number[];
    databaseUptime: number[];
  };
  alerts: {
    timestamps: string[];
    criticalAlerts: number[];
    warningAlerts: number[];
    infoAlerts: number[];
  };
}

export const useSystemHealthChartData = (timeRange: '24h' | '7d' | '30d' = '24h') => {
  const [data, setData] = useState<SystemHealthChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate time range
      const now = new Date();
      const hoursAgo = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

      // Fetch historical health reports
      const { data: reports, error: fetchError } = await supabase
        .from('system_health_reports')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      if (!reports || reports.length === 0) {
        // Generate mock data if no historical data exists
        setData(generateMockData(timeRange));
      } else {
        // Process real data
        setData(processHealthReports(reports));
      }
    } catch (err) {
      console.error('Failed to fetch health chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      // Fallback to mock data on error
      setData(generateMockData(timeRange));
    } finally {
      setIsLoading(false);
    }
  };

  const processHealthReports = (reports: any[]): SystemHealthChartData => {
    const timestamps = reports.map(r => new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    return {
      responseTime: {
        timestamps,
        authTimes: reports.map(r => r.service_metrics?.auth?.responseTime || 0),
        storageTimes: reports.map(r => r.service_metrics?.storage?.responseTime || 0),
        databaseTimes: reports.map(r => r.database_metrics?.connectionTime || 0)
      },
      availability: {
        timestamps,
        authUptime: reports.map(r => r.service_metrics?.auth?.status === 'healthy' ? 100 : r.service_metrics?.auth?.status === 'degraded' ? 95 : 90),
        storageUptime: reports.map(r => r.service_metrics?.storage?.status === 'healthy' ? 100 : r.service_metrics?.storage?.status === 'degraded' ? 95 : 90),
        databaseUptime: reports.map(r => r.database_metrics?.connectionPoolStatus === 'optimal' ? 100 : 95)
      },
      alerts: {
        timestamps,
        criticalAlerts: reports.map(r => (r.alerts || []).filter((a: any) => a.severity === 'critical').length),
        warningAlerts: reports.map(r => (r.alerts || []).filter((a: any) => a.severity === 'warning').length),
        infoAlerts: reports.map(r => (r.alerts || []).filter((a: any) => a.severity === 'info').length)
      }
    };
  };

  const generateMockData = (range: string): SystemHealthChartData => {
    const points = range === '24h' ? 24 : range === '7d' ? 28 : 30;
    const timestamps = Array.from({ length: points }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (points - i));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    return {
      responseTime: {
        timestamps,
        authTimes: Array.from({ length: points }, () => Math.random() * 300 + 50),
        storageTimes: Array.from({ length: points }, () => Math.random() * 400 + 100),
        databaseTimes: Array.from({ length: points }, () => Math.random() * 200 + 50)
      },
      availability: {
        timestamps,
        authUptime: Array.from({ length: points }, () => 99.5 + Math.random() * 0.5),
        storageUptime: Array.from({ length: points }, () => 99.3 + Math.random() * 0.7),
        databaseUptime: Array.from({ length: points }, () => 99.8 + Math.random() * 0.2)
      },
      alerts: {
        timestamps,
        criticalAlerts: Array.from({ length: points }, () => Math.floor(Math.random() * 2)),
        warningAlerts: Array.from({ length: points }, () => Math.floor(Math.random() * 5)),
        infoAlerts: Array.from({ length: points }, () => Math.floor(Math.random() * 10))
      }
    };
  };

  return { data, isLoading, error, refetch: fetchChartData };
};
