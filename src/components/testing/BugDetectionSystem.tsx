import React, { useState } from 'react';
import { useAuthContext } from '@/context/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Card, Row, Col, Alert, ListGroup, Badge } from 'react-bootstrap';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'fixing' | 'fixed' | 'ignored';
  component: string;
  timestamp: Date;
  autoFix?: boolean;
}

export const BugDetectionSystem: React.FC = () => {
  const { user, roles, isAuthenticated } = useAuthContext();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const addBug = (bug: Omit<BugReport, 'id' | 'timestamp'>) => {
    const newBug: BugReport = {
      ...bug,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setBugs(prev => [...prev, newBug]);
  };

  const updateBugStatus = (id: string, status: BugReport['status']) => {
    setBugs(prev => prev.map(bug => 
      bug.id === id ? { ...bug, status } : bug
    ));
  };

  const performBugScan = async () => {
    setIsScanning(true);
    setBugs([]);

    // Scan 1: Authentication Issues
    try {
      if (!isAuthenticated) {
        addBug({
          title: 'User Not Authenticated',
          description: 'User is not signed in but accessing the bug detection system',
          severity: 'medium',
          status: 'detected',
          component: 'Authentication'
        });
      }

      if (user && roles.length === 0) {
        addBug({
          title: 'No User Roles Assigned',
          description: 'Authenticated user has no roles assigned, which may cause permission issues',
          severity: 'high',
          status: 'detected',
          component: 'Authorization',
          autoFix: true
        });

        // Auto-fix: Assign applicant role if no roles exist
        try {
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'applicant',
              assigned_by: user.id
            });

          if (!error) {
            updateBugStatus(bugs[bugs.length - 1]?.id, 'fixed');
          }
        } catch (fixError) {
          console.error('Auto-fix failed:', fixError);
        }
      }
    } catch (error) {
      addBug({
        title: 'Authentication System Error',
        description: `Error checking authentication: ${error}`,
        severity: 'critical',
        status: 'detected',
        component: 'Authentication'
      });
    }

    // Scan 2: Database Connectivity
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        addBug({
          title: 'Database Connection Issue',
          description: `Database query failed: ${error.message}`,
          severity: 'critical',
          status: 'detected',
          component: 'Database'
        });
      }
    } catch (error) {
      addBug({
        title: 'Database Connection Failure',
        description: 'Unable to connect to the database',
        severity: 'critical',
        status: 'detected',
        component: 'Database'
      });
    }

    // Scan 3: Storage Configuration
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        addBug({
          title: 'Storage System Error',
          description: `Storage system is not accessible: ${error.message}`,
          severity: 'high',
          status: 'detected',
          component: 'Storage'
        });
      } else {
        const requiredBuckets = ['documents', 'control-photos'];
        const existingBuckets = buckets.map(b => b.name);
        const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
        
        if (missingBuckets.length > 0) {
          addBug({
            title: 'Missing Storage Buckets',
            description: `Required storage buckets not found: ${missingBuckets.join(', ')}`,
            severity: 'high',
            status: 'detected',
            component: 'Storage'
          });
        }
      }
    } catch (error) {
      addBug({
        title: 'Storage System Failure',
        description: 'Unable to access storage system',
        severity: 'high',
        status: 'detected',
        component: 'Storage'
      });
    }

    // Scan 4: Edge Functions Health
    try {
      const { error } = await supabase.functions.invoke('health-check', {
        body: { check: 'basic' }
      });
      
      if (error) {
        addBug({
          title: 'Edge Functions Not Responding',
          description: `Edge functions are not accessible: ${error.message}`,
          severity: 'high',
          status: 'detected',
          component: 'Edge Functions'
        });
      }
    } catch (error) {
      addBug({
        title: 'Edge Functions System Error',
        description: 'Edge functions system is not responding',
        severity: 'high',
        status: 'detected',
        component: 'Edge Functions'
      });
    }

    // Scan 5: UI/UX Issues
    const checkUIIssues = () => {
      // Check for mobile viewport
      if (window.innerWidth < 768) {
        const sidebarElement = document.querySelector('.app-sidebar');
        if (sidebarElement && !sidebarElement.classList.contains('d-none')) {
          addBug({
            title: 'Mobile Sidebar Visibility',
            description: 'Sidebar may be blocking content on mobile devices',
            severity: 'low',
            status: 'detected',
            component: 'UI/UX',
            autoFix: true
          });
        }
      }

      // Check for missing ARIA labels
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      if (buttons.length > 0) {
        addBug({
          title: 'Accessibility Issues',
          description: `Found ${buttons.length} buttons without ARIA labels`,
          severity: 'medium',
          status: 'detected',
          component: 'Accessibility'
        });
      }

      // Check for large images without lazy loading
      const images = document.querySelectorAll('img:not([loading="lazy"])');
      if (images.length > 5) {
        addBug({
          title: 'Performance Issue: Images',
          description: `${images.length} images without lazy loading may impact performance`,
          severity: 'low',
          status: 'detected',
          component: 'Performance'
        });
      }
    };

    checkUIIssues();

    // Scan 6: Data Consistency
    if (user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          addBug({
            title: 'Profile Data Missing',
            description: 'User profile not found in database',
            severity: 'medium',
            status: 'detected',
            component: 'Data Integrity',
            autoFix: true
          });

          // Auto-fix: Create profile
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || ''
              });

            if (!insertError) {
              updateBugStatus(bugs[bugs.length - 1]?.id, 'fixed');
            }
          } catch (fixError) {
            console.error('Profile creation failed:', fixError);
          }
        }
      } catch (error) {
        addBug({
          title: 'Profile Query Error',
          description: `Error checking profile data: ${error}`,
          severity: 'medium',
          status: 'detected',
          component: 'Data Integrity'
        });
      }
    }

    // Scan 7: Security Checks
    try {
      // Check for exposed sensitive data in localStorage
      const sensitiveKeys = ['password', 'token', 'secret', 'key'];
      const localStorageItems = Object.keys(localStorage);
      const exposedItems = localStorageItems.filter(key => 
        sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
      );

      if (exposedItems.length > 0) {
        addBug({
          title: 'Security Risk: Exposed Data',
          description: `Potentially sensitive data in localStorage: ${exposedItems.join(', ')}`,
          severity: 'high',
          status: 'detected',
          component: 'Security'
        });
      }

      // Check for XSS vulnerabilities (basic check)
      const dangerousElements = document.querySelectorAll('[data-dangerous-html]');
      if (dangerousElements.length > 0) {
        addBug({
          title: 'Security Risk: XSS Vulnerability',
          description: `Found ${dangerousElements.length} elements with potentially unsafe HTML`,
          severity: 'critical',
          status: 'detected',
          component: 'Security'
        });
      }
    } catch (error) {
      console.error('Security scan error:', error);
    }

    setIsScanning(false);
  };

  const getSeverityColor = (severity: BugReport['severity']) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusColor = (status: BugReport['status']) => {
    switch (status) {
      case 'detected': return 'danger';
      case 'fixing': return 'warning';
      case 'fixed': return 'success';
      case 'ignored': return 'secondary';
      default: return 'light';
    }
  };

  const criticalBugs = bugs.filter(b => b.severity === 'critical').length;
  const highBugs = bugs.filter(b => b.severity === 'high').length;
  const fixedBugs = bugs.filter(b => b.status === 'fixed').length;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Bug Detection & Auto-Fix System</h4>
        <button 
          className="btn btn-danger"
          onClick={performBugScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" />
              Scanning...
            </>
          ) : (
            <>
              <IconifyIcon icon="solar:bug-bold" className="me-2" />
              Scan for Issues
            </>
          )}
        </button>
      </div>

      {/* Bug Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-danger">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:danger-bold" className="fs-2 text-danger" />
              <h5 className="mt-2">{criticalBugs}</h5>
              <small className="text-muted">Critical Issues</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-warning">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:danger-triangle-bold" className="fs-2 text-warning" />
              <h5 className="mt-2">{highBugs}</h5>
              <small className="text-muted">High Priority</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-success">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:check-circle-bold" className="fs-2 text-success" />
              <h5 className="mt-2">{fixedBugs}</h5>
              <small className="text-muted">Auto-Fixed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-info">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:bug-minimalistic-bold" className="fs-2 text-info" />
              <h5 className="mt-2">{bugs.length}</h5>
              <small className="text-muted">Total Issues</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bug List */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">Detected Issues</h6>
        </Card.Header>
        <Card.Body>
          {bugs.length === 0 && !isScanning ? (
            <div className="text-center py-4">
              <IconifyIcon icon="solar:shield-check-bold" className="fs-1 text-success" />
              <p className="text-muted mt-2">No issues detected. Click "Scan for Issues" to run diagnostics.</p>
            </div>
          ) : isScanning ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-2">Scanning system for issues...</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {bugs.map((bug) => (
                <ListGroup.Item key={bug.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <IconifyIcon 
                          icon={bug.autoFix ? "solar:magic-stick-3-bold" : "solar:bug-bold"}
                          className={`me-2 text-${getSeverityColor(bug.severity)}`}
                        />
                        <strong>{bug.title}</strong>
                        {bug.autoFix && (
                          <Badge bg="info" className="ms-2">Auto-Fix Available</Badge>
                        )}
                      </div>
                      <p className="text-muted mb-2">{bug.description}</p>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={getSeverityColor(bug.severity)}>
                          {bug.severity.toUpperCase()}
                        </Badge>
                        <Badge bg="light" text="dark">
                          {bug.component}
                        </Badge>
                        <small className="text-muted">
                          {bug.timestamp.toLocaleString()}
                        </small>
                      </div>
                    </div>
                    <Badge bg={getStatusColor(bug.status)}>
                      {bug.status.toUpperCase()}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {(criticalBugs > 0 || highBugs > 0) && (
        <Alert variant="warning" className="mt-4">
          <IconifyIcon icon="solar:danger-triangle-bold" className="me-2" />
          <strong>Action Required:</strong> {criticalBugs + highBugs} high-priority issues detected. 
          Please review and address these issues to ensure system stability.
        </Alert>
      )}
    </div>
  );
};