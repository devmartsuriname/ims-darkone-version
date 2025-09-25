import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import WorkflowTestRunner from '@/components/testing/WorkflowTestRunner';
import WorkflowSummaryDashboard from '@/components/testing/WorkflowSummaryDashboard';

const WorkflowValidationPage: React.FC = () => {
  return (
    <>
      <PageTitle
        title="Workflow Validation Testing"
        subName="End-to-End testing for the complete IMS workflow system"
      />

      <Container fluid>
        <Row>
          <Col lg={12}>
            <Alert variant="info" className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <i className="bi bi-info-circle fs-18"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <strong>Phase 3: End-to-End Workflow Testing</strong>
                  <p className="mb-2">
                    This comprehensive testing suite validates all critical system components:
                  </p>
                  <ul className="mb-0">
                    <li><strong>Edge Functions:</strong> All backend services operational</li>
                    <li><strong>Database Integrity:</strong> RLS policies, constraints, and data consistency</li>
                    <li><strong>Complete Workflow:</strong> Full application lifecycle from DRAFT to CLOSURE</li>
                    <li><strong>Notifications:</strong> Real-time alerts and email system</li>
                    <li><strong>Security:</strong> Authentication, authorization, and data protection</li>
                  </ul>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <WorkflowSummaryDashboard />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12}>
            <WorkflowTestRunner />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Testing Guidelines</h6>
              </Card.Header>
              <Card.Body>
                <div className="testing-guidelines">
                  <h6>Before Running Tests:</h6>
                  <ul>
                    <li>Ensure initial admin setup is complete</li>
                    <li>Verify database connection is stable</li>
                    <li>Check that all required secrets are configured</li>
                  </ul>
                  
                  <h6>Test Data Creation:</h6>
                  <ul>
                    <li>Creates sample applicants and applications</li>
                    <li>Sets up users with different roles (admin, staff, control, etc.)</li>
                    <li>Generates test documents and control photos</li>
                    <li>Establishes realistic workflow scenarios</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Expected Results</h6>
              </Card.Header>
              <Card.Body>
                <div className="expected-results">
                  <h6>Success Criteria:</h6>
                  <ul>
                    <li><strong>All Edge Functions:</strong> Respond without errors</li>
                    <li><strong>Database Operations:</strong> All CRUD operations work correctly</li>
                    <li><strong>Workflow Transitions:</strong> State changes follow business rules</li>
                    <li><strong>Notifications:</strong> Triggered at appropriate workflow stages</li>
                    <li><strong>Security:</strong> RLS policies prevent unauthorized access</li>
                  </ul>
                  
                  <h6>Performance Targets:</h6>
                  <ul>
                    <li>API responses under 2 seconds</li>
                    <li>Database queries optimized</li>
                    <li>Real-time notifications delivered promptly</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WorkflowValidationPage;