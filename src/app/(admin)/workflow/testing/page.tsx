import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Alert, Badge, Table } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  results?: any;
}

interface TestSuite {
  name: string;
  scenarios: TestScenario[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

const WorkflowTestingPage: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Basic Workflow Tests',
      scenarios: [
        {
          id: 'test-1',
          name: 'Application Creation',
          description: 'Test creating a new application with valid data',
          status: 'pending'
        },
        {
          id: 'test-2',
          name: 'State Transitions',
          description: 'Test all valid state transitions in sequence',
          status: 'pending'
        },
        {
          id: 'test-3',
          name: 'Document Upload',
          description: 'Test document upload and verification process',
          status: 'pending'
        },
        {
          id: 'test-4',
          name: 'Control Visit Scheduling',
          description: 'Test scheduling and completing control visits',
          status: 'pending'
        }
      ],
      totalTests: 4,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Permission & Security Tests',
      scenarios: [
        {
          id: 'security-1',
          name: 'Role-Based Access',
          description: 'Test role-based access controls for each workflow state',
          status: 'pending'
        },
        {
          id: 'security-2',
          name: 'Data Isolation',
          description: 'Verify users can only access their authorized data',
          status: 'pending'
        },
        {
          id: 'security-3',
          name: 'Invalid State Transitions',
          description: 'Test prevention of invalid state transitions',
          status: 'pending'
        }
      ],
      totalTests: 3,
      passedTests: 0,
      failedTests: 0
    },
    {
      name: 'Performance & Load Tests',
      scenarios: [
        {
          id: 'perf-1',
          name: 'Concurrent Applications',
          description: 'Test handling multiple applications simultaneously',
          status: 'pending'
        },
        {
          id: 'perf-2',
          name: 'Large File Uploads',
          description: 'Test uploading large documents and photos',
          status: 'pending'
        },
        {
          id: 'perf-3',
          name: 'Database Query Performance',
          description: 'Test complex queries under load',
          status: 'pending'
        }
      ],
      totalTests: 3,
      passedTests: 0,
      failedTests: 0
    }
  ]);

  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [testRunning, setTestRunning] = useState(false);
  const [generateTestData, setGenerateTestData] = useState(false);

  const runTestSuite = async (suiteName: string) => {
    setTestRunning(true);
    setSelectedSuite(suiteName);

    try {
      const suite = testSuites.find(s => s.name === suiteName);
      if (!suite) return;

      // Update all scenarios to running
      const updatedSuites = testSuites.map(s => 
        s.name === suiteName 
          ? {
              ...s,
              scenarios: s.scenarios.map(scenario => ({
                ...scenario,
                status: 'running' as const
              }))
            }
          : s
      );
      setTestSuites(updatedSuites);

      // Run tests via edge function
      const { data, error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_tests',
          suite: suiteName,
          scenarios: suite.scenarios.map(s => s.id),
          options: {
            generateTestData,
            cleanup: true
          }
        }
      });

      if (error) throw error;

      // Update results
      const finalSuites = testSuites.map(s => 
        s.name === suiteName 
          ? {
              ...s,
              scenarios: s.scenarios.map(scenario => {
                const result = data.results?.find((r: any) => r.id === scenario.id);
                return {
                  ...scenario,
                  status: result?.status || 'failed',
                  duration: result?.duration,
                  results: result?.details
                };
              }),
              passedTests: data.results?.filter((r: any) => r.status === 'passed').length || 0,
              failedTests: data.results?.filter((r: any) => r.status === 'failed').length || 0
            }
          : s
      );
      setTestSuites(finalSuites);

      toast.success(`Test suite "${suiteName}" completed`);
    } catch (error) {
      console.error('Test execution failed:', error);
      toast.error('Test execution failed');
      
      // Mark all tests as failed
      const failedSuites = testSuites.map(s => 
        s.name === suiteName 
          ? {
              ...s,
              scenarios: s.scenarios.map(scenario => ({
                ...scenario,
                status: 'failed' as const
              })),
              failedTests: s.scenarios.length
            }
          : s
      );
      setTestSuites(failedSuites);
    } finally {
      setTestRunning(false);
      setSelectedSuite('');
    }
  };

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTestSuite(suite.name);
      // Small delay between suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const generateSampleData = async () => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'generate_test_data',
          types: [
            'applications',
            'applicants', 
            'documents',
            'control_visits'
          ],
          count: 10
        }
      });

      if (error) throw error;
      toast.success('Test data generated successfully');
    } catch (error) {
      console.error('Failed to generate test data:', error);
      toast.error('Failed to generate test data');
    }
  };

  const getStatusBadge = (status: TestScenario['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'warning', 
      passed: 'success',
      failed: 'danger'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getSuiteHealthColor = (suite: TestSuite) => {
    if (suite.passedTests === suite.totalTests) return 'success';
    if (suite.failedTests > 0) return 'danger';
    return 'warning';
  };

  return (
    <div className="container-fluid">
      <PageTitle 
        title="Workflow Testing" 
        subName="Automated Testing & Quality Assurance"
      />

      {/* Test Controls */}
      <Row className="mb-4">
        <Col>
          <ComponentContainerCard id="test-controls" title="Test Controls">
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="generate-data"
                    label="Generate Test Data"
                    checked={generateTestData}
                    onChange={(e) => setGenerateTestData(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Generate sample data before running tests
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button 
                  variant="outline-secondary"
                  onClick={generateSampleData}
                  className="mb-3"
                  disabled={testRunning}
                >
                  Generate Sample Data
                </Button>
              </Col>
              <Col md={6} className="text-end">
                <Button 
                  variant="primary" 
                  onClick={runAllTests}
                  disabled={testRunning}
                  className="me-2 mb-3"
                >
                  {testRunning ? 'Running Tests...' : 'Run All Test Suites'}
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => {/* Export results */}}
                  disabled={testRunning}
                  className="mb-3"
                >
                  Export Results
                </Button>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Test Suites */}
      <Row>
        {testSuites.map((suite, index) => (
          <Col lg={4} key={index} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{suite.name}</h6>
                <Badge bg={getSuiteHealthColor(suite)}>
                  {suite.passedTests}/{suite.totalTests}
                </Badge>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-success">✓ {suite.passedTests} Passed</small>
                  {suite.failedTests > 0 && (
                    <span className="ms-2">
                      <small className="text-danger">✗ {suite.failedTests} Failed</small>
                    </span>
                  )}
                </div>

                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {suite.scenarios.map((scenario, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                      <div>
                        <div className="fw-medium">{scenario.name}</div>
                        <small className="text-muted">{scenario.description}</small>
                        {scenario.duration && (
                          <div>
                            <small className="text-info">Duration: {scenario.duration}ms</small>
                          </div>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(scenario.status)}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => runTestSuite(suite.name)}
                  disabled={testRunning || selectedSuite === suite.name}
                  className="w-100"
                >
                  {selectedSuite === suite.name ? 'Running...' : 'Run Test Suite'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Test Results */}
      <Row>
        <Col>
          <ComponentContainerCard id="test-results" title="Recent Test Results">
            <Alert variant="info">
              <strong>Test Summary:</strong> Run test suites to view detailed results and recommendations.
            </Alert>
            
            <Table responsive>
              <thead>
                <tr>
                  <th>Test Suite</th>
                  <th>Status</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Last Run</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testSuites.map((suite, index) => (
                  <tr key={index}>
                    <td>{suite.name}</td>
                    <td>
                      <Badge bg={getSuiteHealthColor(suite)}>
                        {suite.passedTests === suite.totalTests ? 'All Passed' : 
                         suite.failedTests > 0 ? 'Some Failed' : 'Not Run'}
                      </Badge>
                    </td>
                    <td className="text-success">{suite.passedTests}</td>
                    <td className="text-danger">{suite.failedTests}</td>
                    <td className="text-muted">-</td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => runTestSuite(suite.name)}
                        disabled={testRunning}
                      >
                        Run
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowTestingPage;