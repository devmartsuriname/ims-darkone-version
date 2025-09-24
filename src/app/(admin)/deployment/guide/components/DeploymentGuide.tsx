import React from 'react';
import { Container, Row, Col, Card, Alert, Button, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const DeploymentGuide: React.FC = () => {
  const deploymentSteps = [
    {
      title: 'Supabase Production Setup',
      description: 'Configure production Supabase project and settings',
      status: 'pending',
      tasks: [
        'Create production Supabase project',
        'Configure authentication URLs',
        'Deploy database schema',
        'Set up edge functions',
        'Configure storage buckets'
      ]
    },
    {
      title: 'Security Configuration',
      description: 'Implement production security measures',
      status: 'pending',
      tasks: [
        'Validate RLS policies',
        'Configure rate limiting',
        'Set up monitoring',
        'Review access controls',
        'Enable audit logging'
      ]
    },
    {
      title: 'Performance Optimization',
      description: 'Optimize system for production workloads',
      status: 'pending',
      tasks: [
        'Database indexing',
        'Query optimization',
        'Caching implementation',
        'Asset optimization',
        'CDN configuration'
      ]
    },
    {
      title: 'Application Deployment',
      description: 'Deploy application to production environment',
      status: 'pending',
      tasks: [
        'Build production bundle',
        'Configure environment variables',
        'Deploy to hosting platform',
        'Set up custom domain',
        'Configure SSL certificates'
      ]
    },
    {
      title: 'Testing & Validation',
      description: 'Comprehensive production testing',
      status: 'pending',
      tasks: [
        'Functional testing',
        'Security validation',
        'Performance testing',
        'User acceptance testing',
        'Integration verification'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <IconifyIcon icon="bx:check-circle" className="text-success" />;
      case 'in-progress':
        return <IconifyIcon icon="bx:loader-alt" className="text-warning bx-spin" />;
      case 'pending':
        return <IconifyIcon icon="bx:time" className="text-muted" />;
      default:
        return <IconifyIcon icon="bx:help-circle" className="text-muted" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <IconifyIcon icon="bx:rocket" className="me-2" />
                Production Deployment Guide
              </h5>
              <small className="text-muted">
                Step-by-step guide for deploying IMS to production
              </small>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <Alert.Heading>
                  <IconifyIcon icon="bx:info-circle" className="me-2" />
                  Deployment Overview
                </Alert.Heading>
                <p className="mb-2">
                  This guide will walk you through deploying the Internal Management System (IMS) 
                  to a production environment with proper security, performance, and monitoring configurations.
                </p>
                <ul className="mb-0">
                  <li>Estimated deployment time: 2-4 hours</li>
                  <li>Requires: Supabase Pro account, hosting platform</li>
                  <li>Prerequisites: All integration tests passing</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          {deploymentSteps.map((step, index) => (
            <Card key={index} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Badge bg="primary" className="me-3">
                    {index + 1}
                  </Badge>
                  <div>
                    <h6 className="mb-0">{step.title}</h6>
                    <small className="text-muted">{step.description}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {getStatusIcon(step.status)}
                  <Badge bg={getStatusVariant(step.status)}>
                    {step.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h6 className="text-muted mb-2">Tasks:</h6>
                    <ul className="mb-0">
                      {step.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="mb-1">
                          <IconifyIcon icon="bx:chevron-right" className="me-1 text-muted" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </Col>
                  <Col md={4} className="d-flex align-items-center justify-content-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      disabled={step.status !== 'pending'}
                    >
                      {step.status === 'completed' ? 'Completed' : 
                       step.status === 'in-progress' ? 'In Progress' : 'Start Step'}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <IconifyIcon icon="bx:book" className="me-2" />
                Additional Resources
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Documentation</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <IconifyIcon icon="bx:file-blank" className="me-2 text-muted" />
                      <a href="/docs/ProductionDeployment.md" target="_blank" rel="noopener noreferrer">
                        Complete Deployment Guide
                      </a>
                    </li>
                    <li className="mb-2">
                      <IconifyIcon icon="bx:shield-check" className="me-2 text-muted" />
                      <a href="/docs/Security.md" target="_blank" rel="noopener noreferrer">
                        Security Configuration Guide
                      </a>
                    </li>
                    <li className="mb-2">
                      <IconifyIcon icon="bx:test-tube" className="me-2 text-muted" />
                      <a href="/docs/IntegrationTesting.md" target="_blank" rel="noopener noreferrer">
                        Integration Testing Guide
                      </a>
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Support</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <IconifyIcon icon="bx:support" className="me-2 text-muted" />
                      Technical Support: support@ims.gov.sr
                    </li>
                    <li className="mb-2">
                      <IconifyIcon icon="bx:phone" className="me-2 text-muted" />
                      Emergency Contact: +597-xxx-xxxx
                    </li>
                    <li className="mb-2">
                      <IconifyIcon icon="bx:world" className="me-2 text-muted" />
                      System Status: status.ims.gov.sr
                    </li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DeploymentGuide;