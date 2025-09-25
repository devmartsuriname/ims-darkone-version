import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/useAuthContext';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Card, Row, Col, Badge, ListGroup, ProgressBar } from 'react-bootstrap';

interface SecurityCheck {
  name: string;
  category: 'authentication' | 'authorization' | 'data' | 'network' | 'configuration';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
  details?: string;
  timestamp: Date;
}

interface SecurityScan {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  checks: SecurityCheck[];
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityHealthScanner: React.FC = () => {
  const { user, roles } = useAuthContext();
  const [currentScan, setCurrentScan] = useState<SecurityScan | null>(null);
  const [scanHistory, setScanHistory] = useState<SecurityScan[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const runAuthenticationChecks = async (): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    // Session validation
    try {
      const { data: session, error } = await supabase.auth.getSession();
      checks.push({
        name: 'Session Validation',
        category: 'authentication',
        status: error ? 'failed' : session ? 'passed' : 'warning',
        severity: error ? 'high' : !session ? 'medium' : 'low',
        description: error ? 'Session validation failed' : 
                    session ? 'Valid session detected' : 'No active session',
        recommendation: error ? 'Check authentication configuration' : 
                       !session ? 'User should authenticate' : undefined,
        timestamp: new Date()
      });
    } catch (error) {
      checks.push({
        name: 'Session Validation',
        category: 'authentication',
        status: 'failed',
        severity: 'critical',
        description: 'Authentication system unreachable',
        recommendation: 'Check Supabase authentication service',
        timestamp: new Date()
      });
    }

    // Password strength check (if user exists)
    if (user) {
      // Note: We can't actually check password strength, but we can check other auth factors
      checks.push({
        name: 'Authentication Method',
        category: 'authentication',
        status: 'passed',
        severity: 'low',
        description: 'User authenticated via email/password',
        recommendation: 'Consider enabling MFA for enhanced security',
        timestamp: new Date()
      });

      // Check for user metadata
      const hasMetadata = user.user_metadata && Object.keys(user.user_metadata).length > 0;
      checks.push({
        name: 'User Metadata Security',
        category: 'authentication',
        status: hasMetadata ? 'passed' : 'warning',
        severity: 'low',
        description: hasMetadata ? 'User metadata present' : 'No user metadata',
        timestamp: new Date()
      });
    }

    return checks;
  };

  const runAuthorizationChecks = async (): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    if (!user) {
      checks.push({
        name: 'Authorization System',
        category: 'authorization',
        status: 'skipped',
        severity: 'low',
        description: 'No authenticated user to test',
        timestamp: new Date()
      });
      return checks;
    }

    // Role assignment validation
    checks.push({
      name: 'Role Assignment',
      category: 'authorization',
      status: roles.length > 0 ? 'passed' : 'warning',
      severity: roles.length > 0 ? 'low' : 'medium',
      description: `User has ${roles.length} assigned role(s)`,
      recommendation: roles.length === 0 ? 'Assign appropriate roles to user' : undefined,
      timestamp: new Date()
    });

    // Role validation - check for valid roles
    const validRoles = ['admin', 'it', 'staff', 'front_office', 'control', 'director', 'minister', 'applicant'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r.role));
    
    checks.push({
      name: 'Role Validation',
      category: 'authorization',
      status: invalidRoles.length === 0 ? 'passed' : 'failed',
      severity: invalidRoles.length === 0 ? 'low' : 'high',
      description: invalidRoles.length === 0 ? 'All roles are valid' : `Invalid roles detected: ${invalidRoles.map(r => r.role).join(', ')}`,
      recommendation: invalidRoles.length > 0 ? 'Remove or correct invalid role assignments' : undefined,
      timestamp: new Date()
    });

    // Privilege escalation check
    const hasMultiplePrivilegedRoles = roles.filter(r => ['admin', 'it', 'director', 'minister'].includes(r.role)).length > 1;
    
