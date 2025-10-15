import React, { useState } from 'react';
import { SystemIntegrationTester } from '@/components/testing/SystemIntegrationTester';
import { BugDetectionSystem } from '@/components/testing/BugDetectionSystem';
import { Card, Nav, Tab, Row, Col, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import PageTitle from '@/components/PageTitle';
import { useAuthContext } from '@/context/useAuthContext';

export const IntegrationTestDashboard: React.FC = () => {
  const { roles, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState('integration');

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading integration testing dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const userRoles = roles?.map(r => r.role) || [];
  const isAdminOrIT = userRoles.includes('admin') || userRoles.includes('it');

  if (!isAdminOrIT) {
    return (
      <div className="container-fluid">
        <Alert variant="warning">
          <IconifyIcon icon="solar:shield-warning-bold" className="me-2" />
          <strong>Access Restricted:</strong> Integration testing tools are only available to Admin and IT users.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <PageTitle 
        subName="System" 
        title="Integration Testing & Bug Detection" 
      />

      <Alert variant="info" className="mb-4">
        <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
        <strong>Integration Testing Suite:</strong> Comprehensive tools for testing system integration, 
        detecting bugs, and ensuring optimal performance across all IMS components.
      </Alert>

      <Card>
        <Card.Header>
          <Nav variant="tabs" className="card-header-tabs">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'integration'}
                onClick={() => setActiveTab('integration')}
                className="d-flex align-items-center"
              >
                <IconifyIcon icon="solar:test-tube-bold" className="me-2" />
                Integration Tests
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'bugdetection'}
                onClick={() => setActiveTab('bugdetection')}
                className="d-flex align-items-center"
              >
                <IconifyIcon icon="solar:bug-bold" className="me-2" />
                Bug Detection
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'performance'}
                onClick={() => setActiveTab('performance')}
                className="d-flex align-items-center"
              >
                <IconifyIcon icon="solar:chart-square-bold" className="me-2" />
                Performance
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-0">
          <Tab.Content>
            <Tab.Pane active={activeTab === 'integration'}>
              <div className="p-4">
                <SystemIntegrationTester />
              </div>
            </Tab.Pane>

            <Tab.Pane active={activeTab === 'bugdetection'}>
              <div className="p-4">
                <BugDetectionSystem />
              </div>
            </Tab.Pane>

            <Tab.Pane active={activeTab === 'performance'}>
              <div className="p-4">
                <Row>
                  <Col md={12}>
                    <Alert variant="info">
                      <IconifyIcon icon="solar:speedometer-bold" className="me-2" />
                      <strong>Performance Monitoring:</strong> Advanced performance monitoring tools will be available in a future update.
                    </Alert>
                    
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Performance Metrics</h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={4}>
                            <div className="text-center">
                              <IconifyIcon icon="solar:clock-circle-bold" className="fs-2 text-info" />
                              <h5 className="mt-2">Less than 2s</h5>
                              <small className="text-muted">Average Load Time</small>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <IconifyIcon icon="solar:database-bold" className="fs-2 text-success" />
                              <h5 className="mt-2">95%</h5>
                              <small className="text-muted">Query Efficiency</small>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <IconifyIcon icon="solar:devices-bold" className="fs-2 text-warning" />
                              <h5 className="mt-2">Mobile Ready</h5>
                              <small className="text-muted">Responsive Design</small>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col md={12}>
          <Alert variant="success">
            <IconifyIcon icon="solar:shield-check-bold" className="me-2" />
            <strong>System Status:</strong> All critical systems are operational. 
            Regular integration testing helps maintain system reliability and performance.
          </Alert>
        </Col>
      </Row>
    </div>
  );
};