import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, ProgressBar, ListGroup, Badge, Tabs, Tab } from 'react-bootstrap';
import { IMSIntegrationTester, WorkflowTestResult } from '@/utils/integration-test';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface TestSuiteResults {
  workflow: WorkflowTestResult[];
  security: WorkflowTestResult[];
  performance: WorkflowTestResult[];
  integration: WorkflowTestResult[];
}

const IntegrationTestDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [results, setResults] = useState<TestSuiteResults>({
    workflow: [],
    security: [],
    performance: [],
    integration: []
  });
  const [activeTab, setActiveTab] = useState('overview');

  const runCompleteTestSuite = async () => {
    setIsRunning(true);
    setResults({ workflow: [], security: [], performance: [], integration: [] });
    setTestProgress(0);

    try {
      // Workflow tests
      setTestProgress(25);
      const workflowResults = await IMSIntegrationTester.testCompleteWorkflow();
      setResults(prev => ({ ...prev, workflow: workflowResults }));

      // Security tests
      setTestProgress(50);
      const securityResults = await IMSIntegrationTester.testSecurityControls();
      setResults(prev => ({ ...prev, security: securityResults }));

      // Performance tests
      setTestProgress(75);
      const performanceResults = await IMSIntegrationTester.testPerformance();
      setResults(prev => ({ ...prev, performance: performanceResults }));

      // Integration tests
      setTestProgress(90);
      const integrationResults = await IMSIntegrationTester.testSystemIntegration();
      setResults(prev => ({ ...prev, integration: integrationResults }));

      setTestProgress(100);

      // Cleanup test data if workflow test created any
      const creationResult = workflowResults.find(r => r.step === 'Application Creation');
      if (creationResult?.success && creationResult.data) {
        await IMSIntegrationTester.cleanupTestData(
          creationResult.data.applicationId,
          creationResult.data.applicantId
        );
      }

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTestSuite = async (suite: keyof TestSuiteResults) => {
    setIsRunning(true);
    setTestProgress(0);

    try {
      let testResults: WorkflowTestResult[] = [];
      
      switch (suite) {
        case 'workflow':
          setTestProgress(50);
          testResults = await IMSIntegrationTester.testCompleteWorkflow();
          break;
        case 'security':
          setTestProgress(50);
          testResults = await IMSIntegrationTester.testSecurityControls();
          break;
        case 'performance':
          setTestProgress(50);
          testResults = await IMSIntegrationTester.testPerformance();
          break;
        case 'integration':
          setTestProgress(50);
          testResults = await IMSIntegrationTester.testSystemIntegration();
          break;
      }

      setResults(prev => ({ ...prev, [suite]: testResults }));
      setTestProgress(100);

      // Cleanup if needed
      if (suite === 'workflow') {
        const creationResult = testResults.find(r => r.step === 'Application Creation');
        if (creationResult?.success && creationResult.data) {
          await IMSIntegrationTester.cleanupTestData(
            creationResult.data.applicationId,
            creationResult.data.applicantId
          );
        }
      }

    } catch (error) {
      console.error(`${suite} test suite failed:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getResultIcon = (success: boolean) => {
    return success ? 
      <IconifyIcon icon="bx:check-circle" className="text-success" /> :
      <IconifyIcon icon="bx:x-circle" className="text-danger" />;
  };

  const getResultVariant = (success: boolean) => {
    return success ? 'success' : 'danger';
  };

  const calculateSuiteStats = (testResults: WorkflowTestResult[]) => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.success).length;
    const avgDuration = total > 0 ? 
      testResults.reduce((sum, r) => sum + (r.duration || 0), 0) / total : 0;
    
    return {
      total,
      passed,
      failed: total - passed,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      avgDuration: Math.round(avgDuration)
    };
  };

  const allResults = [...results.workflow, ...results.security, ...results.performance, ...results.integration];
  const overallStats = calculateSuiteStats(allResults);

  return (
    <Container fluid>
      {/* Header Controls */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <IconifyIcon icon="bx:test-tube" className="me-2" />
                  IMS Integration Testing Dashboard
                </h5>
                <small className="text-muted">
                  Comprehensive testing suite for workflow, security, performance, and integration
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={runCompleteTestSuite}
                  disabled={isRunning}
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <IconifyIcon icon="bx:loader-alt" className="me-2 bx-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="bx:play" className="me-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
              </div>
            </Card.Header>

            {isRunning && (
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Test Progress</span>
                  <span className="small text-muted">{testProgress}%</span>
                </div>
                <ProgressBar 
                  now={testProgress} 
                  variant="primary" 
                  striped 
                  animated={isRunning}
                />
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {/* Overview Stats */}
      {allResults.length > 0 && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary mb-1">{overallStats.total}</h3>
                <p className="text-muted mb-0">Total Tests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success mb-1">{overallStats.passed}</h3>
                <p className="text-muted mb-0">Passed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger mb-1">{overallStats.failed}</h3>
                <p className="text-muted mb-0">Failed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className={`mb-1 ${overallStats.successRate >= 90 ? 'text-success' : overallStats.successRate >= 70 ? 'text-warning' : 'text-danger'}`}>
                  {overallStats.successRate}%
                </h3>
                <p className="text-muted mb-0">Success Rate</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Test Results Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs
                id="test-results-tabs"
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="overview" title="Overview">
                  {allResults.length > 0 ? (
                    <Alert variant={overallStats.successRate === 100 ? "success" : "warning"}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <IconifyIcon icon="bx:info-circle" className="me-2" />
                          Overall Test Results: {overallStats.passed}/{overallStats.total} passed
                        </span>
                        <Badge bg={overallStats.successRate === 100 ? "success" : "warning"}>
                          {overallStats.successRate}% Success Rate
                        </Badge>
                      </div>
                    </Alert>
                  ) : (
                    <div className="text-center py-4">
                      <IconifyIcon icon="bx:test-tube" className="display-6 text-muted mb-3" />
                      <p className="text-muted">No test results available. Run tests to see results.</p>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="workflow" title={`Workflow (${results.workflow.length})`}>
                  <TestSuitePanel 
                    title="Workflow Tests"
                    description="End-to-end workflow from application creation to decision"
                    results={results.workflow}
                    onRunTests={() => runIndividualTestSuite('workflow')}
                    isRunning={isRunning}
                    getResultIcon={getResultIcon}
                    getResultVariant={getResultVariant}
                  />
                </Tab>

                <Tab eventKey="security" title={`Security (${results.security.length})`}>
                  <TestSuitePanel 
                    title="Security Tests"
                    description="RLS policies, role-based access, and security functions"
                    results={results.security}
                    onRunTests={() => runIndividualTestSuite('security')}
                    isRunning={isRunning}
                    getResultIcon={getResultIcon}
                    getResultVariant={getResultVariant}
                  />
                </Tab>

                <Tab eventKey="performance" title={`Performance (${results.performance.length})`}>
                  <TestSuitePanel 
                    title="Performance Tests"
                    description="Query performance, concurrent requests, and response times"
                    results={results.performance}
                    onRunTests={() => runIndividualTestSuite('performance')}
                    isRunning={isRunning}
                    getResultIcon={getResultIcon}
                    getResultVariant={getResultVariant}
                  />
                </Tab>

                <Tab eventKey="integration" title={`Integration (${results.integration.length})`}>
                  <TestSuitePanel 
                    title="Integration Tests"
                    description="Edge functions, storage buckets, and system integrations"
                    results={results.integration}
                    onRunTests={() => runIndividualTestSuite('integration')}
                    isRunning={isRunning}
                    getResultIcon={getResultIcon}
                    getResultVariant={getResultVariant}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

interface TestSuitePanelProps {
  title: string;
  description: string;
  results: WorkflowTestResult[];
  onRunTests: () => void;
  isRunning: boolean;
  getResultIcon: (success: boolean) => JSX.Element;
  getResultVariant: (success: boolean) => string;
}

const TestSuitePanel: React.FC<TestSuitePanelProps> = ({
  title,
  description,
  results,
  onRunTests,
  isRunning,
  getResultIcon,
  getResultVariant
}) => {
  const stats = results.length > 0 ? {
    total: results.length,
    passed: results.filter(r => r.success).length,
    avgDuration: Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length)
  } : null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-1">{title}</h6>
          <small className="text-muted">{description}</small>
        </div>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={onRunTests}
          disabled={isRunning}
        >
          <IconifyIcon icon="bx:play" className="me-1" />
          Run {title}
        </Button>
      </div>

      {stats && (
        <Alert variant={stats.passed === stats.total ? "success" : "warning"} className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              Results: {stats.passed}/{stats.total} passed
            </span>
            <div className="d-flex gap-3">
              <small>Avg Duration: {stats.avgDuration}ms</small>
              <Badge bg={stats.passed === stats.total ? "success" : "warning"}>
                {Math.round((stats.passed / stats.total) * 100)}%
              </Badge>
            </div>
          </div>
        </Alert>
      )}

      {results.length > 0 ? (
        <ListGroup variant="flush">
          {results.map((result, index) => (
            <ListGroup.Item 
              key={index}
              className={`d-flex justify-content-between align-items-start border-start border-4 border-${getResultVariant(result.success)}`}
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center">
                  {getResultIcon(result.success)}
                  <strong className="ms-2">{result.step}</strong>
                  {result.duration && (
                    <Badge bg="secondary" className="ms-2">
                      {result.duration}ms
                    </Badge>
                  )}
                </div>
                
                {result.error && (
                  <div className="mt-2">
                    <Alert variant="danger" className="py-2 mb-0">
                      <small>{result.error}</small>
                    </Alert>
                  </div>
                )}
                
                {result.data && (
                  <div className="mt-2">
                    <details className="small text-muted">
                      <summary>Test Data</summary>
                      <pre className="mt-2 p-2 bg-light rounded">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              
              <Badge bg={getResultVariant(result.success)}>
                {result.success ? 'PASS' : 'FAIL'}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <div className="text-center py-4">
          <IconifyIcon icon="bx:test-tube" className="display-6 text-muted mb-3" />
          <p className="text-muted">No test results available. Click "Run {title}" to start testing.</p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTestDashboard;