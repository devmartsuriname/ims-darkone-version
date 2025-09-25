import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

interface SystemStats {
  applications: {
    total: number;
    pending: number;
    completed: number;
    avgProcessingTime: number;
  };
  users: {
    total: number;
    active: number;
    newThisWeek: number;
  };
  sla: {
    onTime: number;
    overdue: number;
    compliance: number;
  };
  storage: {
    documents: number;
    photos: number;
    totalSize: string;
  };
}

export const SystemMetricsDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerformance, setShowPerformance] = useState(false);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setIsLoading(true);

      // Fetch applications data
      const { data: applications } = await supabase
        .from('applications')
        .select('current_state, created_at, updated_at');

      // Fetch users data
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at');

      // Fetch tasks for SLA tracking
      const { data: tasks } = await supabase
        .from('tasks')
        .select('due_date, completed_at, created_at');

      // Fetch documents count
      const { data: documents } = await supabase
        .from('documents')
        .select('id');

      // Calculate stats
      const appStats = {
        total: applications?.length || 0,
        pending: applications?.filter(app => app.current_state && !['CLOSURE', 'REJECTED'].includes(app.current_state)).length || 0,
        completed: applications?.filter(app => app.current_state && ['CLOSURE', 'REJECTED'].includes(app.current_state)).length || 0,
        avgProcessingTime: calculateAvgProcessingTime(applications || [])
      };

      const userStats = {
        total: users?.length || 0,
        active: users?.filter(user => {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return user.created_at && new Date(user.created_at) > lastWeek;
        }).length || 0,
        newThisWeek: users?.filter(user => {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return user.created_at && new Date(user.created_at) > lastWeek;
        }).length || 0
      };

      const slaStats = calculateSLAStats(tasks || []);

      const storageStats = {
        documents: documents?.length || 0,
        photos: 0, // Would need to query storage bucket
        totalSize: '0 MB' // Would need to calculate from storage
      };

      setStats({
        applications: appStats,
        users: userStats,
        sla: slaStats,
        storage: storageStats
      });
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAvgProcessingTime = (applications: any[]) => {
    const completed = applications.filter(app => 
      ['CLOSURE', 'REJECTED'].includes(app.current_state) && app.updated_at
    );
    
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, app) => {
      const start = new Date(app.created_at);
      const end = new Date(app.updated_at);
      return sum + (end.getTime() - start.getTime());
    }, 0);

    return Math.round(totalTime / completed.length / (1000 * 60 * 60 * 24)); // Days
  };

  const calculateSLAStats = (tasks: any[]) => {
    const now = new Date();
    const onTime = tasks.filter(task => {
      if (task.completed_at) {
        return new Date(task.completed_at) <= new Date(task.due_date);
      }
      return new Date(task.due_date) >= now;
    }).length;

    const overdue = tasks.filter(task => {
      if (!task.completed_at) {
        return new Date(task.due_date) < now;
      }
      return false;
    }).length;

    const compliance = tasks.length > 0 ? Math.round((onTime / tasks.length) * 100) : 100;

    return { onTime, overdue, compliance };
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner />
          <p className="mt-2 text-muted">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  if (showPerformance) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5>Performance Monitoring</h5>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowPerformance(false)}
          >
            <IconifyIcon icon="solar:arrow-left-bold" className="me-2" />
            Back to Overview
          </button>
        </div>
        <PerformanceMonitor />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>System Metrics Dashboard</h5>
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => setShowPerformance(true)}
          >
            <IconifyIcon icon="solar:chart-square-bold" className="me-2" />
            Performance Monitor
          </button>
          <button 
            className="btn btn-primary"
            onClick={fetchSystemStats}
            disabled={isLoading}
          >
            <IconifyIcon icon="solar:refresh-bold" className="me-2" />
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className="row g-3">
          {/* Applications Stats */}
          <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <div className="card border-start border-primary border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-2">Total Applications</h6>
                    <h3 className="mb-0">{stats.applications.total}</h3>
                    <small className="text-muted">
                      {stats.applications.pending} pending, {stats.applications.completed} completed
                    </small>
                  </div>
                  <div className="flex-shrink-0">
                    <IconifyIcon icon="solar:document-bold" className="text-primary fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Stats */}
          <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <div className="card border-start border-success border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-2">Total Users</h6>
                    <h3 className="mb-0">{stats.users.total}</h3>
                    <small className="text-success">
                      +{stats.users.newThisWeek} this week
                    </small>
                  </div>
                  <div className="flex-shrink-0">
                    <IconifyIcon icon="solar:users-group-rounded-bold" className="text-success fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Compliance */}
          <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <div className="card border-start border-warning border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-2">SLA Compliance</h6>
                    <h3 className="mb-0">{stats.sla.compliance}%</h3>
                    <small className="text-muted">
                      {stats.sla.overdue} overdue tasks
                    </small>
                  </div>
                  <div className="flex-shrink-0">
                    <IconifyIcon icon="solar:clock-circle-bold" className="text-warning fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <div className="card border-start border-info border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-2">Avg Processing Time</h6>
                    <h3 className="mb-0">{stats.applications.avgProcessingTime}</h3>
                    <small className="text-muted">days</small>
                  </div>
                  <div className="flex-shrink-0">
                    <IconifyIcon icon="solar:hourglass-bold" className="text-info fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Stats */}
          <div className="col-xxl-6 col-xl-12 col-lg-6 col-md-6 col-sm-12">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Storage Usage</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center">
                      <IconifyIcon icon="solar:document-text-bold" className="text-primary fs-2" />
                      <h5 className="mt-2 mb-1">{stats.storage.documents}</h5>
                      <small className="text-muted">Documents</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <IconifyIcon icon="solar:camera-bold" className="text-success fs-2" />
                      <h5 className="mt-2 mb-1">{stats.storage.photos}</h5>
                      <small className="text-muted">Photos</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-xxl-6 col-xl-12 col-lg-6 col-md-6 col-sm-12">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Quick Actions</h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowPerformance(true)}
                  >
                    <IconifyIcon icon="solar:chart-square-bold" className="me-2" />
                    <span className="d-none d-sm-inline">View Performance Details</span>
                    <span className="d-sm-none">Performance</span>
                  </button>
                  <button className="btn btn-outline-success">
                    <IconifyIcon icon="solar:download-bold" className="me-2" />
                    <span className="d-none d-sm-inline">Export System Report</span>
                    <span className="d-sm-none">Export</span>
                  </button>
                  <button className="btn btn-outline-warning">
                    <IconifyIcon icon="solar:settings-bold" className="me-2" />
                    <span className="d-none d-sm-inline">System Configuration</span>
                    <span className="d-sm-none">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};