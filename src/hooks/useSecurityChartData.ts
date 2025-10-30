import { useState, useEffect } from 'react';

interface SecurityChartData {
  scanTrends: {
    timestamps: string[];
    criticalIssues: number[];
    highIssues: number[];
    mediumIssues: number[];
    lowIssues: number[];
  };
}

export const useSecurityChartData = (timeRange: '24h' | '7d' | '30d' = '7d') => {
  const [data, setData] = useState<SecurityChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate mock data (in production, this would fetch from security scan history)
      setData(generateMockData(timeRange));
    } catch (err) {
      console.error('Failed to fetch security chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      setData(generateMockData(timeRange));
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (range: string): SecurityChartData => {
    const points = range === '24h' ? 8 : range === '7d' ? 7 : 30;
    const timestamps = Array.from({ length: points }, (_, i) => {
      const date = new Date();
      if (range === '24h') {
        date.setHours(date.getHours() - (points - i) * 3);
      } else {
        date.setDate(date.getDate() - (points - i));
      }
      return range === '24h' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    });

    // Simulate improving security over time
    return {
      scanTrends: {
        timestamps,
        criticalIssues: Array.from({ length: points }, (_, i) => Math.max(0, Math.floor((points - i) / 3))),
        highIssues: Array.from({ length: points }, (_, i) => Math.max(0, Math.floor((points - i) / 2))),
        mediumIssues: Array.from({ length: points }, (_, i) => Math.max(1, Math.floor((points - i) * 1.5))),
        lowIssues: Array.from({ length: points }, () => Math.floor(Math.random() * 5))
      }
    };
  };

  return { data, isLoading, error, refetch: fetchChartData };
};
