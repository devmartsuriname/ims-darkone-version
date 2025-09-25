import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge, Form, Modal } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import { supabase } from '@/integrations/supabase/client'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import { useToastNotifications } from '@/components/ui/NotificationToasts'

interface AuthTestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

const AuthenticationSetupPage: React.FC = () => {
  const { user, profile, roles, isAuthenticated } = useAuthContext()
  const [testResults, setTestResults] = useState<AuthTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showInitialSetup, setShowInitialSetup] = useState(false)
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: 'IT',
    position: 'System Administrator'
  })
  const [setupLoading, setSetupLoading] = useState(false)

  const { success: showSuccess, error: showError } = useToastNotifications()

  useEffect(() => {
    checkInitialSetup()
  }, [])

  const checkInitialSetup = async () => {
    try {
      // Check if there are any admin users
      const { data: adminRoles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .eq('is_active', true)

      if (error) throw error

      if (!adminRoles || adminRoles.length === 0) {
        setShowInitialSetup(true)
      }
    } catch (error) {
      console.error('Error checking initial setup:', error)
    }
  }

  const runAuthenticationTests = async () => {
    setIsRunning(true)
    const results: AuthTestResult[] = []

    try {
      // Test 1: Current Authentication Status
      results.push({
        name: 'Authentication Status',
        status: isAuthenticated ? 'success' : 'error',
        message: isAuthenticated ? 'User is properly authenticated' : 'User is not authenticated',
        details: {
          userId: user?.id,
          email: user?.email,
          authenticated: isAuthenticated
        }
      })

      // Test 2: User Profile Data
      if (isAuthenticated && user) {
        results.push({
          name: 'Profile Data',
          status: profile ? 'success' : 'warning',
          message: profile ? 'User profile loaded successfully' : 'User profile not found',
          details: profile
        })

        // Test 3: User Roles
        results.push({
          name: 'Role Assignment',
          status: roles.length > 0 ? 'success' : 'error',
          message: roles.length > 0 ? `User has ${roles.length} role(s)` : 'No roles assigned',
          details: roles
        })

        // Test 4: Permission Functions
        try {
          const { data: canManage } = await supabase.rpc('can_manage_applications')
          const { data: canControl } = await supabase.rpc('can_control_inspect')
          const { data: canReview } = await supabase.rpc('can_review_applications')
          const { data: isAdmin } = await supabase.rpc('is_admin_or_it')

          results.push({
            name: 'Permission Functions',
            status: 'success',
            message: 'All permission functions working correctly',
            details: {
              canManageApplications: canManage,
              canControlInspect: canControl,
              canReviewApplications: canReview,
              isAdminOrIT: isAdmin
            }
          })
        } catch (error) {
          results.push({
            name: 'Permission Functions',
            status: 'error',
            message: 'Error testing permission functions',
            details: error
          })
        }
      }

      // Test 5: RLS Policies
      try {
        const rlsTests = [
          { table: 'profiles', description: 'Profile Access' },
          { table: 'user_roles', description: 'Role Access' },
          { table: 'applications', description: 'Application Access' }
        ]

        for (const test of rlsTests) {
          try {
            const { data, error } = await supabase
              .from(test.table as any)
              .select('*')
              .limit(1)

            results.push({
              name: `RLS Policy - ${test.description}`,
              status: error ? 'error' : 'success',
              message: error ? `RLS policy blocking access: ${error.message}` : 'RLS policy working correctly',
              details: { table: test.table, recordCount: data?.length || 0 }
            })
          } catch (rlsError) {
            results.push({
              name: `RLS Policy - ${test.description}`,
              status: 'error',
              message: 'RLS policy test failed',
              details: rlsError
            })
          }
        }
      } catch (error) {
        results.push({
          name: 'RLS Policy Tests',
          status: 'error',
          message: 'Failed to run RLS policy tests',
          details: error
        })
      }

      // Test 6: Session Management
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        results.push({
          name: 'Session Management',
          status: session && !error ? 'success' : 'error',
          message: session ? 'Valid session found' : 'No valid session',
          details: {
            hasSession: !!session,
            sessionValid: !!session && !error,
            expiresAt: session?.expires_at
          }
        })
      } catch (error) {
        results.push({
          name: 'Session Management',
          status: 'error',
          message: 'Session test failed',
          details: error
        })
      }

      // Test 7: User Management Service
      try {
        const { error } = await supabase.functions.invoke('user-management', {
          body: { action: 'test' }
        })

        results.push({
          name: 'User Management Service',
          status: !error ? 'success' : 'warning',
          message: !error ? 'User management service responding' : 'User management service not available',
          details: { serviceAvailable: !error }
        })
      } catch (error) {
        results.push({
          name: 'User Management Service',
          status: 'error',
          message: 'User management service test failed',
          details: error
        })
      }

    } catch (error) {
      results.push({
        name: 'Authentication Tests',
        status: 'error',
        message: 'Failed to run authentication tests',
        details: error
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const createInitialAdmin = async () => {
    setSetupLoading(true)
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'create',
          email: adminData.email,
          password: adminData.password,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          department: adminData.department,
          position: adminData.position,
          roles: ['admin']
        }
      })

      if (error) throw error

      showSuccess('Initial Admin Created', 'Administrator account created successfully!')
      setShowInitialSetup(false)
      setAdminData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        department: 'IT',
        position: 'System Administrator'
      })
    } catch (error: any) {
      showError('Setup Failed', error.message || 'Failed to create admin account')
    } finally {
      setSetupLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success'
      case 'error': return 'danger'
      case 'warning': return 'warning'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'solar:check-circle-bold'
      case 'error': return 'solar:close-circle-bold'
      case 'warning': return 'solar:danger-triangle-bold'
      default: return 'solar:question-circle-bold'
    }
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const warningCount = testResults.filter(r => r.status === 'warning').length

  return (
    <Container fluid>
      <PageTitle 
        title="Authentication & User Management Setup" 
        subName="System Authentication Validation"
      />

      {/* Current User Status */}
      <Row className="mb-4">
        <Col>
          <ComponentContainerCard id="current-user-status" title="Current Authentication Status">
            <Row>
              <Col md={4}>
                <Card className={`text-center border-${isAuthenticated ? 'success' : 'danger'}`}>
                  <Card.Body>
                    <IconifyIcon 
                      icon={isAuthenticated ? 'solar:shield-check-bold' : 'solar:shield-cross-bold'} 
                      className={`fs-48 text-${isAuthenticated ? 'success' : 'danger'} mb-2`} 
                    />
                    <h6>Authentication</h6>
                    <Badge bg={isAuthenticated ? 'success' : 'danger'}>
                      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className={`text-center border-${profile ? 'success' : 'warning'}`}>
                  <Card.Body>
                    <IconifyIcon 
                      icon="solar:user-bold" 
                      className={`fs-48 text-${profile ? 'success' : 'warning'} mb-2`} 
                    />
                    <h6>Profile</h6>
                    <Badge bg={profile ? 'success' : 'warning'}>
                      {profile ? 'Profile Loaded' : 'No Profile'}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className={`text-center border-${roles.length > 0 ? 'success' : 'danger'}`}>
                  <Card.Body>
                    <IconifyIcon 
                      icon="solar:crown-bold" 
                      className={`fs-48 text-${roles.length > 0 ? 'success' : 'danger'} mb-2`} 
                    />
                    <h6>Roles</h6>
                    <Badge bg={roles.length > 0 ? 'success' : 'danger'}>
                      {roles.length} Role{roles.length !== 1 ? 's' : ''}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {isAuthenticated && (
              <Row className="mt-3">
                <Col>
                  <Alert variant="info">
                    <strong>User:</strong> {user?.email} <br />
                    <strong>Profile:</strong> {profile ? `${profile.first_name} ${profile.last_name}` : 'Not loaded'} <br />
                    <strong>Roles:</strong> {roles.map(r => r.role).join(', ') || 'None assigned'}
                  </Alert>
                </Col>
              </Row>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Test Controls */}
      <Row className="mb-4">
        <Col>
          <ComponentContainerCard id="test-controls" title="Authentication Testing">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>Run comprehensive authentication tests</h6>
                <p className="text-muted mb-0">
                  Validates authentication, authorization, RLS policies, and user management
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={runAuthenticationTests}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <IconifyIcon icon="solar:restart-bold" className="me-2 spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="solar:play-bold" className="me-2" />
                    Run Authentication Tests
                  </>
                )}
              </Button>
            </div>

            {testResults.length > 0 && (
              <Row className="mt-4">
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-success">{successCount}</h4>
                    <small className="text-muted">Passed</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-warning">{warningCount}</h4>
                    <small className="text-muted">Warnings</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-danger">{errorCount}</h4>
                    <small className="text-muted">Failed</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h4 className="text-primary">{testResults.length}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                </Col>
              </Row>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Row>
          <Col>
            <ComponentContainerCard id="test-results" title="Test Results">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`d-flex align-items-start p-3 border-start border-4 border-${getStatusColor(result.status)} mb-3 bg-light rounded`}
                >
                  <div className="me-3">
                    <IconifyIcon 
                      icon={getStatusIcon(result.status)} 
                      className={`fs-5 text-${getStatusColor(result.status)}`} 
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{result.name}</h6>
                        <p className="mb-2 text-muted">{result.message}</p>
                      </div>
                      <Badge bg={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {result.details && (
                      <details className="small text-muted">
                        <summary className="cursor-pointer">View Details</summary>
                        <pre className="mt-2 p-2 bg-white border rounded small">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </ComponentContainerCard>
          </Col>
        </Row>
      )}

      {/* Initial Setup Modal */}
      <Modal show={showInitialSetup} backdrop="static" keyboard={false}>
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>
            <IconifyIcon icon="solar:settings-bold" className="me-2" />
            Initial System Setup
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
            <strong>Welcome to IMS!</strong> No admin users found. Let's create your first administrator account.
          </Alert>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={adminData.firstName}
                  onChange={(e) => setAdminData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={adminData.lastName}
                  onChange={(e) => setAdminData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email Address *</Form.Label>
            <Form.Control
              type="email"
              value={adminData.email}
              onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              value={adminData.password}
              onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password (min 8 characters)"
              required
            />
            <Form.Text className="text-muted">
              Password must be at least 8 characters long
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  value={adminData.department}
                  onChange={(e) => setAdminData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Position</Form.Label>
                <Form.Control
                  type="text"
                  value={adminData.position}
                  onChange={(e) => setAdminData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter position"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={createInitialAdmin}
            disabled={
              setupLoading ||
              !adminData.email ||
              !adminData.password ||
              !adminData.firstName ||
              !adminData.lastName ||
              adminData.password.length < 8
            }
          >
            {setupLoading ? (
              <>
                <IconifyIcon icon="solar:restart-bold" className="me-2 spin" />
                Creating Admin...
              </>
            ) : (
              <>
                <IconifyIcon icon="solar:user-plus-bold" className="me-2" />
                Create Administrator
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AuthenticationSetupPage