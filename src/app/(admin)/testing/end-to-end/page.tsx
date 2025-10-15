import React from 'react'
import { Card, Row, Col, Button, Alert, Badge, Container } from 'react-bootstrap'
import { IMSIntegrationTester, WorkflowTestResult } from '@/utils/integration-test'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import PageTitle from '@/components/PageTitle'

const EndToEndTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = React.useState(false)
  const [results, setResults] = React.useState<WorkflowTestResult[]>([])

  const runEndToEndTest = async () => {
    setIsRunning(true)
    setResults([])

    try {
      const workflowResults = await IMSIntegrationTester.testCompleteWorkflow()
      setResults(workflowResults)
    } catch (error) {
      setResults([{
        success: false,
        step: 'End-to-End Test',
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'workflow'
      }])
    } finally {
      setIsRunning(false)
    }
  }

  const getTestIcon = (success: boolean) => {
    return success ? 
      <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-5" /> :
      <IconifyIcon icon="solar:close-circle-bold" className="text-danger fs-5" />
  }

  const getTestVariant = (success: boolean) => {
    return success ? 'success' : 'danger'
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  const successRate = results.length > 0 ? Math.round((successCount / results.length) * 100) : 0

  return (
    <Container fluid>
      <PageTitle 
        title="End-to-End Workflow Validation" 
        subName="Complete Application Lifecycle Testing"
      />

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <IconifyIcon icon="solar:rocket-outline" className="me-2" />
                  Complete Workflow Test
                </h5>
                <small className="text-muted">
                  Tests the entire application lifecycle: Draft → Intake → Control → Reviews → Director → Minister → Closure
                </small>
              </div>
              <Button 
                variant="primary" 
                onClick={runEndToEndTest}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <IconifyIcon icon="solar:restart-bold" className="me-2 spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="solar:play-bold" className="me-2" />
                    Run End-to-End Test
                  </>
                )}
              </Button>
            </Card.Header>

            {results.length > 0 && (
              <Card.Body>
                <Alert variant={successRate === 100 ? "success" : successRate >= 70 ? "warning" : "danger"}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <IconifyIcon icon="solar:chart-square-bold" className="me-2" />
                      Test Results: {successCount}/{results.length} passed
                    </span>
                    <Badge bg={successRate === 100 ? "success" : successRate >= 70 ? "warning" : "danger"}>
                      {successRate}% Success Rate
                    </Badge>
                  </div>
                </Alert>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {results.length > 0 && (
        <Row>
          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-primary mb-1">{results.length}</h3>
                <p className="text-muted mb-0">Total Tests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-success mb-1">{successCount}</h3>
                <p className="text-muted mb-0">Passed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-danger mb-1">{failureCount}</h3>
                <p className="text-muted mb-0">Failed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className={`mb-1 ${successRate >= 90 ? 'text-success' : successRate >= 70 ? 'text-warning' : 'text-danger'}`}>
                  {successRate}%
                </h3>
                <p className="text-muted mb-0">Success Rate</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {results.length > 0 && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Test Results Detail</h6>
              </Card.Header>
              <Card.Body>
                <div className="test-results">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`d-flex align-items-start p-3 border-start border-4 border-${getTestVariant(result.success)} mb-3 bg-light rounded`}
                    >
                      <div className="me-3">
                        {getTestIcon(result.success)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{result.step}</h6>
                            <Badge bg="secondary" className="me-2">
                              {result.category?.toUpperCase() || 'WORKFLOW'}
                            </Badge>
                            {result.duration && (
                              <Badge bg="info">
                                {result.duration}ms
                              </Badge>
                            )}
                          </div>
                          <Badge bg={getTestVariant(result.success)}>
                            {result.success ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        
                        {result.error && (
                          <Alert variant="danger" className="mt-2 py-2 mb-0">
                            <small>{result.error}</small>
                          </Alert>
                        )}
                        
                        {result.data && (
                          <div className="mt-2">
                            <details className="small text-muted">
                              <summary className="cursor-pointer">View Test Data</summary>
                              <pre className="mt-2 p-2 bg-white border rounded small">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {!isRunning && results.length === 0 && (
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <IconifyIcon icon="solar:test-tube-outline" className="display-1 text-muted mb-3" />
                <h5 className="text-muted">End-to-End Test Ready</h5>
                <p className="text-muted mb-4">
                  Click "Run End-to-End Test" to validate the complete application workflow.
                  This test will create a sample application and process it through all workflow states.
                </p>
                <Alert variant="info">
                  <h6>Test Coverage Includes:</h6>
                  <ul className="text-start mt-2 mb-0">
                    <li>Application Creation & Data Persistence</li>
                    <li>Document Upload & Management</li>
                    <li>Workflow State Transitions</li>
                    <li>Control Department Assignment & Visits</li>
                    <li>Technical & Social Reviews</li>
                    <li>Director & Minister Decision Process</li>
                    <li>Notification System Integration</li>
                    <li>Audit Logging & SLA Monitoring</li>
                    <li>Data Integrity & Cleanup</li>
                  </ul>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default EndToEndTestPage