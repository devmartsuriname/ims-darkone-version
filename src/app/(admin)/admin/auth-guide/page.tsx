import React from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import ComponentContainerCard from '@/components/ComponentContainerCard'

const AuthenticationGuidePage: React.FC = () => {
  return (
    <Container fluid>
      <PageTitle 
        title="Authentication Setup Guide" 
        subName="Production Authentication Configuration"
      />

      <Row className="mb-4">
        <Col>
          <Alert variant="info" className="mb-0">
            <h5 className="alert-heading">
              <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
              Authentication System Status
            </h5>
            <p>
              The IMS authentication system is built on Supabase Auth with comprehensive role-based access control (RBAC).
              This guide helps you configure and validate the authentication system for production use.
            </p>
            <hr />
            <p className="mb-0">
              <Link to="/admin/auth-setup" className="btn btn-primary">
                <IconifyIcon icon="solar:settings-bold" className="me-2" />
                Go to Authentication Setup
              </Link>
            </p>
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <ComponentContainerCard id="setup-checklist" title="Setup Checklist">
            <div className="checklist">
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-5 me-3" />
                <div>
                  <h6 className="mb-1">Authentication System</h6>
                  <small className="text-muted">Supabase Auth integration configured</small>
                </div>
              </div>
              
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-5 me-3" />
                <div>
                  <h6 className="mb-1">User Profiles</h6>
                  <small className="text-muted">Profile management system enabled</small>
                </div>
              </div>
              
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-5 me-3" />
                <div>
                  <h6 className="mb-1">Role-Based Access Control</h6>
                  <small className="text-muted">RBAC system with 7 defined roles</small>
                </div>
              </div>
              
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-5 me-3" />
                <div>
                  <h6 className="mb-1">Row-Level Security</h6>
                  <small className="text-muted">RLS policies protecting all data tables</small>
                </div>
              </div>
              
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:clock-circle-bold" className="text-warning fs-5 me-3" />
                <div>
                  <h6 className="mb-1">Initial Admin Setup</h6>
                  <small className="text-muted">Create first administrator account</small>
                </div>
              </div>
              
              <div className="checklist-item d-flex align-items-center mb-3">
                <IconifyIcon icon="solar:clock-circle-bold" className="text-warning fs-5 me-3" />
                <div>
                  <h6 className="mb-1">URL Configuration</h6>
                  <small className="text-muted">Set Site URL and Redirect URLs in Supabase</small>
                </div>
              </div>
            </div>
          </ComponentContainerCard>
        </Col>
        
        <Col md={6}>
          <ComponentContainerCard id="user-roles" title="User Roles & Permissions">
            <div className="roles-list">
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:crown-bold" className="text-danger fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-danger">Admin</h6>
                    <small className="text-muted">Full system access, user management, system configuration</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:settings-bold" className="text-primary fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-primary">IT</h6>
                    <small className="text-muted">Technical administration, system maintenance</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:user-check-bold" className="text-success fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-success">Staff</h6>
                    <small className="text-muted">Application processing, document management</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:eye-bold" className="text-info fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-info">Control</h6>
                    <small className="text-muted">Site inspections, photo uploads, technical assessments</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:star-bold" className="text-warning fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-warning">Director</h6>
                    <small className="text-muted">Application reviews, recommendations</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:medal-star-bold" className="text-dark fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-dark">Minister</h6>
                    <small className="text-muted">Final approvals, budget decisions</small>
                  </div>
                </div>
              </div>
              
              <div className="role-item mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:user-speak-bold" className="text-secondary fs-5 me-3" />
                  <div>
                    <h6 className="mb-1 text-secondary">Front Office</h6>
                    <small className="text-muted">Customer service, application intake</small>
                  </div>
                </div>
              </div>
            </div>
          </ComponentContainerCard>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <ComponentContainerCard id="production-configuration" title="Production Configuration Steps">
            <Alert variant="warning">
              <h6 className="alert-heading">
                <IconifyIcon icon="solar:danger-triangle-bold" className="me-2" />
                Important: Supabase URL Configuration
              </h6>
              <p>
                Before users can sign in, you must configure the Site URL and Redirect URLs in your Supabase project:
              </p>
              <ol className="mb-0">
                <li>Go to your Supabase Dashboard → Authentication → URL Configuration</li>
                <li>Set <strong>Site URL</strong> to your application's URL (e.g., your deployed domain)</li>
                <li>Add <strong>Redirect URLs</strong> for all environments (preview URL, custom domain)</li>
                <li>Save the configuration</li>
              </ol>
            </Alert>

            <div className="configuration-steps">
              <div className="step-item d-flex mb-4">
                <div className="step-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  1
                </div>
                <div>
                  <h6>Create Initial Administrator</h6>
                  <p className="text-muted mb-0">
                    Use the Authentication Setup page to create your first admin user. This user will have full system access.
                  </p>
                </div>
              </div>
              
              <div className="step-item d-flex mb-4">
                <div className="step-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  2
                </div>
                <div>
                  <h6>Configure Supabase URLs</h6>
                  <p className="text-muted mb-0">
                    Set up Site URL and Redirect URLs in your Supabase project to prevent authentication errors.
                  </p>
                </div>
              </div>
              
              <div className="step-item d-flex mb-4">
                <div className="step-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  3
                </div>
                <div>
                  <h6>Test Authentication Flow</h6>
                  <p className="text-muted mb-0">
                    Run authentication tests to validate sign-in, sign-up, role assignment, and permission functions.
                  </p>
                </div>
              </div>
              
              <div className="step-item d-flex mb-4">
                <div className="step-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  4
                </div>
                <div>
                  <h6>Create Additional Users</h6>
                  <p className="text-muted mb-0">
                    Use the User Management interface to create accounts for your team members with appropriate roles.
                  </p>
                </div>
              </div>
              
              <div className="step-item d-flex">
                <div className="step-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  5
                </div>
                <div>
                  <h6>Verify Security Policies</h6>
                  <p className="text-muted mb-0">
                    Ensure all RLS policies are working correctly and users can only access data appropriate to their roles.
                  </p>
                </div>
              </div>
            </div>
          </ComponentContainerCard>
        </Col>
      </Row>
    </Container>
  )
}

export default AuthenticationGuidePage