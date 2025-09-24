import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: { warning: number; critical: number };
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  edgeFunctions: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  overall: 'healthy' | 'warning' | 'critical';
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);

      // Fetch database performance metrics
      const dbStartTime = Date.now();
      await supabase
        .from('applications')
        .select('id')
        .limit(1);
      const dbResponseTime = Date.now() - dbStartTime;

      // Test edge function performance
      const edgeStartTime = Date.now();
      await supabase.functions.invoke('health-check', {
        body: { action: 'ping' }
      });
      const edgeResponseTime = Date.now() - edgeStartTime;

      // Test storage performance
      const storageStartTime = Date.now();
      await supabase.storage
        .from('documents')
        .list('', { limit: 1 });
      const storageResponseTime = Date.now() - storageStartTime;

      // Calculate metrics
      const performanceMetrics: PerformanceMetric[] = [
        {
          name: 'Database Response Time',
          value: dbResponseTime,
          unit: 'ms',
          status: dbResponseTime < 500 ? 'good' : dbResponseTime < 1000 ? 'warning' : 'critical',
          threshold: { warning: 500, critical: 1000 }
        },
        {
          name: 'Edge Function Response Time',
          value: edgeResponseTime,
          unit: 'ms',
          status: edgeResponseTime < 1000 ? 'good' : edgeResponseTime < 2000 ? 'warning' : 'critical',
          threshold: { warning: 1000, critical: 2000 }
        },
        {
          name: 'Storage Response Time',
          value: storageResponseTime,
          unit: 'ms',
          status: storageResponseTime < 800 ? 'good' : storageResponseTime < 1500 ? 'warning' : 'critical',
          threshold: { warning: 800, critical: 1500 }
        }
      ];

      // Calculate system health
      const health: SystemHealth = {
        database: dbResponseTime < 500 ? 'healthy' : dbResponseTime < 1000 ? 'warning' : 'critical',
        edgeFunctions: edgeResponseTime < 1000 ? 'healthy' : edgeResponseTime < 2000 ? 'warning' : 'critical',
        storage: storageResponseTime < 800 ? 'healthy' : storageResponseTime < 1500 ? 'warning' : 'critical',
        overall: 'healthy'
      };

      // Determine overall health
      const hasWarning = Object.values(health).some(status => status === 'warning');
      const hasCritical = Object.values(health).some(status => status === 'critical');
      
      if (hasCritical) {
        health.overall = 'critical';
      } else if (hasWarning) {
        health.overall = 'warning';
      }

      setMetrics(performanceMetrics);
      setSystemHealth(health);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setSystemHealth({
        database: 'critical',
        edgeFunctions: 'critical',
        storage: 'critical',
        overall: 'critical'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return 'solar:check-circle-bold';
      case 'warning':
        return 'solar:warning-circle-bold';
      case 'critical':
        return 'solar:close-circle-bold';
      default:
        return 'solar:question-circle-bold';
    }
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner />
          <p className="mt-2 text-muted">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* System Health Overview */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">System Health Overview</h5>
              <div className="d-flex align-items-center">
                {isLoading && <LoadingSpinner size="sm" className="me-2" />}
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchPerformanceData}
                  disabled={isLoading}
                >
                  <IconifyIcon icon="solar:refresh-bold" className="me-1" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {systemHealth && (
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <IconifyIcon 
                      icon={getStatusIcon(systemHealth.overall)} 
                      className={`fs-1 ${getStatusColor(systemHealth.overall)}`} 
                    />
                    <h6 className="mt-2">Overall Status</h6>
                    <span className={`badge ${systemHealth.overall === 'healthy' ? 'bg-success' : systemHealth.overall === 'warning' ? 'bg-warning' : 'bg-danger'}`}>
                      {systemHealth.overall.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-2">
                        <IconifyIcon 
                          icon={getStatusIcon(systemHealth.database)} 
                          className={`me-2 ${getStatusColor(systemHealth.database)}`} 
                        />
                        <span>Database</span>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-2">
                        <IconifyIcon 
                          icon={getStatusIcon(systemHealth.edgeFunctions)} 
                          className={`me-2 ${getStatusColor(systemHealth.edgeFunctions)}`} 
                        />
                        <span>Edge Functions</span>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-2">
                        <IconifyIcon 
                          icon={getStatusIcon(systemHealth.storage)} 
                          className={`me-2 ${getStatusColor(systemHealth.storage)}`} 
                        />
                        <span>Storage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {lastUpdate && (
              <div className="text-center mt-3">
                <small className="text-muted">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="col-12">
        <div className="row">
          {metrics.map((metric, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">{metric.name}</h6>
                      <h4 className={`mb-0 ${getStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </h4>
                    </div>
                    <IconifyIcon 
                      icon={getStatusIcon(metric.status)} 
                      className={`fs-3 ${getStatusColor(metric.status)}`} 
                    />
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      Warning: &gt;{metric.threshold.warning}{metric.unit} | 
                      Critical: &gt;{metric.threshold.critical}{metric.unit}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="col-12 mt-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Performance Recommendations</h5>
          </div>
          <div className="card-body">
            {systemHealth?.overall === 'critical' && (
              <div className="alert alert-danger">
                <IconifyIcon icon="solar:warning-circle-bold" className="me-2" />
                <strong>Critical Issues Detected!</strong> Immediate action required.
              </div>
            )}
            
            {systemHealth?.overall === 'warning' && (
              <div className="alert alert-warning">
                <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
                <strong>Performance Warnings:</strong> Consider optimization.
              </div>
            )}

            <div className="row">
              <div className="col-md-6">
                <h6>Database Optimization</h6>
                <ul className="small">
                  <li>Review slow queries and add indexes</li>
                  <li>Consider connection pooling</li>
                  <li>Monitor active connections</li>
                  <li>Optimize complex JOIN operations</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>System Monitoring</h6>
                <ul className="small">
                  <li>Set up automated alerting</li>
                  <li>Monitor edge function logs</li>
                  <li>Track storage usage trends</li>
                  <li>Implement health check endpoints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};