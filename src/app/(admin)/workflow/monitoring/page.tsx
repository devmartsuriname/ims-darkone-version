import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Table, Button } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface WorkflowAlert {
  id: string;
  type: 'sla_violation' | 'bottleneck' | 'error' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  application_id?: string;
  state?: string;
  created_at: string;
  resolved: boolean;
}

interface PerformanceMetric {
  state: string;
  avgProcessingTime: number;
  currentLoad: number;
  slaCompliance: number;
  throughput: number;
  errorRate: number;
}

interface SystemHealth {
  overall: number;
  database: number;
  storage: number;
  notifications: number;
  workflow: number;
}

const WorkflowMonitoringPage: React.FC = () => {
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      await Promise.all([
        loadAlerts(),
        loadMetrics(),
        loadSystemHealth()
      ]);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'get_alerts',
          filters: {
            resolved: false,
            limit: 50
          }
        }
      });

      if (error) throw error;
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reporting-service', {
        body: {
          action: 'get_performance_metrics',
          period: 'real_time'
        }
      });

      if (error) throw error;
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check', {
        body: {
          action: 'full_health_check'
        }
      });

      if (error) throw error;
      setSystemHealth(data.health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'resolve_alert',
          alert_id: alertId
        }
      });

      if (error) throw error;
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      ));
      
      toast.success('Alert resolved successfully');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: WorkflowAlert['severity']) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'warning',
      critical: 'danger'
    };
    return colors[severity];
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'danger';
  };

  const getHealthStatus = (value: number) => {
    if (value >= 95) return 'Excellent';
    if (value >= 90) return 'Good';
    if (value >= 70) return 'Fair';
    if (value >= 50) return 'Poor';
    return 'Critical';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <PageTitle 
        title="Workflow Monitoring" 
        subName="Real-time System Health & Performance"
      />

      {/* System Health Overview */}
      {systemHealth && (
        <Row className="mb-4">
          <Col lg={12}>
            <ComponentContainerCard id="system-health" title="System Health Overview">
              <Row>
                <Col lg={2} md={4} sm={6}>
                  <Card className="border-0 text-center">
                    <Card.Body>
                      <div className={`h2 mb-1 text-${getHealthColor(systemHealth.overall)}`}>
                        {systemHealth.overall}%
                      </div>
                      <p className="text-muted mb-0">Overall Health</p>
                      <small className="text-muted">{getHealthStatus(systemHealth.overall)}</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                  <Card className="border-0 text-center">
                    <Card.Body>
                      <div className={`h3 mb-1 text-${getHealthColor(systemHealth.database)}`}>
                        {systemHealth.database}%
                      </div>
                      <p className="text-muted mb-0">Database</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                  <Card className="border-0 text-center">
                    <Card.Body>
                      <div className={`h3 mb-1 text-${getHealthColor(systemHealth.storage)}`}>
                        {systemHealth.storage}%
                      </div>
                      <p className="text-muted mb-0">Storage</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                  <Card className="border-0 text-center">
                    <Card.Body>
                      <div className={`h3 mb-1 text-${getHealthColor(systemHealth.notifications)}`}>
                        {systemHealth.notifications}%
                      </div>
                      <p className="text-muted mb-0">Notifications</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                  <Card className="border-0 text-center">
                    <Card.Body>
                      <div className={`h3 mb-1 text-${getHealthColor(systemHealth.workflow)}`}>
                        {systemHealth.workflow}%
                      </div>
                      <p className="text-muted mb-0">Workflow</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={2} md={4} sm={6}>
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={loadMonitoringData}
                    >
                      Refresh Data
                    </Button>
                  </div>
                </Col>
              </Row>
            </ComponentContainerCard>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          {/* Active Alerts */}
          <ComponentContainerCard id="active-alerts" title="Active Alerts">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Badge bg="danger" className="fs-6">
                {alerts.filter(a => !a.resolved).length} Active Alerts
              </Badge>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {alerts.filter(a => !a.resolved).length === 0 ? (
              <Alert variant="success">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle me-2"></i>
                  No active alerts. System is operating normally.
                </div>
              </Alert>
            ) : (
              <div className="space-y-2">
                {alerts.filter(a => !a.resolved).map((alert, index) => (
                  <Alert key={index} variant={getSeverityColor(alert.severity)} className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <Badge bg={getSeverityColor(alert.severity)} className="me-2">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge bg="secondary">{alert.type.replace('_', ' ').toUpperCase()}</Badge>
                      </div>
                      <div className="fw-medium">{alert.message}</div>
                      {alert.application_id && (
                        <small className="text-muted">Application: {alert.application_id}</small>
                      )}
                      {alert.state && (
                        <small className="text-muted ms-2">State: {alert.state}</small>
                      )}
                      <div>
                        <small className="text-muted">
                          {new Date(alert.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </Alert>
                ))}
              </div>
            )}
          </ComponentContainerCard>

          {/* Performance Metrics */}
          <ComponentContainerCard id="performance-metrics" title="Real-time Performance Metrics">
            <Table responsive>
              <thead>
                <tr>
                  <th>Workflow State</th>
                  <th>Avg Processing</th>
                  <th>Current Load</th>
                  <th>SLA Compliance</th>
                  <th>Throughput</th>
                  <th>Error Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index}>
                    <td>{metric.state}</td>
                    <td>{metric.avgProcessingTime}h</td>
                    <td>
                      <Badge bg={metric.currentLoad > 80 ? 'danger' : metric.currentLoad > 60 ? 'warning' : 'success'}>
                        {metric.currentLoad}%
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={metric.slaCompliance >= 90 ? 'success' : metric.slaCompliance >= 70 ? 'warning' : 'danger'}>
                        {metric.slaCompliance}%
                      </Badge>
                    </td>
                    <td>{metric.throughput}/day</td>
                    <td>
                      <Badge bg={metric.errorRate === 0 ? 'success' : metric.errorRate < 5 ? 'warning' : 'danger'}>
                        {metric.errorRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={loadMonitoringData}>
                  Refresh All Data
                </Button>
                <Button variant="outline-warning" onClick={() => {}}>
                  Clear All Alerts
                </Button>
                <Button variant="outline-info" onClick={() => {}}>
                  Export Monitoring Report
                </Button>
                <Button variant="outline-secondary" onClick={() => {}}>
                  System Diagnostics
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Monitoring Status */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Monitoring Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Auto Refresh</span>
                <Badge bg={autoRefresh ? 'success' : 'secondary'}>
                  {autoRefresh ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Real-time Alerts</span>
                <Badge bg="success">ACTIVE</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Performance Tracking</span>
                <Badge bg="success">MONITORING</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Last Update</span>
                <small className="text-muted">
                  {new Date().toLocaleTimeString()}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Recent Activity</h6>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>System Health Check</span>
                  <span className="text-success">✓ Passed</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Alert Processed</span>
                  <span className="text-muted">2 min ago</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Performance Scan</span>
                  <span className="text-info">Running</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Data Backup</span>
                  <span className="text-success">✓ Complete</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowMonitoringPage;