import React, { useState } from 'react';
import { Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { IMSIntegrationTester, WorkflowTestResult } from '@/utils/integration-test';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const IntegrationTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<WorkflowTestResult[]>([]);
  const [testProgress, setTestProgress] = useState(0);

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setResults([]);
    setTestProgress(0);

    try {
      // Run complete workflow test
      setTestProgress(25);
      const workflowResults = await IMSIntegrationTester.testCompleteWorkflow();
      setResults(prev => [...prev, ...workflowResults]);

      // Test role-based access
      setTestProgress(75);
      const accessResults = await IMSIntegrationTester.testRoleBasedAccess();
      setResults(prev => [...prev, ...accessResults]);

      setTestProgress(100);

      // Cleanup test data if application was created
      const creationResult = workflowResults.find(r => r.step === 'Application Creation');
      if (creationResult?.success && creationResult.data) {
        await IMSIntegrationTester.cleanupTestData(
          creationResult.data.applicationId,
          creationResult.data.applicantId
        );
      }

    } catch (error) {
      setResults(prev => [...prev, {
        success: false,
        step: 'Integration Test Suite',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
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

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            <IconifyIcon icon="bx:test-tube" className="me-2" />
            IMS Integration Tests
          </h5>
          <small className="text-muted">
            Test end-to-end workflow and system integration
          </small>
        </div>
        <Button 
          variant="primary" 
          onClick={runIntegrationTests}
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
              Run Tests
            </>
          )}
        </Button>
      </Card.Header>

      <Card.Body>
        {isRunning && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Test Progress</span>
              <span className="small text-muted">{testProgress}%</span>
            </div>
            <div className="progress">
              <div 
                className={`progress-bar ${isRunning ? 'progress-bar-striped progress-bar-animated' : ''}`}
                style={{ width: `${testProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <Alert variant={successCount === totalCount ? "success" : "warning"} className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <IconifyIcon icon="bx:info-circle" className="me-2" />
                  Test Results: {successCount}/{totalCount} passed
                </span>
                <Badge bg={successCount === totalCount ? "success" : "warning"}>
                  {Math.round((successCount / totalCount) * 100)}% Success Rate
                </Badge>
              </div>
            </Alert>

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
                        <small className="text-muted">
                          Data: {JSON.stringify(result.data, null, 2)}
                        </small>
                      </div>
                    )}
                  </div>
                  
                  <Badge bg={getResultVariant(result.success)}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}

        {!isRunning && results.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="bx:test-tube" className="display-6 text-muted mb-3" />
            <p className="text-muted">Click "Run Tests" to start integration testing</p>
            <p className="small text-muted">
              This will test:
              <br />• Application creation and workflow transitions
              <br />• Document upload and verification
              <br />• Control department processes
              <br />• Review and decision workflows
              <br />• Role-based access controls
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default IntegrationTestRunner;