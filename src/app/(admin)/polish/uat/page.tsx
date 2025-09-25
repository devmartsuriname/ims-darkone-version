import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, Form } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface UATScenario {
  id: string;
  name: string;
  description: string;
  category: 'intake' | 'control' | 'review' | 'decision' | 'integration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'blocked';
  assignedTo?: string;
  testSteps: string[];
  expectedResults: string[];
  actualResults?: string[];
  executedAt?: Date;
  executedBy?: string;
  issues?: string[];
}

interface UATFeedback {
  id: string;
  scenarioId: string;
  userRole: string;
  rating: number; // 1-5
  comments: string;
  suggestions?: string;
  createdAt: Date;
}

interface TestUser {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
  lastActivity?: Date;
}

const UATPreparationPage: React.FC = () => {
  const [uatScenarios, setUatScenarios] = useState<UATScenario[]>([]);
  const [feedback, setFeedback] = useState<UATFeedback[]>([]);
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadUATData();
  }, []);

  const loadUATData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUATScenarios(),
        loadFeedback(),
        loadTestUsers()
      ]);
    } catch (error) {
      console.error('Failed to load UAT data:', error);
      toast.error('Failed to load UAT data');
    } finally {
      setLoading(false);
    }
  };

  const loadUATScenarios = async () => {
    // Mock UAT scenarios
    const scenarios: UATScenario[] = [
      {
        id: 'uat-1',
        name: 'Complete Application Submission',
        description: 'End-to-end test of application intake process',
        category: 'intake',
        priority: 'critical',
        status: 'passed',
        testSteps: [
          'Navigate to application intake',
          'Fill applicant information',
          'Upload required documents',
          'Submit application',
          'Verify application status'
        ],
        expectedResults: [
          'Form loads without errors',
          'Validation works correctly',
          'Documents upload successfully',
          'Application saves with DRAFT status',
          'Status updates to INTAKE_REVIEW'
        ],
        executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        executedBy: 'Test User 1'
      },
      {
        id: 'uat-2',
        name: 'Control Visit Workflow',
        description: 'Test control department visit scheduling and execution',
        category: 'control',
        priority: 'high',
        status: 'in_progress',
        testSteps: [
          'Access control queue',
          'Schedule control visit',
          'Execute site visit',
          'Capture required photos',
          'Complete technical assessment'
        ],
        expectedResults: [
          'Applications appear in queue',
          'Calendar integration works',
          'Photo capture system functional',
          'GPS coordinates recorded',
          'Technical report generated'
        ]
      },
      {
        id: 'uat-3',
        name: 'Director Review Process',
        description: 'Test director review and recommendation workflow',
        category: 'review',
        priority: 'high',
        status: 'pending',
        testSteps: [
          'Access director dashboard',
          'Review application details',
          'Verify technical and social reports',
          'Make recommendation',
          'Submit to minister'
        ],
        expectedResults: [
          'Complete application data visible',
          'All reports accessible',
          'Recommendation form functional',
          'Workflow progresses correctly',
          'Notifications sent'
        ]
      },
      {
        id: 'uat-4',
        name: 'Multi-Role Collaboration',
        description: 'Test workflow across multiple user roles',
        category: 'integration',
        priority: 'critical',
        status: 'failed',
        testSteps: [
          'Staff creates application',
          'Control schedules visit',
          'Inspector completes assessment',
          'Director reviews',
          'Minister makes decision'
        ],
        expectedResults: [
          'Seamless handoffs between roles',
          'Real-time status updates',
          'Proper notifications',
          'Data consistency maintained',
          'Audit trail complete'
        ],
        issues: ['Notification delays between roles', 'Missing audit entries for some actions']
      }
    ];
    setUatScenarios(scenarios);
  };

  const loadFeedback = async () => {
    // Mock feedback data
    const feedbackData: UATFeedback[] = [
      {
        id: 'fb-1',
        scenarioId: 'uat-1',
        userRole: 'front_office',
        rating: 4,
        comments: 'Form is intuitive but upload process could be faster',
        suggestions: 'Add progress indicators for file uploads',
        createdAt: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: 'fb-2',
        scenarioId: 'uat-4',
        userRole: 'control',
        rating: 2,
        comments: 'Workflow breaks when switching between applications',
        suggestions: 'Need better state management for multi-application scenarios',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
    setFeedback(feedbackData);
  };

  const loadTestUsers = async () => {
    // Mock test users
    const users: TestUser[] = [
      {
        id: 'user-1',
        name: 'Test Admin',
        role: 'admin',
        email: 'admin@test.com',
        status: 'active',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'user-2',
        name: 'Test Staff',
        role: 'staff',
        email: 'staff@test.com',
        status: 'active',
        lastActivity: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: 'user-3',
        name: 'Test Control',
        role: 'control',
        email: 'control@test.com',
        status: 'active',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'user-4',
        name: 'Test Director',
        role: 'director',
        email: 'director@test.com',
        status: 'inactive',
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
    setTestUsers(users);
  };

  const executeScenario = async (scenarioId: string) => {
    setExecuting(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'execute_uat_scenario',
          scenario_id: scenarioId
        }
      });

      if (error) throw error;

      toast.success('UAT scenario executed');
      await loadUATData();
    } catch (error) {
      console.error('UAT execution failed:', error);
      toast.error('UAT execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const generateUATReport = async () => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'generate_uat_report'
        }
      });

      if (error) throw error;

      toast.success('UAT report generated and sent');
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Report generation failed');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'secondary',
      in_progress: 'warning',
      passed: 'success',
      failed: 'danger',
      blocked: 'dark'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'warning',
      critical: 'danger'
    };
    return colors[priority as keyof typeof colors] || 'secondary';
  };

  const getCompletionRate = () => {
    const completed = uatScenarios.filter(s => s.status === 'passed').length;
    const total = uatScenarios.length;
    return Math.round((completed / total) * 100);
  };

  const filteredScenarios = selectedCategory === 'all' 
    ? uatScenarios 
    : uatScenarios.filter(s => s.category === selectedCategory);

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
        title="UAT Preparation" 
        subName="User Acceptance Testing Scenarios & Management"
      />

      {/* UAT Overview */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{getCompletionRate()}%</div>
                <p className="text-muted mb-0">Completion Rate</p>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${getCompletionRate()}%` }}
                ></div>
              </div>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={generateUATReport}
                >
                  Generate UAT Report
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadUATData}
                >
                  Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard id="uat-summary" title="UAT Summary">
            <Row>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-success mb-1">
                    {uatScenarios.filter(s => s.status === 'passed').length}
                  </div>
                  <small className="text-muted">Passed</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-warning mb-1">
                    {uatScenarios.filter(s => s.status === 'in_progress').length}
                  </div>
                  <small className="text-muted">In Progress</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-danger mb-1">
                    {uatScenarios.filter(s => s.status === 'failed').length}
                  </div>
                  <small className="text-muted">Failed</small>
                </div>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <div className="text-center">
                  <div className="h3 text-secondary mb-1">
                    {uatScenarios.filter(s => s.status === 'pending').length}
                  </div>
                  <small className="text-muted">Pending</small>
                </div>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Test Scenarios */}
      <Row className="mb-4">
        <Col>
          <ComponentContainerCard id="uat-scenarios" title="UAT Scenarios">
            <div className="mb-3">
              <Form.Select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto', display: 'inline-block' }}
              >
                <option value="all">All Categories</option>
                <option value="intake">Intake</option>
                <option value="control">Control</option>
                <option value="review">Review</option>
                <option value="decision">Decision</option>
                <option value="integration">Integration</option>
              </Form.Select>
            </div>

            <Table responsive>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Executed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredScenarios.map((scenario) => (
                  <tr key={scenario.id}>
                    <td>
                      <div>
                        <div className="fw-medium">{scenario.name}</div>
                        <small className="text-muted">{scenario.description}</small>
                        {scenario.issues && scenario.issues.length > 0 && (
                          <div className="mt-1">
                            {scenario.issues.map((issue, index) => (
                              <div key={index}>
                                <small className="text-danger">
                                  <IconifyIcon icon="solar:danger-triangle-bold" className="me-1" />
                                  {issue}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">{scenario.category}</Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityColor(scenario.priority)}>
                        {scenario.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(scenario.status)}>
                        {scenario.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {scenario.executedAt ? scenario.executedAt.toLocaleString() : 'Never'}
                      </small>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => executeScenario(scenario.id)}
                        disabled={executing || scenario.status === 'in_progress'}
                      >
                        {scenario.status === 'in_progress' ? 'Running...' : 'Execute'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Test Users */}
      <Row>
        <Col lg={6}>
          <ComponentContainerCard id="test-users" title="Test Users">
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {testUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="fw-medium">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="info">{user.role}</Badge>
                    </td>
                    <td>
                      <Badge bg={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {user.lastActivity?.toLocaleString() || 'Never'}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>

        <Col lg={6}>
          <ComponentContainerCard id="uat-feedback" title="Recent Feedback">
            {feedback.length > 0 ? (
              <div className="space-y-3">
                {feedback.map((fb) => (
                  <Card key={fb.id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong>{fb.userRole}</strong>
                          <div className="text-warning">
                            {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                          </div>
                        </div>
                        <small className="text-muted">
                          {fb.createdAt.toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-2">{fb.comments}</p>
                      {fb.suggestions && (
                        <div className="text-muted">
                          <small><strong>Suggestion:</strong> {fb.suggestions}</small>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                No feedback available yet
              </div>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default UATPreparationPage;