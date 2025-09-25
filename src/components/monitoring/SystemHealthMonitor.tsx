import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, ProgressBar, ListGroup, Tab, Tabs } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';
import { useToastNotifications } from '@/components/ui/NotificationToasts';

interface SystemHealthData {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  database: {
    connectionTime: number;
    queryPerformance: {
      simpleSelect: number;
      complexQuery: number;
      insertOperation: number;
    };
    tableStatus: {
      [tableName: string]: {
        rowCount: number;
        lastUpdated: string | null;
        healthy: boolean;
      };
    };
    connectionPoolStatus: string;
  };
  services: {
    auth: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastCheck: string;
    };
    storage: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      uploadTest: boolean;
    };
    edgeFunctions: {
      [functionName: string]: {
        status: 'healthy' | 'degraded' | 'down';
        responseTime: number;
        lastInvocation: string;
      };
    };
  };
  performance: {
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
  };
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

export const SystemHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { success, error, warning } = useToastNotifications();

  useEffect(() => {
    loadHealthData();
    
    const interval = autoRefresh ? setInterval(loadHealthData, 30000) : null; // Refresh every 30 seconds
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error: healthError } = await supabase.functions.invoke('system-health');
      
      if (healthError) throw healthError;
      
      setHealthData(data.data);
      setLastUpdate(new Date());
      
      // Show notifications based on health status
      if (data.data.overall === 'critical') {
        error('System Critical', 'Critical system issues detected');
      } else if (data.data.overall === 'degraded') {
        warning('System Degraded', 'Some system components need attention');
      } else if (data.data.alerts.length === 0) {
        success('System Healthy', 'All systems operating normally');
      }
      
    } catch (err) {
      console.error('Failed to load health data:', err);
      error('Health Check Failed', 'Unable to retrieve system health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'critical':
      case 'down': return 'danger';
      default: return 'secondary';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'solar:check-circle-bold';
      case 'degraded': return 'solar:danger-triangle-bold';
      case 'critical':
      case 'down': return 'solar:close-circle-bold';
      default: return 'solar:question-circle-bold';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(0)}ms`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading && !healthData) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <LoadingSpinner size="lg" />
          <h5 className="mt-3">Loading System Health Data</h5>
          <p className="text-muted">Performing comprehensive health assessment...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>System Health Monitor</h4>
          <p className="text-muted mb-0">Real-time system health and performance monitoring</p>
          {lastUpdate && (
            <small className="text-muted">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant={autoRefresh ? 'success' : 'outline-secondary'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <IconifyIcon icon={autoRefresh ? 'solar:pause-bold' : 'solar:play-bold'} className="me-1" />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="primary" onClick={loadHealthData} disabled={isLoading}>
            <IconifyIcon icon="solar:refresh-bold" className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      {healthData && (
        <>
          {/* System Status Overview */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className={`text-center border-${getHealthColor(healthData.overall)} border-3`}>
                <Card.Body>
                  <IconifyIcon 
                    icon={getHealthIcon(healthData.overall)}
                    className={`fs-48 text-${getHealthColor(healthData.overall)} mb-3`}
                  />
                  <h5 className="text-capitalize">{healthData.overall}</h5>
                  <Badge bg={getHealthColor(healthData.overall)}>
                    System Status
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={9}>
              <Row>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className={`text-${getHealthColor(healthData.services.auth.status)}`}>
                      <IconifyIcon icon="solar:shield-check-bold" />
                    </h4>
                    <small className="text-muted">Authentication</small>
                    <div>
                      <Badge bg={getHealthColor(healthData.services.auth.status)}>
                        {healthData.services.auth.status}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className={`text-${getHealthColor(healthData.services.storage.status)}`}>
                      <IconifyIcon icon="solar:database-bold" />
                    </h4>
                    <small className="text-muted">Storage</small>
                    <div>
                      <Badge bg={getHealthColor(healthData.services.storage.status)}>
                        {healthData.services.storage.status}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className={`text-${healthData.database.connectionTime < 500 ? 'success' : healthData.database.connectionTime < 1000 ? 'warning' : 'danger'}`}>
                      <IconifyIcon icon="solar:server-bold" />
                    </h4>
                    <small className="text-muted">Database</small>
                    <div>
                      <small>{formatResponseTime(healthData.database.connectionTime)}</small>
                    </div>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className="text-info">
                      <IconifyIcon icon="solar:bell-bold" />
                    </h4>
                    <small className="text-muted">Active Alerts</small>
                    <div>
                      <Badge bg="info">{healthData.alerts.length}</Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Active Alerts */}
          {healthData.alerts.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading className="d-flex align-items-center">
                <IconifyIcon icon="solar:danger-triangle-bold" className="me-2" />
                Active System Alerts ({healthData.alerts.length})
              </Alert.Heading>
              <ListGroup variant="flush">
                {healthData.alerts.slice(0, 5).map((alert, index) => (
                  <ListGroup.Item key={index} className="border-0 px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{alert.message}</span>
                      <Badge bg={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Alert>
          )}

          {/* Detailed Health Metrics */}
          <Tabs defaultActiveKey="services" className="mb-4">
            <Tab eventKey="services" title="Services">
              <Row>
                {/* Authentication Service */}
                <Col md={6} className="mb-3">
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Authentication Service</h6>
                      <Badge bg={getHealthColor(healthData.services.auth.status)}>
                        {healthData.services.auth.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">
                        <strong>Response Time:</strong> {formatResponseTime(healthData.services.auth.responseTime)}
                      </p>
                      <p className="mb-0">
                        <strong>Last Check:</strong> {new Date(healthData.services.auth.lastCheck).toLocaleTimeString()}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Storage Service */}
                <Col md={6} className="mb-3">
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Storage Service</h6>
                      <Badge bg={getHealthColor(healthData.services.storage.status)}>
                        {healthData.services.storage.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">
                        <strong>Response Time:</strong> {formatResponseTime(healthData.services.storage.responseTime)}
                      </p>
                      <p className="mb-0">
                        <strong>Upload Test:</strong> 
                        <Badge bg={healthData.services.storage.uploadTest ? 'success' : 'danger'} className="ms-2">
                          {healthData.services.storage.uploadTest ? 'Passed' : 'Failed'}
                        </Badge>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Edge Functions */}
                {Object.entries(healthData.services.edgeFunctions).map(([name, service]) => (
                  <Col md={6} key={name} className="mb-3">
                    <Card>
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{name}</h6>
                        <Badge bg={getHealthColor(service.status)}>
                          {service.status}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <p className="mb-2">
                          <strong>Response Time:</strong> {formatResponseTime(service.responseTime)}
                        </p>
                        <p className="mb-0">
                          <strong>Last Invocation:</strong> {new Date(service.lastInvocation).toLocaleTimeString()}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab>

            <Tab eventKey="database" title="Database">
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Connection Performance</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">
                        <strong>Connection Time:</strong> {formatResponseTime(healthData.database.connectionTime)}
                      </p>
                      <p className="mb-2">
                        <strong>Pool Status:</strong> 
                        <Badge bg={healthData.database.connectionPoolStatus === 'optimal' ? 'success' : 'warning'} className="ms-2">
                          {healthData.database.connectionPoolStatus}
                        </Badge>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Query Performance</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">
                        <strong>Simple Select:</strong> {formatResponseTime(healthData.database.queryPerformance.simpleSelect)}
                      </p>
                      <p className="mb-2">
                        <strong>Complex Query:</strong> {formatResponseTime(healthData.database.queryPerformance.complexQuery)}
                      </p>
                      <p className="mb-0">
                        <strong>Insert Operation:</strong> {formatResponseTime(healthData.database.queryPerformance.insertOperation)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">Table Status</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {Object.entries(healthData.database.tableStatus).map(([tableName, status]) => (
                          <Col md={3} key={tableName} className="mb-3">
                            <div className="border rounded p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">{tableName}</h6>
                                <Badge bg={status.healthy ? 'success' : 'danger'}>
                                  {status.healthy ? 'OK' : 'Error'}
                                </Badge>
                              </div>
                              <p className="mb-1 small">
                                <strong>Rows:</strong> {status.rowCount.toLocaleString()}
                              </p>
                              <p className="mb-0 small">
                                <strong>Last Updated:</strong> {status.lastUpdated ? new Date(status.lastUpdated).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="performance" title="Performance">
              <Row>
                <Col md={4}>
                  <Card className="mb-3">
                    <Card.Body className="text-center">
                      <h6>CPU Usage</h6>
                      <h3 className={`text-${healthData.performance.cpuUsage! > 80 ? 'danger' : healthData.performance.cpuUsage! > 60 ? 'warning' : 'success'}`}>
                        {formatPercentage(healthData.performance.cpuUsage!)}
                      </h3>
                      <ProgressBar 
                        now={healthData.performance.cpuUsage} 
                        variant={healthData.performance.cpuUsage! > 80 ? 'danger' : healthData.performance.cpuUsage! > 60 ? 'warning' : 'success'}
                      />
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="mb-3">
                    <Card.Body className="text-center">
                      <h6>Memory Usage</h6>
                      <h3 className={`text-${healthData.performance.memoryUsage! > 80 ? 'danger' : healthData.performance.memoryUsage! > 60 ? 'warning' : 'success'}`}>
                        {formatPercentage(healthData.performance.memoryUsage!)}
                      </h3>
                      <ProgressBar 
                        now={healthData.performance.memoryUsage} 
                        variant={healthData.performance.memoryUsage! > 80 ? 'danger' : healthData.performance.memoryUsage! > 60 ? 'warning' : 'success'}
                      />
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="mb-3">
                    <Card.Body className="text-center">
                      <h6>Disk Usage</h6>
                      <h3 className={`text-${healthData.performance.diskUsage! > 80 ? 'danger' : healthData.performance.diskUsage! > 60 ? 'warning' : 'success'}`}>
                        {formatPercentage(healthData.performance.diskUsage!)}
                      </h3>
                      <ProgressBar 
                        now={healthData.performance.diskUsage} 
                        variant={healthData.performance.diskUsage! > 80 ? 'danger' : healthData.performance.diskUsage! > 60 ? 'warning' : 'success'}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </>
      )}
    </div>
  );
};