import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface SecurityCheck {
  id: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'compliance';
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
  lastChecked?: Date;
}

interface SecurityScan {
  id: string;
  type: 'vulnerability' | 'penetration' | 'code_analysis' | 'dependency';
  name: string;
  status: 'running' | 'completed' | 'failed';
  findings: number;
  criticalFindings: number;
  lastRun: Date;
}

const SecurityHardeningPage: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hardening, setHardening] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSecurityChecks(),
        loadSecurityScans()
      ]);
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityChecks = async () => {
    // Mock security checks
    const checks: SecurityCheck[] = [
      {
        id: 'auth-1',
        category: 'authentication',
        name: 'Multi-Factor Authentication',
        description: 'Verify MFA is enabled for all admin accounts',
        status: 'passed',
        severity: 'high',
        lastChecked: new Date()
      },
      {
        id: 'auth-2',
        category: 'authentication',
        name: 'Password Policy',
        description: 'Strong password requirements enforced',
        status: 'passed',
        severity: 'medium',
        lastChecked: new Date()
      },
      {
        id: 'authz-1',
        category: 'authorization',
        name: 'Row Level Security',
        description: 'RLS policies properly configured',
        status: 'warning',
        severity: 'critical',
        recommendation: 'Review and update RLS policies for new tables',
        lastChecked: new Date()
      },
      {
        id: 'data-1',
        category: 'data_protection',
        name: 'Data Encryption',
        description: 'Data encrypted at rest and in transit',
        status: 'passed',
        severity: 'critical',
        lastChecked: new Date()
      },
      {
        id: 'data-2',
        category: 'data_protection',
        name: 'Sensitive Data Exposure',
        description: 'No sensitive data exposed in logs or errors',
        status: 'failed',
        severity: 'high',
        recommendation: 'Implement data masking for sensitive fields',
        lastChecked: new Date()
      },
      {
        id: 'net-1',
        category: 'network',
        name: 'HTTPS Enforcement',
        description: 'All connections use HTTPS',
        status: 'passed',
        severity: 'high',
        lastChecked: new Date()
      },
      {
        id: 'comp-1',
        category: 'compliance',
        name: 'GDPR Compliance',
        description: 'GDPR requirements met',
        status: 'warning',
        severity: 'high',
        recommendation: 'Complete data retention policy documentation',
        lastChecked: new Date()
      }
    ];
    setSecurityChecks(checks);
  };

  const loadSecurityScans = async () => {
    // Mock security scans
    const scans: SecurityScan[] = [
      {
        id: 'scan-1',
        type: 'vulnerability',
        name: 'Vulnerability Assessment',
        status: 'completed',
        findings: 3,
        criticalFindings: 0,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'scan-2',
        type: 'penetration',
        name: 'Penetration Testing',
        status: 'completed',
        findings: 1,
        criticalFindings: 0,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      },
      {
        id: 'scan-3',
        type: 'code_analysis',
        name: 'Static Code Analysis',
        status: 'completed',
        findings: 5,
        criticalFindings: 1,
        lastRun: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: 'scan-4',
        type: 'dependency',
        name: 'Dependency Vulnerability Scan',
        status: 'running',
        findings: 0,
        criticalFindings: 0,
        lastRun: new Date()
      }
    ];
    setSecurityScans(scans);
  };

  const runSecurityHardening = async (category?: string) => {
    setHardening(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_security_hardening',
          category: category
        }
      });

      if (error) throw error;

      toast.success(`Security hardening ${category ? `for ${category}` : ''} completed`);
      await loadSecurityData();
    } catch (error) {
      console.error('Security hardening failed:', error);
      toast.error('Security hardening failed');
    } finally {
      setHardening(false);
    }
  };

  const runSecurityScan = async (scanType: string) => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_security_scan',
          scan_type: scanType
        }
      });

      if (error) throw error;

      toast.success(`${scanType} scan initiated`);
      await loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
      toast.error('Security scan failed');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'success',
      warning: 'warning',
      failed: 'danger',
      pending: 'secondary'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'warning',
      critical: 'danger'
    };
    return colors[severity as keyof typeof colors] || 'secondary';
  };

  const getOverallScore = () => {
    const passed = securityChecks.filter(c => c.status === 'passed').length;
    const total = securityChecks.length;
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
        title="Security Hardening" 
        subName="Advanced Security Assessment & Hardening Tools"
      />

      {/* Security Overview */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{getOverallScore()}</div>
                <p className="text-muted mb-0">Security Score</p>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${getOverallScore()}%` }}
                ></div>
              </div>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => runSecurityHardening()}
                  disabled={hardening}
                >
                  {hardening ? 'Hardening...' : 'Run Security Hardening'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadSecurityData}
                >
                  Refresh Security Status
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard id="security-summary" title="Security Summary">
            <Row>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-success mb-1">
                    {securityChecks.filter(c => c.status === 'passed').length}
                  </div>
                  <small className="text-muted">Passed</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-warning mb-1">
                    {securityChecks.filter(c => c.status === 'warning').length}
                  </div>
                  <small className="text-muted">Warnings</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-danger mb-1">
                    {securityChecks.filter(c => c.status === 'failed').length}
                  </div>
                  <small className="text-muted">Failed</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-info mb-1">
                    {securityScans.reduce((acc, scan) => acc + scan.criticalFindings, 0)}
                  </div>
                  <small className="text-muted">Critical Issues</small>
                </div>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Security Checks */}
      <Row className="mb-4">
        <Col>
          <ComponentContainerCard id="security-checks" title="Security Checks">
            <Table responsive>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Last Checked</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {securityChecks.map((check) => (
                  <tr key={check.id}>
                    <td>
                      <div>
                        <div className="fw-medium">{check.name}</div>
                        <small className="text-muted">{check.description}</small>
                        {check.recommendation && (
                          <div className="mt-1">
                            <small className="text-warning">
                              <IconifyIcon icon="solar:danger-triangle-bold" className="me-1" />
                              {check.recommendation}
                            </small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">{check.category.replace('_', ' ')}</Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(check.status)}>
                        {check.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getSeverityColor(check.severity)}>
                        {check.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {check.lastChecked?.toLocaleTimeString()}
                      </small>
                    </td>
                    <td>
                      {check.status !== 'passed' && (
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => runSecurityHardening(check.category)}
                          disabled={hardening}
                        >
                          Fix
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Security Scans */}
      <Row>
        <Col>
          <ComponentContainerCard id="security-scans" title="Security Scans">
            <Row>
              {securityScans.map((scan) => (
                <Col lg={3} md={6} key={scan.id} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1">{scan.name}</h6>
                          <Badge bg={scan.status === 'completed' ? 'success' : scan.status === 'running' ? 'warning' : 'danger'}>
                            {scan.status.toUpperCase()}
                          </Badge>
                        </div>
                        <IconifyIcon 
                          icon={scan.status === 'running' ? 'solar:clock-circle-bold' : 'solar:shield-check-bold'} 
                          className="text-primary"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">Total Findings:</small>
                          <strong>{scan.findings}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">Critical:</small>
                          <strong className="text-danger">{scan.criticalFindings}</strong>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">
                          Last run: {scan.lastRun.toLocaleString()}
                        </small>
                      </div>

                      <div className="d-grid">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => runSecurityScan(scan.type)}
                          disabled={scan.status === 'running'}
                        >
                          {scan.status === 'running' ? 'Running...' : 'Run Scan'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default SecurityHardeningPage;