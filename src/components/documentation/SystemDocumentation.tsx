import React, { useState } from 'react';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface DocumentationSection {
  id: string;
  title: string;
  category: 'user_guide' | 'technical' | 'api' | 'deployment' | 'security';
  icon: string;
  content: string;
  subsections?: DocumentationSubsection[];
}

interface DocumentationSubsection {
  id: string;
  title: string;
  content: string;
}

export const SystemDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const documentationSections: DocumentationSection[] = [
    {
      id: 'overview',
      title: 'System Overview',
      category: 'user_guide',
      icon: 'solar:home-bold',
      content: `
# Internal Management System - Public Housing (Suriname)

## Purpose
This system streamlines the end-to-end application workflow for housing services, specifically starting with the Subsidy/Bouwsubsidie program. It reduces manual handling, enforces control/verification before approvals, and provides complete traceability across departments.

## Key Features
- **Centralized Application Management**: Single portal for all housing subsidy applications
- **Workflow Automation**: Automated state transitions and task assignments
- **Document Management**: Secure upload, verification, and storage of required documents
- **Control Department Integration**: Scheduled visits with photo capture and technical assessments
- **Multi-level Approval Process**: From Front Office → Control → Director → Minister
- **Audit Trail**: Complete history of all actions and decisions
- **Role-based Access Control**: Granular permissions based on user roles

## System Architecture
- **Frontend**: React + TypeScript with Darkone Admin Template
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with Row Level Security
- **Storage**: Supabase Storage with signed URLs
- **Monitoring**: Real-time performance and security monitoring
      `,
      subsections: [
        {
          id: 'benefits',
          title: 'System Benefits',
          content: `
- **50% Reduction** in application processing time
- **95% Accuracy** in document verification
- **Complete Transparency** with real-time status tracking
- **Regulatory Compliance** with full audit capabilities
- **Data Security** with encrypted storage and access controls
          `
        }
      ]
    },
    {
      id: 'user_roles',
      title: 'User Roles & Permissions',
      category: 'user_guide',
      icon: 'solar:users-group-rounded-bold',
      content: `
# User Roles & Access Control

## Role Hierarchy

### 1. Admin
- **Full System Access**: Complete control over all system functions
- **User Management**: Create, modify, and deactivate user accounts
- **System Configuration**: Modify system settings and reference data
- **Security Oversight**: Access to security logs and audit trails

### 2. IT Staff
- **Technical Management**: System maintenance and technical support
- **User Support**: Assist users with technical issues
- **Data Management**: Database maintenance and backup operations
- **Integration Support**: API and external system integration

### 3. Front Office Staff
- **Application Intake**: Create and manage new applications
- **Document Collection**: Upload and organize required documents
- **Applicant Communication**: Primary contact for applicants
- **Status Updates**: Update application status and progress

### 4. Control Department
- **Visit Scheduling**: Schedule and manage control visits
- **Photo Documentation**: Capture and upload verification photos
- **Technical Assessment**: Complete technical evaluation forms
- **Site Inspection**: Conduct on-site property assessments

### 5. Staff (Technical/Social)
- **Report Generation**: Create technical and social assessment reports
- **Data Analysis**: Analyze application data and assessments
- **Recommendation Preparation**: Prepare recommendations for director review

### 6. Director (DVH)
- **Application Review**: Review completed assessments and reports
- **Decision Authority**: Make approval/rejection recommendations
- **Policy Oversight**: Ensure compliance with housing policies
- **Quality Control**: Monitor application processing quality

### 7. Minister
- **Final Authority**: Ultimate approval/rejection authority
- **Policy Direction**: Set strategic direction for housing programs
- **Budget Approval**: Authorize funding for approved applications
- **Performance Oversight**: Monitor system performance and outcomes
      `,
      subsections: [
        {
          id: 'permissions_matrix',
          title: 'Permissions Matrix',
          content: `
| Function | Admin | IT | Front Office | Control | Staff | Director | Minister |
|----------|-------|----|-----------| --------|-------|----------|----------|
| Create Applications | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Schedule Visits | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Upload Photos | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Generate Reports | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Director Review | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Final Decision | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| User Management | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
          `
        }
      ]
    },
    {
      id: 'workflows',
      title: 'Application Workflows',
      category: 'user_guide',
      icon: 'solar:routing-bold',
      content: `
# Application Workflow States

## State Machine Overview
The system uses a state machine to ensure proper workflow progression and prevent unauthorized state changes.

## Workflow States

### 1. DRAFT
- **Description**: Initial application creation
- **Allowed Users**: Front Office Staff
- **Next States**: INTAKE_REVIEW
- **Requirements**: Basic applicant information

### 2. INTAKE_REVIEW
- **Description**: Front office review and validation
- **Allowed Users**: Front Office Staff, Admin
- **Next States**: CONTROL_ASSIGN, REJECTED
- **Requirements**: Complete application data, all documents uploaded

### 3. CONTROL_ASSIGN
- **Description**: Assignment to control department
- **Allowed Users**: Admin, Control Department
- **Next States**: CONTROL_VISIT_SCHEDULED
- **Requirements**: Control officer assignment

### 4. CONTROL_VISIT_SCHEDULED
- **Description**: Visit scheduled with applicant
- **Allowed Users**: Control Department
- **Next States**: CONTROL_IN_PROGRESS
- **Requirements**: Visit date and time confirmed

### 5. CONTROL_IN_PROGRESS
- **Description**: Control visit in progress
- **Allowed Users**: Control Department
- **Next States**: TECHNICAL_REVIEW, SOCIAL_REVIEW
- **Requirements**: Minimum photo count, initial assessments

### 6. TECHNICAL_REVIEW
- **Description**: Technical assessment phase
- **Allowed Users**: Technical Staff, Control Department
- **Next States**: SOCIAL_REVIEW, DIRECTOR_REVIEW
- **Requirements**: Technical report completed

### 7. SOCIAL_REVIEW
- **Description**: Social assessment phase
- **Allowed Users**: Staff
- **Next States**: DIRECTOR_REVIEW
- **Requirements**: Social report completed

### 8. DIRECTOR_REVIEW
- **Description**: Director evaluation
- **Allowed Users**: Director
- **Next States**: MINISTER_DECISION, REJECTED
- **Requirements**: All reports completed, recommendation prepared

### 9. MINISTER_DECISION
- **Description**: Final ministerial decision
- **Allowed Users**: Minister
- **Next States**: CLOSURE, REJECTED
- **Requirements**: Final decision documentation

### 10. CLOSURE
- **Description**: Application completed successfully
- **Final State**: Yes
- **Requirements**: All approvals completed

### 11. REJECTED
- **Description**: Application denied
- **Final State**: Yes
- **Requirements**: Rejection reason documented

### 12. ON_HOLD
- **Description**: Temporary suspension
- **Allowed Users**: Director, Minister
- **Next States**: Previous state
- **Requirements**: Hold reason specified
      `
    },
    {
      id: 'documents',
      title: 'Required Documents',
      category: 'user_guide',
      icon: 'solar:documents-bold',
      content: `
# Required Documents Checklist

## 12 Mandatory Documents

### 1. Nationale verklaring + uittreksel
- **Description**: National declaration and extract
- **Purpose**: Verify applicant's national status
- **Format**: PDF or scanned image
- **Validity**: Must be recent (within 6 months)

### 2. Gezinsuittreksel
- **Description**: Family extract
- **Purpose**: Verify household composition
- **Format**: Official document from Civil Registry

### 3. ID kopieën (all household members)
- **Description**: Identity card copies
- **Purpose**: Verify identity of all household members
- **Format**: Clear, legible copies
- **Requirement**: All family members listed in application

### 4. Perceelkaart (plot map)
- **Description**: Land plot map
- **Purpose**: Verify property boundaries and location
- **Format**: Official surveyor's map
- **Source**: Land Registry Office

### 5. Eigendom/koopakte/beschikking
- **Description**: Ownership documents
- **Purpose**: Prove legal ownership or right to build
- **Format**: Official legal documents
- **Types**: Deed, purchase agreement, government allocation

### 6. Toestemmingsbrief eigenaar/SVS
- **Description**: Owner/SVS permission letter
- **Purpose**: Permission from landowner if not applicant
- **Format**: Notarized letter
- **Requirement**: Only if applicant is not the landowner

### 7. AOV verklaring
- **Description**: Old-age pension declaration
- **Purpose**: Verify pension income
- **Format**: Official statement from pension fund
- **Applicability**: For applicants receiving pension

### 8. Pensioenverklaring
- **Description**: Pension statement
- **Purpose**: Document all pension income sources
- **Format**: Official pension fund statements
- **Period**: Latest 3 months

### 9. Hypotheek uittreksel
- **Description**: Mortgage statement
- **Purpose**: Verify existing mortgage obligations
- **Format**: Bank statement
- **Requirement**: If property has existing mortgage

### 10. Recente loonstrook
- **Description**: Recent pay slip
- **Purpose**: Verify current employment income
- **Format**: Official employer payslip
- **Period**: Latest 3 months

### 11. Werkgeversverklaring
- **Description**: Employer declaration
- **Purpose**: Confirm employment status and income
- **Format**: Official letter on company letterhead
- **Content**: Employment period, position, salary

### 12. Dorpsverklaring / DC-verklaring
- **Description**: Village/District Commissioner declaration
- **Purpose**: Community verification and support
- **Format**: Official letter from local authority
- **Content**: Confirmation of need and community standing
      `,
      subsections: [
        {
          id: 'document_verification',
          title: 'Document Verification Process',
          content: `
## Verification Steps
1. **Upload Validation**: File format and size checks
2. **Content Review**: Manual review by Front Office
3. **Authenticity Check**: Verification with issuing authorities
4. **Completeness Assessment**: Ensure all required documents present
5. **Final Approval**: Control Department sign-off

## Common Rejection Reasons
- Poor image quality (illegible text)
- Expired documents
- Missing required information
- Incomplete document sets
- Non-official copies
          `
        }
      ]
    },
    {
      id: 'technical_api',
      title: 'Technical Architecture',
      category: 'technical',
      icon: 'solar:server-bold',
      content: `
# Technical Architecture Overview

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Bootstrap 5 + Tailwind CSS
- **UI Components**: Custom component library based on Darkone template
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Yup validation
- **HTTP Client**: Axios with interceptors
- **Charts**: ApexCharts for data visualization

### Backend
- **Database**: PostgreSQL (via Supabase)
- **API**: Supabase auto-generated REST API
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Supabase Storage with CDN
- **Edge Functions**: Deno-based serverless functions

### Security
- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Row Level Security (RLS) policies
- **Data Encryption**: At-rest and in-transit encryption
- **File Security**: Signed URLs with expiration
- **Audit Logging**: Immutable audit trail

### Infrastructure
- **Hosting**: Supabase managed infrastructure
- **CDN**: Global content delivery network
- **Monitoring**: Built-in observability tools
- **Backup**: Automated daily backups
- **Scaling**: Auto-scaling based on load

## Database Schema

### Core Tables
- \`users\`: System users and authentication
- \`profiles\`: Extended user profile information
- \`applicants\`: Housing subsidy applicants
- \`applications\`: Main application records
- \`application_steps\`: Workflow state tracking
- \`documents\`: Document metadata and verification
- \`control_visits\`: Scheduled control inspections
- \`control_photos\`: Photos from control visits
- \`technical_reports\`: Technical assessment reports
- \`social_reports\`: Social assessment reports
- \`audit_logs\`: Immutable audit trail

### Reference Data
- \`reference_data\`: System configuration
- \`workflow_states\`: Available workflow states
- \`document_types\`: Required document types
- \`user_roles\`: System roles and permissions

## Edge Functions

### 1. application-service
- **Purpose**: Core application management
- **Functions**: Create, update, state transitions
- **Security**: RLS enforcement, input validation

### 2. document-service
- **Purpose**: Document processing and validation
- **Functions**: Upload, verification, metadata extraction
- **Features**: Virus scanning, format validation

### 3. workflow-service
- **Purpose**: Workflow state management
- **Functions**: State transitions, task automation
- **Features**: SLA monitoring, notifications

### 4. notification-service
- **Purpose**: System notifications
- **Functions**: Email, SMS, in-app notifications
- **Integration**: External notification providers

### 5. reporting-service
- **Purpose**: Report generation and analytics
- **Functions**: PDF generation, data export
- **Features**: Scheduled reports, dashboards

### 6. user-management
- **Purpose**: User and role management
- **Functions**: User CRUD, role assignments
- **Security**: Admin-only access controls
      `
    },
    {
      id: 'api_reference',
      title: 'API Reference',
      category: 'api',
      icon: 'solar:code-bold',
      content: `
# API Reference Guide

## Authentication
All API requests require authentication using JWT tokens provided by Supabase Auth.

### Headers
\`\`\`
Authorization: Bearer <jwt_token>
Content-Type: application/json
\`\`\`

## Applications API

### Create Application
\`\`\`http
POST /rest/v1/applications
\`\`\`

**Request Body:**
\`\`\`json
{
  "applicant_id": "uuid",
  "application_type": "subsidy",
  "status": "draft",
  "priority": "normal",
  "submission_date": "2024-01-01T00:00:00Z"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "applicant_id": "uuid",
  "application_type": "subsidy",
  "status": "draft",
  "created_at": "2024-01-01T00:00:00Z"
}
\`\`\`

### Get Application
\`\`\`http
GET /rest/v1/applications?id=eq.{application_id}
\`\`\`

### Update Application Status
\`\`\`http
PATCH /rest/v1/applications?id=eq.{application_id}
\`\`\`

**Request Body:**
\`\`\`json
{
  "status": "intake_review",
  "updated_by": "user_id"
}
\`\`\`

## Documents API

### Upload Document
\`\`\`http
POST /storage/v1/object/documents/{path}
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
\`\`\`

### Get Document Metadata
\`\`\`http
GET /rest/v1/documents?application_id=eq.{application_id}
\`\`\`

### Verify Document
\`\`\`http
POST /functions/v1/document-service
\`\`\`

**Request Body:**
\`\`\`json
{
  "action": "verify",
  "document_id": "uuid",
  "verification_status": "approved"
}
\`\`\`

## Workflow API

### Transition State
\`\`\`http
POST /functions/v1/workflow-service
\`\`\`

**Request Body:**
\`\`\`json
{
  "action": "transition",
  "application_id": "uuid",
  "from_state": "intake_review",
  "to_state": "control_assign",
  "user_id": "uuid",
  "notes": "Ready for control assignment"
}
\`\`\`

### Get Workflow History
\`\`\`http
GET /rest/v1/application_steps?application_id=eq.{application_id}
\`\`\`

## Real-time Subscriptions

### Application Updates
\`\`\`javascript
const subscription = supabase
  .channel('applications')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'applications'
  }, (payload) => {
    console.log('Application updated:', payload);
  })
  .subscribe();
\`\`\`

### Workflow State Changes
\`\`\`javascript
const subscription = supabase
  .channel('workflow')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'application_steps'
  }, (payload) => {
    console.log('Workflow step added:', payload);
  })
  .subscribe();
\`\`\`

## Error Handling

### Common Error Codes
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Business rule violation
- **422**: Unprocessable Entity - Validation failed
- **500**: Internal Server Error - System error

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Required field missing",
    "details": {
      "field": "applicant_name",
      "constraint": "not_null"
    }
  }
}
\`\`\`
      `
    },
    {
      id: 'deployment',
      title: 'Deployment Guide',
      category: 'deployment',
      icon: 'solar:rocket-bold',
      content: `
# Production Deployment Guide

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Production Supabase project created
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] CDN setup completed

### 2. Database Migration
- [ ] Schema migration scripts tested
- [ ] Reference data populated
- [ ] RLS policies enabled
- [ ] User roles configured
- [ ] Initial admin user created

### 3. Security Configuration
- [ ] JWT secret configured
- [ ] Storage bucket policies set
- [ ] Edge function secrets added
- [ ] Rate limiting enabled
- [ ] CORS policies configured

### 4. Performance Optimization
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Cache headers set
- [ ] Image optimization enabled
- [ ] Code splitting implemented

## Deployment Steps

### 1. Database Setup
\`\`\`sql
-- Run migration scripts in order
-- 001_initial_schema.sql
-- 002_rls_policies.sql
-- 003_reference_data.sql
-- 004_indexes.sql
\`\`\`

### 2. Supabase Configuration
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref <project-id>

# Deploy functions
supabase functions deploy
\`\`\`

### 3. Frontend Deployment
\`\`\`bash
# Build production bundle
npm run build

# Deploy to hosting platform
# (Vercel, Netlify, or custom server)
\`\`\`

### 4. Environment Variables
\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
ENVIRONMENT=production
\`\`\`

## Post-deployment Verification

### 1. Functionality Tests
- [ ] User authentication working
- [ ] Application creation successful
- [ ] Document upload functional
- [ ] Workflow transitions operating
- [ ] Notifications being sent

### 2. Performance Tests
- [ ] Page load times under 2 seconds
- [ ] Database queries optimized
- [ ] File uploads completing
- [ ] Real-time updates working
- [ ] Mobile responsiveness verified

### 3. Security Tests
- [ ] RLS policies enforcing access
- [ ] File uploads secured
- [ ] JWT tokens validating
- [ ] HTTPS redirects working
- [ ] Rate limiting active

## Monitoring Setup

### 1. Application Monitoring
- Supabase dashboard monitoring
- Error tracking setup
- Performance monitoring
- User analytics implementation

### 2. Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Storage usage alerts
- Backup verification

### 3. Security Monitoring
- Authentication failure alerts
- Suspicious activity detection
- Rate limit breach notifications
- Security audit logging

## Backup and Recovery

### 1. Database Backups
- Automated daily backups
- Point-in-time recovery setup
- Backup verification process
- Recovery testing schedule

### 2. File Storage Backups
- Document storage replication
- Version control for uploads
- Recovery procedures documented
- Disaster recovery plan

## Maintenance Procedures

### 1. Regular Updates
- Security patches monthly
- Feature updates quarterly
- Dependency updates weekly
- Performance optimization reviews

### 2. Health Checks
- Daily system health verification
- Weekly performance reviews
- Monthly security audits
- Quarterly disaster recovery tests
      `
    },
    {
      id: 'security',
      title: 'Security Guidelines',
      category: 'security',
      icon: 'solar:shield-bold',
      content: `
# Security Implementation Guide

## Authentication Security

### 1. Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Password history enforcement (last 5 passwords)
- Maximum password age: 90 days
- Account lockout after 5 failed attempts

### 2. Session Management
- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Automatic logout after 30 minutes inactivity
- Concurrent session limits (3 sessions per user)
- Session invalidation on password change

### 3. Multi-Factor Authentication (Future)
- TOTP-based 2FA implementation planned
- SMS backup authentication
- Emergency recovery codes
- Admin-enforced 2FA for privileged accounts

## Authorization & Access Control

### 1. Row Level Security (RLS)
All tables implement RLS policies to ensure data isolation:

\`\`\`sql
-- Applications table policy
CREATE POLICY "Users can only see their role-appropriate applications"
ON public.applications
FOR ALL
USING (
  CASE auth.jwt() ->> 'role'
    WHEN 'admin' THEN true
    WHEN 'director' THEN status IN ('director_review', 'minister_decision')
    WHEN 'staff' THEN assigned_to = auth.uid()
    ELSE false
  END
);
\`\`\`

### 2. Role-Based Permissions
- **Principle of Least Privilege**: Users only get minimum required permissions
- **Role Inheritance**: Higher roles inherit lower role permissions
- **Temporary Elevations**: Time-limited permission escalations
- **Audit Trail**: All permission changes logged

### 3. API Security
- **Rate Limiting**: 100 requests per minute per user
- **Input Validation**: All inputs validated against schemas
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Output encoding implemented
- **CSRF Protection**: CSRF tokens for state-changing operations

## Data Protection

### 1. Data Encryption
- **At Rest**: AES-256 encryption for all stored data
- **In Transit**: TLS 1.3 for all communications
- **Database**: Transparent Data Encryption (TDE) enabled
- **Files**: Individual file encryption before storage
- **Backups**: Encrypted backup storage

### 2. Data Classification
- **Public**: System reference data
- **Internal**: Application workflow data
- **Confidential**: Applicant personal information
- **Restricted**: Financial and government data

### 3. Data Retention
- **Application Data**: 7 years after closure
- **Audit Logs**: 10 years permanent retention
- **User Sessions**: 30 days after expiration
- **Temporary Files**: 24 hours maximum
- **Document Uploads**: Lifetime of application + 2 years

## File Security

### 1. Upload Security
- **File Type Validation**: Whitelist approach
- **Size Limits**: 10MB maximum per file
- **Virus Scanning**: All uploads scanned
- **Content Analysis**: MIME type verification
- **Malware Detection**: Advanced threat detection

### 2. Storage Security
- **Signed URLs**: Temporary access with expiration
- **Access Logging**: All file access logged
- **Geographic Restrictions**: Access based on user location
- **Version Control**: Immutable file versions
- **Backup Encryption**: Encrypted backup copies

## Audit and Compliance

### 1. Audit Logging
All security-relevant events are logged:
- User authentication attempts
- Authorization failures
- Data access and modifications
- Administrative actions
- System configuration changes

### 2. Log Format
\`\`\`json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "event_type": "authentication_failure",
  "user_id": "uuid",
  "ip_address": "192.168.1.100",
  "user_agent": "browser_info",
  "details": {
    "reason": "invalid_password",
    "attempt_count": 3
  }
}
\`\`\`

### 3. Compliance Requirements
- **Data Privacy**: GDPR compliance implemented
- **Government Standards**: Local security requirements met
- **Industry Standards**: ISO 27001 guidelines followed
- **Audit Readiness**: Regular compliance assessments

## Incident Response

### 1. Security Incident Classification
- **Critical**: Data breach, system compromise
- **High**: Unauthorized access, privilege escalation
- **Medium**: Failed security controls, policy violations
- **Low**: Minor security events, informational alerts

### 2. Response Procedures
1. **Detection**: Automated monitoring and alerting
2. **Analysis**: Security team investigation
3. **Containment**: Immediate threat mitigation
4. **Eradication**: Root cause elimination
5. **Recovery**: System restoration and validation
6. **Lessons Learned**: Post-incident review and improvements

### 3. Communication Plan
- **Internal**: Security team → Management → IT staff
- **External**: Legal requirements, regulatory notifications
- **Users**: Affected user notifications when required
- **Documentation**: Incident reports and remediation records

## Security Monitoring

### 1. Real-time Monitoring
- Failed authentication attempts
- Unusual access patterns
- Data export activities
- Administrative actions
- System configuration changes

### 2. Security Metrics
- Authentication success rate
- Authorization failure count
- Security event frequency
- Incident response time
- Compliance score

### 3. Regular Assessments
- **Weekly**: Vulnerability scans
- **Monthly**: Security configuration reviews
- **Quarterly**: Penetration testing
- **Annually**: Comprehensive security audits
      `
    }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDoc = documentationSections.find(section => section.id === activeSection);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user_guide': return 'text-primary';
      case 'technical': return 'text-info';
      case 'api': return 'text-warning';
      case 'deployment': return 'text-success';
      case 'security': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'user_guide': return 'bg-primary';
      case 'technical': return 'bg-info';
      case 'api': return 'bg-warning';
      case 'deployment': return 'bg-success';
      case 'security': return 'bg-danger';
      default: return 'bg-light';
    }
  };

  return (
    <div className="row">
      {/* Sidebar Navigation */}
      <div className="col-lg-3 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Documentation</h6>
          </div>
          <div className="card-body p-0">
            {/* Search */}
            <div className="p-3 border-bottom">
              <div className="input-group input-group-sm">
                <span className="input-group-text">
                  <IconifyIcon icon="solar:magnifer-bold" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="list-group list-group-flush">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  className={`list-group-item list-group-item-action border-0 ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="d-flex align-items-center">
                    <IconifyIcon 
                      icon={section.icon} 
                      className={`me-2 ${getCategoryColor(section.category)}`}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-medium">{section.title}</div>
                      <span className={`badge ${getCategoryBadge(section.category)} small`}>
                        {section.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-lg-9">
        {activeDoc ? (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <IconifyIcon 
                  icon={activeDoc.icon} 
                  className={`me-2 fs-4 ${getCategoryColor(activeDoc.category)}`}
                />
                <div>
                  <h5 className="mb-0">{activeDoc.title}</h5>
                  <span className={`badge ${getCategoryBadge(activeDoc.category)}`}>
                    {activeDoc.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <IconifyIcon icon="solar:download-bold" className="me-1" />
                  Export PDF
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <IconifyIcon icon="solar:printer-bold" className="me-1" />
                  Print
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="documentation-content">
                <pre className="text-wrap" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {activeDoc.content}
                </pre>

                {/* Subsections */}
                {activeDoc.subsections && activeDoc.subsections.length > 0 && (
                  <div className="mt-4">
                    {activeDoc.subsections.map((subsection) => (
                      <div key={subsection.id} className="mb-4">
                        <div className="border-start border-primary border-3 ps-3">
                          <h6 className="text-primary">{subsection.title}</h6>
                          <pre className="text-wrap" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {subsection.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-5">
              <IconifyIcon icon="solar:document-bold" className="fs-1 text-muted" />
              <h5 className="mt-3">Select Documentation Section</h5>
              <p className="text-muted">Choose a section from the sidebar to view documentation content.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};