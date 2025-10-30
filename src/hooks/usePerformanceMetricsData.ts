import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface PerformanceMetricsData {
  trends: {
    categories: string[];
    submitted: number[];
    processed: number[];
    approved: number[];
  };
  statusDistribution: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  velocity: {
    avgProcessingTime: number;
    dailyThroughput: number;
  };
}

export const usePerformanceMetricsData = (timeRange: '7d' | '14d' | '30d' = '7d') => {
  const [data, setData] = useState<PerformanceMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetricsData();
  }, [timeRange]);

  const fetchMetricsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch applications data
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (appsError) throw appsError;

      if (!applications || applications.length === 0) {
        // Use mock data if no applications found
        setData(generateMockData(days));
        setIsLoading(false);
        return;
      }

      // Process trends data
      const trends = processApplicationTrends(applications, days);
      
      // Process status distribution
      const statusDistribution = processStatusDistribution(applications);
      
      // Calculate velocity metrics
      const velocity = calculateVelocity(applications);

      setData({ trends, statusDistribution, velocity });
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setData(generateMockData(parseInt(timeRange)));
    } finally {
      setIsLoading(false);
    }
  };

  const processApplicationTrends = (applications: any[], days: number) => {
    const categories: string[] = [];
    const submitted: number[] = [];
    const processed: number[] = [];
    const approved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      categories.push(dateStr);

      const dayApps = applications.filter(app => 
        format(new Date(app.created_at), 'MMM dd') === dateStr
      );

      submitted.push(dayApps.length);
      processed.push(dayApps.filter(app => 
        ['COMPLETED', 'APPROVED', 'REJECTED', 'CLOSURE'].includes(app.current_state)
      ).length);
      approved.push(dayApps.filter(app => 
        app.current_state === 'CLOSURE' || app.current_state === 'APPROVED'
      ).length);
    }

    return { categories, submitted, processed, approved };
  };

  const processStatusDistribution = (applications: any[]) => {
    const statusCounts: Record<string, number> = {};
    
    applications.forEach(app => {
      const state = app.current_state || 'DRAFT';
      statusCounts[state] = (statusCounts[state] || 0) + 1;
    });

    const statusConfig: Record<string, { label: string; color: string }> = {
      'DRAFT': { label: 'Draft', color: 'hsl(var(--secondary))' },
      'INTAKE_REVIEW': { label: 'Pending', color: 'hsl(var(--warning))' },
      'CONTROL_ASSIGN': { label: 'In Progress', color: 'hsl(var(--info))' },
      'CONTROL_VISIT_SCHEDULED': { label: 'Scheduled', color: 'hsl(var(--primary))' },
      'TECHNICAL_REVIEW': { label: 'Review', color: 'hsl(240, 67%, 65%)' },
      'SOCIAL_REVIEW': { label: 'Assessment', color: 'hsl(280, 67%, 65%)' },
      'DIRECTOR_REVIEW': { label: 'Director Review', color: 'hsl(320, 67%, 65%)' },
      'MINISTER_DECISION': { label: 'Final Decision', color: 'hsl(40, 67%, 65%)' },
      'CLOSURE': { label: 'Approved', color: 'hsl(var(--success))' },
      'REJECTED': { label: 'Rejected', color: 'hsl(var(--danger))' },
      'ON_HOLD': { label: 'On Hold', color: 'hsl(var(--dark))' },
    };

    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    Object.entries(statusCounts).forEach(([status, count]) => {
      const config = statusConfig[status] || { label: status, color: 'hsl(var(--secondary))' };
      labels.push(config.label);
      values.push(count);
      colors.push(config.color);
    });

    return { labels, values, colors };
  };

  const calculateVelocity = (applications: any[]) => {
    const completedApps = applications.filter(app => 
      app.completed_at && app.submitted_at
    );

    let totalDays = 0;
    completedApps.forEach(app => {
      const start = new Date(app.submitted_at);
      const end = new Date(app.completed_at);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
    });

    const avgProcessingTime = completedApps.length > 0 
      ? Math.round(totalDays / completedApps.length) 
      : 0;

    const dailyThroughput = applications.length > 0 
      ? Math.round((applications.length / parseInt(timeRange)) * 10) / 10
      : 0;

    return { avgProcessingTime, dailyThroughput };
  };

  const generateMockData = (days: number): PerformanceMetricsData => {
    const categories: string[] = [];
    const submitted: number[] = [];
    const processed: number[] = [];
    const approved: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      categories.push(format(date, 'MMM dd'));
      
      const base = Math.floor(Math.random() * 10) + 5;
      submitted.push(base);
      processed.push(Math.floor(base * 0.7));
      approved.push(Math.floor(base * 0.5));
    }

    return {
      trends: { categories, submitted, processed, approved },
      statusDistribution: {
        labels: ['Draft', 'Pending', 'In Progress', 'Approved', 'Rejected'],
        values: [12, 8, 15, 25, 5],
        colors: [
          'hsl(var(--secondary))',
          'hsl(var(--warning))',
          'hsl(var(--info))',
          'hsl(var(--success))',
          'hsl(var(--danger))',
        ],
      },
      velocity: {
        avgProcessingTime: 14,
        dailyThroughput: 3.2,
      },
    };
  };

  return { data, isLoading, error, refetch: fetchMetricsData };
};
