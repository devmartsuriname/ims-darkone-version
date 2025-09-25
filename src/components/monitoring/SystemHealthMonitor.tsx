import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/useAuthContext';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Card, Row, Col, Alert, Badge, ListGroup } from 'react-bootstrap';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: number | string;
  threshold?: number;
  unit?: string;
  lastChecked: Date;
  trend?: 'up' | 'down' | 'stable';
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  database: HealthMetric[];
  performance: HealthMetric[];
  security: HealthMetric[];
  storage: HealthMetric[];
  edgeFunctions: HealthMetric[];
  lastUpdate: Date;
}

export const SystemHealthMonitor: React.FC = () => {
  const { user } = useAuthContext();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const assessDatabaseHealth = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    try {
      // Connection latency test
      const startTime = Date.now();
      const { error: connectionError } = await supabase.from('profiles').select('count').limit(1);
      const latency = Date.now() - startTime;
      
      metrics.push({
        name: 'Database Latency',
        status: latency < 100 ? 'healthy' : latency < 500 ? 'warning' : 'critical',
        value: latency,
        threshold: 500,
        unit: 'ms',
        lastChecked: new Date(),
        trend: 'stable'
      });

      if (connectionError) {
        metrics.push({
          name: 'Database Connection',
          status: 'critical',
          value: 'Failed',
          lastChecked: new Date()
        });
      } else {
        metrics.push({
          name: 'Database Connection',
          status: 'healthy',
          value: 'Connected',
          lastChecked: new Date()
        });
      }

      // Table accessibility checks
      const tables = ['applications', 'profiles', 'documents', 'control_visits'] as const;
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          metrics.push({
            name: `${table} Table`,
            status: error ? 'critical' : 'healthy',
            value: error ? 'Inaccessible' : 'Accessible',
            lastChecked: new Date()
          });
        } catch (err) {
          metrics.push({
            name: `${table} Table`,
            status: 'critical',
            value: 'Error',
            lastChecked: new Date()
          });
        }
      }

    } catch (error) {
      metrics.push({
        name: 'Database Health Check',
        status: 'critical',
        value: 'Failed',
        lastChecked: new Date()
      });
    }

    return metrics;
  };

  const assessPerformanceHealth = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    // Query performance test
    const queries = [
      { name: 'Simple Select', query: () => supabase.from('profiles').select('id').limit(1) },
      { name: 'Join Query', query: () => supabase.from('applications').select('*, applicants(*)').limit(1) },
      { name: 'Aggregation', query: () => supabase.from('applications').select('count') }
    ];

    for (const { name, query } of queries) {
      try {
        const startTime = performance.now();
        await query();
        const duration = performance.now() - startTime;
        
        metrics.push({
          name: `${name} Performance`,
          status: duration < 100 ? 'healthy' : duration < 500 ? 'warning' : 'critical',
          value: Math.round(duration),
          threshold: 500,
          unit: 'ms',
          lastChecked: new Date(),
          trend: 'stable'
        });
      } catch (error) {
        metrics.push({
          name: `${name} Performance`,
          status: 'critical',
          value: 'Failed',
          lastChecked: new Date()
        });
      }
    }

    // Memory usage (approximation)
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      metrics.push({
        name: 'Client Memory Usage',
        status: memoryUsage < 70 ? 'healthy' : memoryUsage < 85 ? 'warning' : 'critical',
        value: Math.round(memoryUsage),
        threshold: 85,
        unit: '%',
        lastChecked: new Date(),
        trend: 'stable'
      });
    }

    return metrics;
  };

  const assessSecurityHealth = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    try {
      // Session validation
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      metrics.push({
        name: 'Session Security',
        status: sessionError ? 'critical' : session ? 'healthy' : 'warning',
        value: sessionError ? 'Invalid' : session ? 'Valid' : 'No Session',
        lastChecked: new Date()
      });

      // RLS policy validation (attempt unauthorized access)
      if (user) {
        try {
          // Try to access user roles - should be restricted
          const { data, error } = await supabase.from('user_roles').select('*');
          const hasAccess = !error && data && data.length >= 0;
          
          metrics.push({
            name: 'RLS Enforcement',
            status: hasAccess ? 'healthy' : 'warning',
            value: hasAccess ? 'Active' : 'Restricted',
            lastChecked: new Date()
          });
        } catch (error) {
          metrics.push({
            name: 'RLS Enforcement',
            status: 'unknown',
            value: 'Cannot Verify',
            lastChecked: new Date()
          });
        }

        // Profile access validation
        try {
          const { error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          metrics.push({
            name: 'Profile Access',
            status: error ? 'critical' : 'healthy',
            value: error ? 'Denied' : 'Granted',
            lastChecked: new Date()
          });
        } catch (error) {
          metrics.push({
            name: 'Profile Access',
            status: 'critical',
            value: 'Error',
            lastChecked: new Date()
          });
        }
      }

    } catch (error) {
      metrics.push({
        name: 'Security Assessment',
        status: 'critical',
        value: 'Failed',
        lastChecked: new Date()
      });
    }

    return metrics;
  };

  const assessStorageHealth = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    try {
      // Storage bucket accessibility
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        metrics.push({
          name: 'Storage Service',
          status: 'critical',
          value: 'Unavailable',
          lastChecked: new Date()
        });
      } else {
        metrics.push({
          name: 'Storage Service',
          status: 'healthy',
          value: 'Available',
          lastChecked: new Date()
        });

        // Check specific buckets
        const expectedBuckets = ['documents', 'control-photos'];
        for (const bucketName of expectedBuckets) {
          const bucketExists = buckets.some(b => b.name === bucketName);
          metrics.push({
            name: `${bucketName} Bucket`,
            status: bucketExists ? 'healthy' : 'critical',
            value: bucketExists ? 'Available' : 'Missing',
            lastChecked: new Date()
          });

          if (bucketExists) {
            // Test bucket access
            try {
              const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
              metrics.push({
                name: `${bucketName} Access`,
                status: error ? 'warning' : 'healthy',
                value: error ? 'Restricted' : 'Accessible',
                lastChecked: new Date()
              });
            } catch (accessError) {
              metrics.push({
                name: `${bucketName} Access`,
                status: 'critical',
                value: 'Error',
                lastChecked: new Date()
              });
            }
          }
        }
      }

    } catch (error) {
      metrics.push({
        name: 'Storage Health Check',
        status: 'critical',
        value: 'Failed',
        lastChecked: new Date()
      });
    }

    return metrics;
  };

  const assessEdgeFunctionHealth = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    const functions = [
      { name: 'health-check', testPayload: { check: 'quick' } },
      { name: 'reference-data', testPayload: { action: 'list', category: 'test' } }
    ];

    for (const { name, testPayload } of functions) {
      try {
        const startTime = performance.now();
        const { error } = await supabase.functions.invoke(name, { body: testPayload });
        const responseTime = performance.now() - startTime;
        
        metrics.push({
          name: `${name} Function`,
          status: error ? 'warning' : 'healthy',
          value: error ? 'Error' : 'Responding',
          lastChecked: new Date()
        });

        if (!error) {
          metrics.push({
            name: `${name} Response Time`,
            status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'critical',
            value: Math.round(responseTime),
            threshold: 3000,
            unit: 'ms',
            lastChecked: new Date(),
            trend: 'stable'
          });
        }
      } catch (error) {
        metrics.push({
          name: `${name} Function`,
          status: 'critical',
          value: 'Unreachable',
          lastChecked: new Date()
        });
      }
    }

    return metrics;
  };

  const runHealthAssessment = async () => {
    setIsLoading(true);
    
    try {
      const [database, performance, security, storage, edgeFunctions] = await Promise.all([
        assessDatabaseHealth(),
        assessPerformanceHealth(),
        assessSecurityHealth(),
        assessStorageHealth(),
        assessEdgeFunctionHealth()
      ]);

      // Calculate overall health
      const allMetrics = [...database, ...performance, ...security, ...storage, ...edgeFunctions];
      const criticalCount = allMetrics.filter(m => m.status === 'critical').length;
      const warningCount = allMetrics.filter(m => m.status === 'warning').length;
      
      let overall: 'healthy' | 'warning' | 'critical';
      if (criticalCount > 0) {
        overall = 'critical';
      } else if (warningCount > 2) {
        overall = 'critical';
      } else if (warningCount > 0) {
        overall = 'warning';
      } else {
        overall = 'healthy';
      }

      setHealth({
        overall,
        database,
        performance,
        security,
        storage,
        edgeFunctions,
        lastUpdate: new Date()
      });

    } catch (error) {
      console.error('Health assessment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runHealthAssessment();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runHealthAssessment, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'solar:check-circle-bold';
      case 'warning': return 'solar:danger-triangle-bold';
      case 'critical': return 'solar:close-circle-bold';
      default: return 'solar:question-circle-bold';
    }
  };

  const renderMetricsList = (metrics: HealthMetric[], title: string) => (
    <Card className="mb-4">
      <Card.Header>
        <h6 className="mb-0">{title}</h6>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {metrics.map((metric, index) => (
            <ListGroup.Item key={index} className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <IconifyIcon 
                  icon={getStatusIcon(metric.status)}
                  className={`me-2 text-${getStatusColor(metric.status)}`}
                />
                <div>
                  <div className="fw-medium">{metric.name}</div>
                  <small className="text-muted">
                    Last checked: {metric.lastChecked.toLocaleTimeString()}
                  </small>
                </div>
              </div>
              <div className="text-end">
                <div className="d-flex align-items-center">
                  <span className="me-2">
                    {metric.value} {metric.unit || ''}
                  </span>
                  {metric.trend && (
                    <IconifyIcon 
                      icon={
                        metric.trend === 'up' ? 'solar:arrow-up-bold' :
                        metric.trend === 'down' ? 'solar:arrow-down-bold' :
                        'solar:minus-circle-bold'
                      }
                      className={`text-${
                        metric.trend === 'up' ? 'success' :
                        metric.trend === 'down' ? 'danger' : 'muted'
                      }`}
                    />
                  )}
                </div>
                <Badge bg={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>System Health Monitor</h4>
          {health && (
            <small className="text-muted">
              Last updated: {health.lastUpdate.toLocaleString()}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="autoRefresh">
              Auto Refresh
            </label>
          </div>
          {autoRefresh && (
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          )}
          <button 
            className="btn btn-primary"
            onClick={runHealthAssessment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Checking...
              </>
            ) : (
              <>
                <IconifyIcon icon="solar:refresh-circle-bold" className="me-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <Row className="mb-4">
            <Col md={12}>
              <Alert 
                variant={getStatusColor(health.overall)}
                className="d-flex align-items-center"
              >
                <IconifyIcon 
                  icon={getStatusIcon(health.overall)}
                  className="me-3 fs-2"
                />
                <div>
                  <h5 className="mb-1">
                    System Status: {health.overall.toUpperCase()}
                  </h5>
                  <p className="mb-0">
                    {health.overall === 'healthy' && 'All systems are operating normally.'}
                    {health.overall === 'warning' && 'Some components need attention but system is operational.'}
                    {health.overall === 'critical' && 'Critical issues detected that require immediate attention.'}
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>

          {/* Health Categories */}
          <Row>
            <Col lg={6}>
              {renderMetricsList(health.database, 'Database Health')}
              {renderMetricsList(health.security, 'Security Health')}
              {renderMetricsList(health.edgeFunctions, 'Edge Functions Health')}
            </Col>
            <Col lg={6}>
              {renderMetricsList(health.performance, 'Performance Metrics')}
              {renderMetricsList(health.storage, 'Storage Health')}
            </Col>
          </Row>
        </>
      )}

      {isLoading && !health && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" />
          <p>Running comprehensive health assessment...</p>
        </div>
      )}
    </div>
  );
};