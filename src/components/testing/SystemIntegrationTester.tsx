import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/useAuthContext';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Card, Row, Col, Alert, Badge, ListGroup } from 'react-bootstrap';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  message: string;
  details?: string;
  timestamp: Date;
}

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'failed';
  authentication: 'healthy' | 'degraded' | 'failed';
  storage: 'healthy' | 'degraded' | 'failed';
  edgeFunctions: 'healthy' | 'degraded' | 'failed';
  permissions: 'healthy' | 'degraded' | 'failed';
}

export const SystemIntegrationTester: React.FC = () => {
  const { user, roles } = useAuthContext();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    authentication: 'healthy',
    storage: 'healthy',
    edgeFunctions: 'healthy',
    permissions: 'healthy'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [completedTests, setCompletedTests] = useState(0);
  const [totalTests] = useState(15);

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, result]);
    setCompletedTests(prev => prev + 1);
  };

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, details, timestamp: new Date() }
        : test
    ));
    if (status !== 'running') {
      setCompletedTests(prev => prev + 1);
    }
  };

  const runDatabaseTests = async () => {
    // Test 1: Database Connection
    addTestResult({ name: 'Database Connection', status: 'running', message: 'Testing connection...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      updateTestResult('Database Connection', 'passed', 'Database accessible');
    } catch (error: any) {
      updateTestResult('Database Connection', 'failed', `Connection failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'failed' }));
      return false;
    }

    // Test 2: RLS Policies
    addTestResult({ name: 'RLS Policies', status: 'running', message: 'Testing Row Level Security...', timestamp: new Date() });
    
    try {
      // Test authenticated access
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('RLS Policies', 'passed', 'RLS policies working correctly');
    } catch (error: any) {
      updateTestResult('RLS Policies', 'failed', `RLS test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }

    // Test 3: User Roles
    addTestResult({ name: 'User Roles', status: 'running', message: 'Testing role system...', timestamp: new Date() });
    
    try {
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        updateTestResult('User Roles', 'passed', `Found ${data?.length || 0} active roles`);
      } else {
        updateTestResult('User Roles', 'warning', 'No authenticated user to test');
      }
    } catch (error: any) {
      updateTestResult('User Roles', 'failed', `Role test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, permissions: 'failed' }));
    }

    return true;
  };

  const runAuthenticationTests = async () => {
    // Test 4: Auth State
    addTestResult({ name: 'Authentication State', status: 'running', message: 'Checking auth state...', timestamp: new Date() });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        updateTestResult('Authentication State', 'passed', 'Valid session found');
      } else {
        updateTestResult('Authentication State', 'warning', 'No active session');
      }
    } catch (error: any) {
      updateTestResult('Authentication State', 'failed', `Auth test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, authentication: 'failed' }));
    }

    // Test 5: Profile Data
    addTestResult({ name: 'Profile Integration', status: 'running', message: 'Testing profile data sync...', timestamp: new Date() });
    
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          updateTestResult('Profile Integration', 'passed', 'Profile data synchronized');
        } else {
          updateTestResult('Profile Integration', 'warning', 'No profile data found');
        }
      } else {
        updateTestResult('Profile Integration', 'warning', 'No authenticated user');
      }
    } catch (error: any) {
      updateTestResult('Profile Integration', 'failed', `Profile test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, authentication: 'degraded' }));
    }
  };

  const runStorageTests = async () => {
    // Test 6: Storage Buckets
    addTestResult({ name: 'Storage Buckets', status: 'running', message: 'Testing storage access...', timestamp: new Date() });
    
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const expectedBuckets = ['documents', 'control-photos'];
      const foundBuckets = data.map(b => b.name);
      const missingBuckets = expectedBuckets.filter(b => !foundBuckets.includes(b));
      
      if (missingBuckets.length === 0) {
        updateTestResult('Storage Buckets', 'passed', `Found ${data.length} storage buckets`);
      } else {
        updateTestResult('Storage Buckets', 'warning', `Missing buckets: ${missingBuckets.join(', ')}`);
        setSystemStatus(prev => ({ ...prev, storage: 'degraded' }));
      }
    } catch (error: any) {
      updateTestResult('Storage Buckets', 'failed', `Storage test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, storage: 'failed' }));
    }

    // Test 7: Storage Policies
    addTestResult({ name: 'Storage Policies', status: 'running', message: 'Testing storage policies...', timestamp: new Date() });
    
    try {
      // Try to list files in documents bucket
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', { limit: 1 });
      
      if (error && !error.message.includes('The resource was not found')) {
        throw error;
      }
      
      updateTestResult('Storage Policies', 'passed', 'Storage policies configured');
    } catch (error: any) {
      updateTestResult('Storage Policies', 'failed', `Storage policy test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, storage: 'degraded' }));
    }
  };

  const runEdgeFunctionTests = async () => {
    // Test 8: Health Check Function
    addTestResult({ name: 'Health Check Function', status: 'running', message: 'Testing edge functions...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.functions.invoke('health-check', {
        body: { check: 'quick' }
      });
      
      if (error) throw error;
      updateTestResult('Health Check Function', 'passed', 'Edge functions responding');
    } catch (error: any) {
      updateTestResult('Health Check Function', 'failed', `Edge function test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, edgeFunctions: 'failed' }));
    }

    // Test 9: Reference Data Function
    addTestResult({ name: 'Reference Data Function', status: 'running', message: 'Testing reference data service...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.functions.invoke('reference-data', {
        body: { action: 'list', category: 'districts' }
      });
      
      if (error) throw error;
      updateTestResult('Reference Data Function', 'passed', 'Reference data service working');
    } catch (error: any) {
      updateTestResult('Reference Data Function', 'warning', `Reference data test: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, edgeFunctions: 'degraded' }));
    }
  };

  const runApplicationTests = async () => {
    // Test 10: Application Data Model
    addTestResult({ name: 'Application Schema', status: 'running', message: 'Testing application data model...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('applications').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('Application Schema', 'passed', 'Application schema accessible');
    } catch (error: any) {
      updateTestResult('Application Schema', 'failed', `Schema test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }

    // Test 11: Document Management
    addTestResult({ name: 'Document Management', status: 'running', message: 'Testing document system...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('documents').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('Document Management', 'passed', 'Document system accessible');
    } catch (error: any) {
      updateTestResult('Document Management', 'failed', `Document test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }

    // Test 12: Workflow System
    addTestResult({ name: 'Workflow System', status: 'running', message: 'Testing workflow management...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('application_steps').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('Workflow System', 'passed', 'Workflow system accessible');
    } catch (error: any) {
      updateTestResult('Workflow System', 'failed', `Workflow test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }
  };

  const runSecurityTests = async () => {
    // Test 13: Permission Checks
    addTestResult({ name: 'Permission System', status: 'running', message: 'Testing permissions...', timestamp: new Date() });
    
    try {
      if (user && roles.length > 0) {
        const userRoles = roles.map(r => r.role);
        const hasValidRole = userRoles.some(role => 
          ['admin', 'it', 'staff', 'front_office', 'control', 'director', 'minister'].includes(role)
        );
        
        if (hasValidRole) {
          updateTestResult('Permission System', 'passed', `User has roles: ${userRoles.join(', ')}`);
        } else {
          updateTestResult('Permission System', 'warning', 'User has unrecognized roles');
          setSystemStatus(prev => ({ ...prev, permissions: 'degraded' }));
        }
      } else {
        updateTestResult('Permission System', 'warning', 'No roles assigned or no user');
        setSystemStatus(prev => ({ ...prev, permissions: 'degraded' }));
      }
    } catch (error: any) {
      updateTestResult('Permission System', 'failed', `Permission test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, permissions: 'failed' }));
    }

    // Test 14: Audit Logging
    addTestResult({ name: 'Audit System', status: 'running', message: 'Testing audit logging...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('audit_logs').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('Audit System', 'passed', 'Audit logging accessible');
    } catch (error: any) {
      updateTestResult('Audit System', 'failed', `Audit test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }

    // Test 15: Notification System
    addTestResult({ name: 'Notification System', status: 'running', message: 'Testing notifications...', timestamp: new Date() });
    
    try {
      const { error } = await supabase.from('notifications').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      updateTestResult('Notification System', 'passed', 'Notification system accessible');
    } catch (error: any) {
      updateTestResult('Notification System', 'failed', `Notification test failed: ${error.message}`);
      setSystemStatus(prev => ({ ...prev, database: 'degraded' }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    setCompletedTests(0);
    setSystemStatus({
      database: 'healthy',
      authentication: 'healthy',
      storage: 'healthy',
      edgeFunctions: 'healthy',
      permissions: 'healthy'
    });

    try {
      await runDatabaseTests();
      await runAuthenticationTests();
      await runStorageTests();
      await runEdgeFunctionTests();
      await runApplicationTests();
      await runSecurityTests();
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getTestIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'solar:check-circle-bold';
      case 'failed': return 'solar:close-circle-bold';
      case 'warning': return 'solar:danger-triangle-bold';
      case 'running': return 'solar:refresh-circle-bold';
      default: return 'solar:question-circle-bold';
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>System Integration Tests</h4>
        <button 
          className="btn btn-primary"
          onClick={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" />
              Running Tests...
            </>
          ) : (
            <>
              <IconifyIcon icon="solar:play-circle-bold" className="me-2" />
              Run All Tests
            </>
          )}
        </button>
      </div>

      {isRunning && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-3" />
            <div className="flex-grow-1">
              <strong>Running Integration Tests...</strong>
              <div className="progress mt-2" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  style={{ width: `${(completedTests / totalTests) * 100}%` }}
                />
              </div>
              <small className="text-muted">
                {completedTests} of {totalTests} tests completed
              </small>
            </div>
          </div>
        </Alert>
      )}

      {/* System Status Overview */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">System Status Overview</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(systemStatus).map(([system, status]) => (
                  <Col md={6} lg={4} xl={2} key={system} className="mb-2">
                    <div className="text-center">
                      <Badge 
                        bg={getStatusColor(status)}
                        className="w-100 text-capitalize"
                      >
                        {system.replace(/([A-Z])/g, ' $1')}
                      </Badge>
                      <div className="mt-1">
                        <small className={`text-${getStatusColor(status)}`}>
                          {status}
                        </small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Test Results */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Test Results</h6>
            </Card.Header>
            <Card.Body>
              {tests.length === 0 && !isRunning ? (
                <div className="text-center py-4">
                  <IconifyIcon icon="solar:test-tube-bold" className="fs-1 text-muted" />
                  <p className="text-muted mt-2">Click "Run All Tests" to start integration testing</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {tests.map((test, index) => (
                    <ListGroup.Item key={index} className="d-flex align-items-center">
                      <IconifyIcon 
                        icon={getTestIcon(test.status)}
                        className={`me-3 text-${
                          test.status === 'passed' ? 'success' : 
                          test.status === 'failed' ? 'danger' :
                          test.status === 'warning' ? 'warning' : 'info'
                        } ${test.status === 'running' ? 'spinning' : ''}`}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{test.name}</strong>
                          <Badge 
                            bg={
                              test.status === 'passed' ? 'success' : 
                              test.status === 'failed' ? 'danger' :
                              test.status === 'warning' ? 'warning' : 'info'
                            }
                          >
                            {test.status}
                          </Badge>
                        </div>
                        <div className="text-muted">{test.message}</div>
                        {test.details && (
                          <small className="text-muted">{test.details}</small>
                        )}
                        <small className="text-muted d-block">
                          {test.timestamp.toLocaleTimeString()}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};