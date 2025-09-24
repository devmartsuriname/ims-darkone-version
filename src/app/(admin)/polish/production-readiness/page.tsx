import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, Table, ProgressBar, Form } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface ProductionCheck {
  category: string;
  checks: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning' | 'manual';
    description: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    automated: boolean;
    details?: string;
  }>;
}

interface DeploymentEnvironment {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  lastDeployed: string;
  metrics: {
    uptime: number;
    performance: number;
    errors: number;
  };
}

interface SecurityScan {
  scanType: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: number;
  lastRun: string;
  nextRun: string;
}

const ProductionReadinessPage: React.FC = () => {
  const [productionChecks, setProductionChecks] = useState<ProductionCheck[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');

  useEffect(() => {
    loadProductionData();
  }, []);

  const loadProductionData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProductionChecks(),
        loadEnvironments(),
        loadSecurityScans()
      ]);
    } catch (error) {
      console.error('Failed to load production data:', error);
      toast.error('Failed to load production readiness data');
    } finally {
      setLoading(false);
    }
  };

  const loadProductionChecks = async () => {
    // Simulate production readiness checks
    const checks: ProductionCheck[] = [
      {
        category: 'Security',
        checks: [
          {
            name: 'SSL/TLS Configuration',
            status: 'passed',
            description: 'HTTPS enabled with valid certificates',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'Security Headers',
            status: 'passed',
            description: 'All required security headers configured',
            criticality: 'high',
            automated: true
          },
          {
            name: 'Secrets Management',
            status: 'passed',
            description: 'API keys and secrets properly secured',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'CORS Configuration',
            status: 'warning',
            description: 'CORS policy should be reviewed',
            criticality: 'medium',
            automated: true,
            details: 'Consider restricting origins for production'
          }
        ]
      },
      {
        category: 'Performance',
        checks: [
          {
            name: 'Bundle Optimization',
            status: 'passed',
            description: 'JavaScript bundles optimized and minified',
            criticality: 'high',
            automated: true
          },
          {
            name: 'Image Optimization',
            status: 'warning',
            description: 'Some images could be further optimized',
            criticality: 'medium',
            automated: true,
            details: 'Consider WebP format for better compression'
          },
          {
            name: 'Caching Strategy',
            status: 'passed',
            description: 'Proper cache headers configured',
            criticality: 'high',
            automated: true
          },
          {
            name: 'CDN Configuration',
            status: 'passed',
            description: 'Static assets served via CDN',
            criticality: 'medium',
            automated: true
          }
        ]
      },
      {
        category: 'Monitoring',
        checks: [
          {
            name: 'Error Tracking',
            status: 'passed',
            description: 'Error monitoring system configured',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'Performance Monitoring',
            status: 'passed',
            description: 'Real-time performance metrics available',
            criticality: 'high',
            automated: true
          },
          {
            name: 'Uptime Monitoring',
            status: 'passed',
            description: 'Service availability monitoring active',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'Log Aggregation',
            status: 'passed',
            description: 'Centralized logging configured',
            criticality: 'high',
            automated: true
          }
        ]
      },
      {
        category: 'Database',
        checks: [
          {
            name: 'Backup Strategy',
            status: 'passed',
            description: 'Automated backups configured',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'Connection Pooling',
            status: 'passed',
            description: 'Database connection pooling enabled',
            criticality: 'high',
            automated: true
          },
          {
            name: 'Query Performance',
            status: 'warning',
            description: 'Some queries may need optimization',
            criticality: 'medium',
            automated: true,
            details: 'Consider adding indexes for frequently accessed data'
          },
          {
            name: 'Data Validation',
            status: 'passed',
            description: 'Input validation and sanitization enabled',
            criticality: 'critical',
            automated: true
          }
        ]
      },
      {
        category: 'Compliance',
        checks: [
          {
            name: 'Data Privacy (GDPR)',
            status: 'manual',
            description: 'Privacy policy and data handling procedures',
            criticality: 'critical',
            automated: false,
            details: 'Requires manual review and legal approval'
          },
          {
            name: 'Accessibility (WCAG)',
            status: 'passed',
            description: 'Web accessibility guidelines compliance',
            criticality: 'high',
            automated: true
          },
          {
            name: 'Security Compliance',
            status: 'passed',
            description: 'Security standards and best practices',
            criticality: 'critical',
            automated: true
          },
          {
            name: 'Audit Logging',
            status: 'passed',
            description: 'User actions and system events logged',
            criticality: 'high',
            automated: true
          }
        ]
      }
    ];
    setProductionChecks(checks);
  };

  const loadEnvironments = async () => {
    // Simulate environment status
    const envs: DeploymentEnvironment[] = [
      {
        name: 'Production',
        status: 'healthy',
        version: 'v1.2.3',
        lastDeployed: '2024-01-15T10:30:00Z',
        metrics: {
          uptime: 99.9,
          performance: 95,
          errors: 0.1
        }
      },
      {
        name: 'Staging',
        status: 'healthy',
        version: 'v1.2.4-rc.1',
        lastDeployed: '2024-01-16T14:20:00Z',
        metrics: {
          uptime: 99.5,
          performance: 92,
          errors: 0.3
        }
      },
      {
        name: 'Development',
        status: 'degraded',
        version: 'v1.3.0-dev',
        lastDeployed: '2024-01-16T16:45:00Z',
        metrics: {
          uptime: 95.2,
          performance: 88,
          errors: 2.1
        }
      }
    ];
    setEnvironments(envs);
  };

  const loadSecurityScans = async () => {
    // Simulate security scan results
    const scans: SecurityScan[] = [
      {
        scanType: 'Vulnerability Scan',
        status: 'completed',
        severity: 'low',
        findings: 2,
        lastRun: '2024-01-16T02:00:00Z',
        nextRun: '2024-01-17T02:00:00Z'
      },
      {
        scanType: 'Dependency Audit',
        status: 'completed',
        severity: 'medium',
        findings: 5,
        lastRun: '2024-01-16T03:00:00Z',
        nextRun: '2024-01-17T03:00:00Z'
      },
      {
        scanType: 'Code Security Analysis',
        status: 'completed',
        severity: 'low',
        findings: 1,
        lastRun: '2024-01-16T04:00:00Z',
        nextRun: '2024-01-17T04:00:00Z'
      },
      {
        scanType: 'Infrastructure Scan',
        status: 'pending',
        severity: 'low',
        findings: 0,
        lastRun: '2024-01-15T04:00:00Z',
        nextRun: '2024-01-16T20:00:00Z'
      }
    ];
    setSecurityScans(scans);
  };

  const runProductionChecks = async () => {
    setRunningChecks(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_production_checks'
        }
      });

      if (error) throw error;
      
      toast.success('Production readiness checks completed');
      await loadProductionChecks();
    } catch (error) {
      console.error('Production checks failed:', error);
      toast.error('Production checks failed');
    } finally {
      setRunningChecks(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'success',
      failed: 'danger',
      warning: 'warning',
      manual: 'secondary',
      healthy: 'success',
      degraded: 'warning',
      down: 'danger',
      completed: 'success',
      running: 'primary',
      pending: 'secondary'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getCriticalityColor = (criticality: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'primary',
      critical: 'danger'
    };
    return colors[criticality as keyof typeof colors] || 'secondary';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'primary',
      critical: 'danger'
    };
    return colors[severity as keyof typeof colors] || 'secondary';
  };

  const getOverallScore = () => {
    const allChecks = productionChecks.flatMap(category => category.checks);
    const passed = allChecks.filter(check => check.status === 'passed').length;
    const total = allChecks.length;
    return Math.round((passed / total) * 100);
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
        title="Production Readiness" 
        subName="Pre-deployment Validation & Environment Status"
      />

      {/* Production Readiness Score */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{getOverallScore()}%</div>
                <p className="text-muted mb-0">Production Ready Score</p>
              </div>
              <ProgressBar 
                now={getOverallScore()} 
                variant={getOverallScore() >= 90 ? 'success' : getOverallScore() >= 75 ? 'warning' : 'danger'}
                className="mb-3"
              />
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={runProductionChecks}
                  disabled={runningChecks}
                >
                  {runningChecks ? 'Running Checks...' : 'Run All Checks'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadProductionData}
                >
                  Refresh Status
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard id="environment-status" title="Environment Status">
            <Row>
              {environments.map((env, index) => (
                <Col md={4} key={index} className="mb-3">
                  <Card className="border-0 h-100">
                    <Card.Body className="text-center">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{env.name}</h6>
                        <Badge bg={getStatusColor(env.status)}>
                          {env.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-muted mb-2">{env.version}</p>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Uptime</small>
                          <small>{env.metrics.uptime}%</small>
                        </div>
                        <ProgressBar now={env.metrics.uptime} variant="success" size="sm" className="mb-2" />
                        
                        <div className="d-flex justify-content-between mb-1">
                          <small>Performance</small>
                          <small>{env.metrics.performance}%</small>
                        </div>
                        <ProgressBar now={env.metrics.performance} variant="info" size="sm" className="mb-2" />
                        
                        <div className="d-flex justify-content-between mb-1">
                          <small>Error Rate</small>
                          <small>{env.metrics.errors}%</small>
                        </div>
                        <ProgressBar now={env.metrics.errors} variant="warning" size="sm" />
                      </div>
                      <small className="text-muted">
                        Last deployed: {new Date(env.lastDeployed).toLocaleDateString()}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Production Checks */}
      <Row className="mb-4">
        <Col lg={8}>
          <ComponentContainerCard id="production-checks" title="Production Readiness Checks">
            {productionChecks.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-4">
                <h6 className="text-primary mb-3">{category.category}</h6>
                <Table responsive className="mb-4">
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Status</th>
                      <th>Criticality</th>
                      <th>Type</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.checks.map((check, checkIndex) => (
                      <tr key={checkIndex}>
                        <td>
                          <div>
                            <strong>{check.name}</strong>
                            <div>
                              <small className="text-muted">{check.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(check.status)}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getCriticalityColor(check.criticality)}>
                            {check.criticality.toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={check.automated ? 'info' : 'secondary'}>
                            {check.automated ? 'AUTO' : 'MANUAL'}
                          </Badge>
                        </td>
                        <td>
                          {check.details && (
                            <small className="text-muted">{check.details}</small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))}
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <ComponentContainerCard id="security-scans" title="Security Scans">
            {securityScans.map((scan, index) => (
              <Card key={index} className="mb-3 border-0">
                <Card.Body className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{scan.scanType}</h6>
                    <Badge bg={getStatusColor(scan.status)}>
                      {scan.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small>Severity:</small>
                    <Badge bg={getSeverityColor(scan.severity)} size="sm">
                      {scan.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small>Findings:</small>
                    <Badge bg={scan.findings === 0 ? 'success' : 'warning'} size="sm">
                      {scan.findings}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Last run: {new Date(scan.lastRun).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    <small className="text-muted">
                      Next run: {new Date(scan.nextRun).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))}

            <Alert variant="info" className="mt-3">
              <small>
                <strong>Security Tip:</strong> Run security scans regularly and address findings promptly.
              </small>
            </Alert>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Deployment Tools */}
      <Row>
        <Col>
          <ComponentContainerCard id="deployment-tools" title="Deployment Tools">
            <Row>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Deploy to Production</h6>
                    <p className="text-muted small">Deploy current version to production</p>
                    <Button variant="primary" size="sm" disabled={getOverallScore() < 90}>
                      Deploy
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-arrow-clockwise text-success" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Rollback</h6>
                    <p className="text-muted small">Rollback to previous version</p>
                    <Button variant="outline-success" size="sm">
                      Rollback
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-graph-up text-info" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Health Check</h6>
                    <p className="text-muted small">Monitor deployment health</p>
                    <Button variant="outline-info" size="sm">
                      Monitor
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-file-earmark-text text-warning" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Deployment Logs</h6>
                    <p className="text-muted small">View deployment history</p>
                    <Button variant="outline-warning" size="sm">
                      View Logs
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default ProductionReadinessPage;