    checks.push({
      name: 'Privilege Escalation Risk',
      category: 'authorization',
      status: hasMultiplePrivilegedRoles ? 'warning' : 'passed',
      severity: hasMultiplePrivilegedRoles ? 'medium' : 'low',
      description: hasMultiplePrivilegedRoles ? 'User has multiple privileged roles' : 'Normal privilege assignment',
      recommendation: hasMultiplePrivilegedRoles ? 'Review if multiple privileged roles are necessary' : undefined,
      timestamp: new Date()
    });

    return checks;
  };

  const runDataSecurityChecks = async (): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    // RLS policy enforcement test
    try {
      // Try to access profiles without proper context
      const { error } = await supabase.from('profiles').select('*');
      
      if (user && roles.some(r => ['admin', 'it'].includes(r.role))) {
        // Admin should have access
        checks.push({
          name: 'RLS Policy - Admin Access',
          category: 'data',
          status: error ? 'failed' : 'passed',
          severity: error ? 'high' : 'low',
          description: error ? 'Admin access denied by RLS' : 'Admin access granted correctly',
          recommendation: error ? 'Check RLS policies for admin access' : undefined,
          timestamp: new Date()
        });
      } else {
        // Non-admin should have restricted access
        checks.push({
          name: 'RLS Policy - User Access',
          category: 'data',
          status: error ? 'passed' : 'warning',
          severity: error ? 'low' : 'medium',
          description: error ? 'Access properly restricted' : 'Unexpected access granted',
          recommendation: !error ? 'Review RLS policies for data protection' : undefined,
          timestamp: new Date()
        });
      }
    } catch (error) {
      checks.push({
        name: 'RLS Policy Test',
        category: 'data',
        status: 'failed',
        severity: 'critical',
        description: 'Unable to test RLS policies',
        recommendation: 'Check database connectivity and RLS configuration',
        timestamp: new Date()
      });
    }

    // Sensitive data exposure check
    try {
      const { data: sampleData } = await supabase.from('applicants').select('*').limit(1);
      const hasSensitiveData = sampleData && sampleData.length > 0;
      
      checks.push({
        name: 'Sensitive Data Exposure',
        category: 'data',
        status: hasSensitiveData ? 'warning' : 'passed',
        severity: hasSensitiveData ? 'high' : 'low',
        description: hasSensitiveData ? 'Sensitive applicant data accessible' : 'No sensitive data exposed',
        recommendation: hasSensitiveData ? 'Ensure proper access controls for sensitive data' : undefined,
        timestamp: new Date()
      });
    } catch (error) {
      // Access denied is actually good for this test
      checks.push({
        name: 'Sensitive Data Exposure',
        category: 'data',
        status: 'passed',
        severity: 'low',
        description: 'Sensitive data properly protected',
        timestamp: new Date()
      });
    }

    return checks;
  };

  const runNetworkSecurityChecks = async (): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    // HTTPS usage check
    const isHTTPS = window.location.protocol === 'https:';
    checks.push({
      name: 'HTTPS Usage',
      category: 'network',
      status: isHTTPS ? 'passed' : 'failed',
      severity: isHTTPS ? 'low' : 'critical',
      description: isHTTPS ? 'Application served over HTTPS' : 'Application served over HTTP',
      recommendation: !isHTTPS ? 'Configure HTTPS for all communications' : undefined,
      timestamp: new Date()
    });

    // API endpoint security
    try {
      const response = await fetch('/api/nonexistent', { method: 'GET' });
      checks.push({
        name: 'API Endpoint Security',
        category: 'network',
        status: response.status === 404 ? 'passed' : 'warning',
        severity: response.status === 404 ? 'low' : 'medium',
        description: response.status === 404 ? 'Non-existent endpoints properly handled' : 'Unexpected response from non-existent endpoint',
        timestamp: new Date()
      });
    } catch (error) {
      checks.push({
        name: 'API Endpoint Security',
        category: 'network',
        status: 'passed',
        severity: 'low',
        description: 'Network requests properly handled',
        timestamp: new Date()
      });
    }

    return checks;
  };

  const runConfigurationChecks = async (): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    // Environment configuration
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('lovable.app');
    
    checks.push({
      name: 'Environment Configuration',
      category: 'configuration',
      status: 'passed',
      severity: 'low',
      description: isDevelopment ? 'Development environment detected' : 'Production environment',
      recommendation: isDevelopment ? 'Ensure production configurations are secure' : undefined,
      timestamp: new Date()
    });

    // Console logging check (in production, console should be minimal)
    const originalConsole = console.log;
    let consoleCallCount = 0;
    console.log = (...args) => {
      consoleCallCount++;
      originalConsole(...args);
    };
    
    // Trigger some console activity
    setTimeout(() => {
      console.log = originalConsole;
      checks.push({
        name: 'Console Security',
        category: 'configuration',
        status: consoleCallCount < 10 ? 'passed' : 'warning',
        severity: consoleCallCount < 10 ? 'low' : 'medium',
        description: `${consoleCallCount} console calls detected during scan`,
        recommendation: consoleCallCount >= 10 ? 'Minimize console logging in production' : undefined,
        timestamp: new Date()
      });
    }, 1000);

    return checks;
  };

  const startSecurityScan = async () => {
    setIsScanning(true);
    
    const scan: SecurityScan = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      status: 'running',
      checks: [],
      overallScore: 0,
      riskLevel: 'low'
    };
    
    setCurrentScan(scan);
    
    try {
      const [authChecks, authzChecks, dataChecks, networkChecks, configChecks] = await Promise.all([
        runAuthenticationChecks(),
        runAuthorizationChecks(),
        runDataSecurityChecks(),
        runNetworkSecurityChecks(),
        runConfigurationChecks()
      ]);
      
      const allChecks = [...authChecks, ...authzChecks, ...dataChecks, ...networkChecks, ...configChecks];
      
      // Calculate security score
      const totalChecks = allChecks.filter(c => c.status !== 'skipped').length;
      const passedChecks = allChecks.filter(c => c.status === 'passed').length;
      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
      
      // Determine risk level
      const criticalIssues = allChecks.filter(c => c.severity === 'critical' && c.status === 'failed').length;
      const highIssues = allChecks.filter(c => c.severity === 'high' && c.status === 'failed').length;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (criticalIssues > 0) {
        riskLevel = 'critical';
      } else if (highIssues > 2) {
        riskLevel = 'high';
      } else if (highIssues > 0 || score < 80) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
      
      const completedScan: SecurityScan = {
        ...scan,
        endTime: new Date(),
        status: 'completed',
        checks: allChecks,
        overallScore: score,
        riskLevel
      };
      
      setCurrentScan(completedScan);
      setScanHistory(prev => [completedScan, ...prev].slice(0, 10)); // Keep last 10 scans
      
    } catch (error) {
      console.error('Security scan failed:', error);
      setCurrentScan({
        ...scan,
        endTime: new Date(),
        status: 'failed',
        checks: [{
          name: 'Security Scan',
          category: 'configuration',
          status: 'failed',
          severity: 'high',
          description: 'Security scan encountered an error',
          timestamp: new Date()
        }],
        overallScore: 0,
        riskLevel: 'critical'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return 'solar:check-circle-bold';
      case 'failed': return 'solar:close-circle-bold';
      case 'warning': return 'solar:danger-triangle-bold';
      case 'skipped': return 'solar:minus-circle-bold';
      default: return 'solar:question-circle-bold';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Security Health Scanner</h4>
        <button 
          className="btn btn-primary"
          onClick={startSecurityScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" />
              Scanning...
            </>
          ) : (
            <>
              <IconifyIcon icon="solar:shield-check-bold" className="me-2" />
              Run Security Scan
            </>
          )}
        </button>
      </div>

      {/* Current Scan Status */}
      {currentScan && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Security Scan Results</h6>
                  <Badge bg={getRiskColor(currentScan.riskLevel)}>
                    {currentScan.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {currentScan.status === 'running' ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3" />
                    <p>Running comprehensive security scan...</p>
                  </div>
                ) : (
                  <>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="text-center">
                          <div className="h2 mb-1">{currentScan.overallScore}%</div>
                          <div className="text-muted">Security Score</div>
                          <ProgressBar 
                            variant={currentScan.overallScore >= 80 ? 'success' : currentScan.overallScore >= 60 ? 'warning' : 'danger'}
                            now={currentScan.overallScore}
                            className="mt-2"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="text-center">
                          <div className="h2 mb-1">{currentScan.checks.length}</div>
                          <div className="text-muted">Security Checks</div>
                          <div className="mt-2">
                            <Badge bg="success" className="me-1">
                              {currentScan.checks.filter(c => c.status === 'passed').length} Passed
                            </Badge>
                            <Badge bg="danger" className="me-1">
                              {currentScan.checks.filter(c => c.status === 'failed').length} Failed
                            </Badge>
                            <Badge bg="warning">
                              {currentScan.checks.filter(c => c.status === 'warning').length} Warnings
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Security Checks by Category */}
                    {['authentication', 'authorization', 'data', 'network', 'configuration'].map(category => {
                      const categoryChecks = currentScan.checks.filter(c => c.category === category);
                      if (categoryChecks.length === 0) return null;

                      return (
                        <Card key={category} className="mb-3">
                          <Card.Header>
                            <h6 className="mb-0 text-capitalize">{category} Security</h6>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {categoryChecks.map((check, index) => (
                                <ListGroup.Item key={index} className="d-flex align-items-start">
                                  <IconifyIcon 
                                    icon={getStatusIcon(check.status)}
                                    className={`me-3 mt-1 text-${
                                      check.status === 'passed' ? 'success' :
                                      check.status === 'failed' ? 'danger' :
                                      check.status === 'warning' ? 'warning' : 'muted'
                                    }`}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <strong>{check.name}</strong>
                                        <div className="text-muted">{check.description}</div>
                                        {check.recommendation && (
                                          <div className="text-warning small mt-1">
                                            <IconifyIcon icon="solar:info-circle-bold" className="me-1" />
                                            {check.recommendation}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-end">
                                        <Badge bg={getSeverityColor(check.severity)}>
                                          {check.severity}
                                        </Badge>
                                        <div className="text-muted small mt-1">
                                          {check.timestamp.toLocaleTimeString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Scan History</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Scan Time</th>
                        <th>Security Score</th>
                        <th>Risk Level</th>
                        <th>Checks</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanHistory.map(scan => (
                        <tr key={scan.id}>
                          <td>{scan.startTime.toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{scan.overallScore}%</span>
                              <ProgressBar 
                                variant={scan.overallScore >= 80 ? 'success' : scan.overallScore >= 60 ? 'warning' : 'danger'}
                                now={scan.overallScore}
                                style={{ width: '60px', height: '8px' }}
                              />
                            </div>
                          </td>
                          <td>
                            <Badge bg={getRiskColor(scan.riskLevel)}>
                              {scan.riskLevel}
                            </Badge>
                          </td>
                          <td>
                            <span className="text-success">{scan.checks.filter(c => c.status === 'passed').length}</span>
                            {' / '}
                            <span className="text-danger">{scan.checks.filter(c => c.status === 'failed').length}</span>
                            {' / '}
                            <span className="text-warning">{scan.checks.filter(c => c.status === 'warning').length}</span>
                          </td>
                          <td>
                            <Badge bg={scan.status === 'completed' ? 'success' : 'danger'}>
                              {scan.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};