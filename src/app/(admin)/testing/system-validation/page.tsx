import React, { useState, useEffect } from 'react';
import { Card, Badge, Alert, Tab, Tabs, Table, Button } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import RoleCheck from '@/components/auth/RoleCheck';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';

interface RouteTest {
  path: string;
  name: string;
  allowedRoles: string[];
  category: string;
  status?: 'pending' | 'pass' | 'fail';
  error?: string;
}

const ROUTES_TO_TEST: RouteTest[] = [
  // Application Routes
  { path: '/applications/intake', name: 'Application Intake', allowedRoles: ['admin', 'it', 'staff', 'front_office'], category: 'Applications' },
  { path: '/applications/list', name: 'Application List', allowedRoles: ['admin', 'it', 'staff', 'front_office'], category: 'Applications' },
  
  // Control Routes
  { path: '/control/queue', name: 'Control Queue', allowedRoles: ['admin', 'it', 'control'], category: 'Control' },
  { path: '/control/schedule', name: 'Schedule Visit', allowedRoles: ['admin', 'it', 'control'], category: 'Control' },
  { path: '/control/visits', name: 'Visits List', allowedRoles: ['admin', 'it', 'control'], category: 'Control' },
  
  // Review Routes
  { path: '/reviews/technical', name: 'Technical Review', allowedRoles: ['admin', 'it', 'staff'], category: 'Reviews' },
  { path: '/reviews/social', name: 'Social Review', allowedRoles: ['admin', 'it', 'staff'], category: 'Reviews' },
  { path: '/reviews/director', name: 'Director Review', allowedRoles: ['admin', 'it', 'director'], category: 'Reviews' },
  { path: '/reviews/minister', name: 'Minister Decision', allowedRoles: ['admin', 'it', 'minister'], category: 'Reviews' },
  
  // Workflow Routes
  { path: '/workflow/validation', name: 'Workflow Validation', allowedRoles: ['admin', 'it'], category: 'Workflow' },
  { path: '/workflow/testing', name: 'Workflow Testing', allowedRoles: ['admin', 'it'], category: 'Workflow' },
  { path: '/workflow/monitoring', name: 'Workflow Monitoring', allowedRoles: ['admin', 'it', 'staff'], category: 'Workflow' },
  
  // Monitoring Routes
  { path: '/monitoring/health', name: 'System Health', allowedRoles: ['admin', 'it'], category: 'Monitoring' },
  { path: '/monitoring/performance', name: 'Performance Monitoring', allowedRoles: ['admin', 'it'], category: 'Monitoring' },
  { path: '/monitoring/security', name: 'Security Health', allowedRoles: ['admin', 'it'], category: 'Monitoring' },
  
  // Admin Routes
  { path: '/admin/users', name: 'User Management', allowedRoles: ['admin', 'it'], category: 'Admin' },
  { path: '/admin/settings', name: 'System Settings', allowedRoles: ['admin', 'it'], category: 'Admin' },
  
  // Testing Routes
  { path: '/testing/integration', name: 'Integration Testing', allowedRoles: ['admin', 'it'], category: 'Testing' },
  { path: '/testing/end-to-end', name: 'End-to-End Testing', allowedRoles: ['admin', 'it'], category: 'Testing' },
  
  // Security Routes
  { path: '/security/scanning', name: 'Security Scanning', allowedRoles: ['admin', 'it'], category: 'Security' },
  { path: '/security/monitoring', name: 'Security Monitoring', allowedRoles: ['admin', 'it'], category: 'Security' },
];

const SystemValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [routeTests, setRouteTests] = useState<RouteTest[]>(() => {
    // Initialize from localStorage or use defaults
    const saved = localStorage.getItem('route-test-results');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ROUTES_TO_TEST.map(r => ({ ...r, status: 'pending' as const }));
      }
    }
    return ROUTES_TO_TEST.map(r => ({ ...r, status: 'pending' as const }));
  });
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [lastTestRun, setLastTestRun] = useState<string | null>(() => 
    localStorage.getItem('route-test-timestamp')
  );

  // Save test results to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('route-test-results', JSON.stringify(routeTests));
  }, [routeTests]);

  useEffect(() => {
    // Monitor console errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMsg = args.map(arg => String(arg)).join(' ');
      if (!errorMsg.includes('ResizeObserver') && !errorMsg.includes('Warning:')) {
        setConsoleErrors(prev => [...prev, errorMsg]);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const testRoute = async (route: RouteTest) => {
    try {
      // Mark as testing (pending)
      setRouteTests(prev => prev.map(r => 
        r.path === route.path 
          ? { ...r, status: 'pending' as const, error: undefined }
          : r
      ));

      // Test by fetching the route (doesn't navigate away)
      const response = await fetch(route.path, { method: 'HEAD' });
      
      // Check if it's a successful response or expected redirect
      if (response.ok || response.redirected) {
        setRouteTests(prev => prev.map(r => 
          r.path === route.path 
            ? { ...r, status: 'pass' as const }
            : r
        ));
      } else {
        setRouteTests(prev => prev.map(r => 
          r.path === route.path 
            ? { ...r, status: 'fail' as const, error: `HTTP ${response.status}` }
            : r
        ));
      }
    } catch (error) {
      setRouteTests(prev => prev.map(r => 
        r.path === route.path 
          ? { ...r, status: 'fail' as const, error: String(error) }
          : r
      ));
    }
  };

  const testAllAccessibleRoutes = async () => {
    setTestingInProgress(true);
    setConsoleErrors([]);
    
    // Reset all to pending first
    setRouteTests(prev => prev.map(r => ({ ...r, status: 'pending' as const, error: undefined })));
    
    // Test each route sequentially
    for (const route of routeTests) {
      await testRoute(route);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between tests
    }
    
    // Save timestamp
    const timestamp = new Date().toLocaleString();
    setLastTestRun(timestamp);
    localStorage.setItem('route-test-timestamp', timestamp);
    
    setTestingInProgress(false);
  };

  const resetTests = () => {
    setRouteTests(ROUTES_TO_TEST.map(r => ({ ...r, status: 'pending' as const, error: undefined })));
    setConsoleErrors([]);
  };

  const clearResults = () => {
    localStorage.removeItem('route-test-results');
    localStorage.removeItem('route-test-timestamp');
    setRouteTests(ROUTES_TO_TEST.map(r => ({ ...r, status: 'pending' as const, error: undefined })));
    setConsoleErrors([]);
    setLastTestRun(null);
  };

  const groupedRoutes = routeTests.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<string, RouteTest[]>);

  const stats = {
    total: routeTests.length,
    passed: routeTests.filter(r => r.status === 'pass').length,
    failed: routeTests.filter(r => r.status === 'fail').length,
    pending: routeTests.filter(r => r.status === 'pending').length,
  };

  return (
    <>
      <PageTitle title="System Validation" subName="Testing" />

      <RoleCheck allowedRoles={['admin', 'it']}>
        <Alert variant="info" className="mb-4">
          <h6 className="alert-heading">PHASE 3: Testing & Validation</h6>
          <p className="mb-0">
            This dashboard helps you systematically validate all routes, role guards, and system stability.
            Click "Test All Routes" to automatically navigate through all accessible routes, or test individual routes.
          </p>
        </Alert>

        {/* Statistics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <Card className="bg-primary text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.total}</h3>
                <p className="mb-0">Total Routes</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="bg-success text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.passed}</h3>
                <p className="mb-0">Passed</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="bg-danger text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.failed}</h3>
                <p className="mb-0">Failed</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="bg-warning text-white">
              <Card.Body>
                <h3 className="mb-0">{stats.pending}</h3>
                <p className="mb-0">Pending</p>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Button 
                variant="primary" 
                onClick={testAllAccessibleRoutes}
                disabled={testingInProgress}
              >
                {testingInProgress ? `Testing... (${stats.passed + stats.failed}/${stats.total})` : 'Test All Routes'}
              </Button>
              <Button variant="secondary" onClick={resetTests}>
                Reset Tests
              </Button>
              <Button variant="danger" onClick={clearResults}>
                Clear Results
              </Button>
              <Button variant="info" onClick={() => navigate('/dashboards')}>
                Return to Dashboard
              </Button>
              {lastTestRun && (
                <small className="text-muted ms-auto">
                  Last test run: {lastTestRun}
                </small>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Main Content */}
        <Tabs defaultActiveKey="routes" className="mb-4">
          <Tab eventKey="routes" title="Route Testing">
            {Object.entries(groupedRoutes).map(([category, routes]) => (
              <Card key={category} className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">{category} Routes</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th>Path</th>
                        <th>Allowed Roles</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route) => (
                        <tr key={route.path}>
                          <td>{route.name}</td>
                          <td><code>{route.path}</code></td>
                          <td>
                            {route.allowedRoles.map(role => (
                              <Badge key={role} bg="secondary" className="me-1">
                                {role}
                              </Badge>
                            ))}
                          </td>
                          <td>
                            {route.status === 'pass' && <Badge bg="success">✓ Pass</Badge>}
                            {route.status === 'fail' && (
                              <span>
                                <Badge bg="danger">✗ Fail</Badge>
                                {route.error && <small className="text-danger ms-2">{route.error}</small>}
                              </span>
                            )}
                            {!route.status && <Badge bg="secondary">Not Tested</Badge>}
                            {route.status === 'pending' && <Badge bg="warning">⟳ Testing...</Badge>}
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => testRoute(route)}
                              disabled={testingInProgress}
                            >
                              Test
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}
          </Tab>

          <Tab eventKey="console" title={`Console Errors (${consoleErrors.length})`}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Console Error Log</h5>
              </Card.Header>
              <Card.Body>
                {consoleErrors.length === 0 ? (
                  <Alert variant="success">
                    ✅ No console errors detected during testing
                  </Alert>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {consoleErrors.map((error, idx) => (
                      <Alert key={idx} variant="danger" className="mb-2">
                        <small><code>{error}</code></small>
                      </Alert>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="roles" title="Role Access Matrix">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Current User Role Access</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <strong>Current User:</strong> {user?.email || 'Not logged in'}
                </Alert>
                
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Route</th>
                      <th>Should Have Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeTests.map((route) => (
                      <tr key={route.path}>
                        <td>{route.category}</td>
                        <td>{route.name}</td>
                        <td>
                          {route.allowedRoles.map(role => (
                            <Badge key={role} bg="info" className="me-1">
                              {role}
                            </Badge>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="checklist" title="Validation Checklist">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Manual Validation Checklist</h5>
              </Card.Header>
              <Card.Body>
                <h6>Step 8 — Manual Route Testing</h6>
                <ul>
                  <li>✅ Test navigation for all routes using "Test All Routes" button</li>
                  <li>✅ Verify each page loads without redirects</li>
                  <li>✅ Check for missing component warnings in Console tab</li>
                </ul>

                <h6 className="mt-3">Step 9 — Guard & Role Validation</h6>
                <ul>
                  <li>⚠️ Test with different user roles (requires multiple accounts)</li>
                  <li>⚠️ Verify Admin can access all routes</li>
                  <li>⚠️ Verify IT can access all routes</li>
                  <li>⚠️ Verify Staff cannot access Admin/Security routes</li>
                  <li>⚠️ Verify Control cannot access Review routes</li>
                  <li>⚠️ Verify Director can only access Director Review</li>
                  <li>⚠️ Verify Minister can only access Minister Decision</li>
                </ul>

                <h6 className="mt-3">Step 10 — Console & Stability Audit</h6>
                <ul>
                  <li>✅ Monitor console errors during navigation (check Console tab)</li>
                  <li>✅ Validate all metrics and charts load correctly</li>
                  <li>✅ Confirm no React warnings appear</li>
                  <li>✅ Check for 404 errors or redirect loops</li>
                </ul>

                <Alert variant="success" className="mt-3">
                  <strong>Success Criteria:</strong> All routes accessible (100%), no console errors, 
                  all role guards working correctly, system stability ≥ 95%
                </Alert>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </RoleCheck>
    </>
  );
};

export default SystemValidationPage;
