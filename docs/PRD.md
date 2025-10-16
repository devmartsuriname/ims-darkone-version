# Internal Management System — Public Housing (Suriname)

## Product Goals

Streamline and secure the **end-to-end application workflow** for housing services (starting with **Subsidy / Bouwsubsidie**), reduce manual handling, enforce **control/verification before approvals**, and provide **traceability** across departments (Front Office → Technical/Social Control → DVH Director → Minister).

## Scope (Phase 0 – Pilot Service)

* **Pilot service**: Subsidy / Bouwsubsidie (intake + verification + decision + disbursement prep)
* **Users/roles**: Admin, IT, Staff, Control Department, Director, Minister, Front Office, Citizen (User)
* **Channels**: Front Office assisted intake and internal back-office processing (citizen portal optional later)
* **Languages**: Dutch first; support for localization later

## Architecture Overview

### Frontend (Lovable + Darkone Theme)
* React + Vite + TypeScript, Tailwind CSS, Bootstrap 5
* **Darkone Admin Template** - complete UI framework with:
  - Pre-built dashboard components
  - Form validation with Yup + React Hook Form
  - GridJS data tables
  - ApexCharts for analytics
  - Bootstrap modals and offcanvas
  - File upload with Dropzone
  - CustomFlatpickr for scheduling
* Feature flags via environment or database

### Backend (Supabase Native Integration)
* Supabase (Postgres, Auth, Storage, Edge Functions)
* State machine workflow engine (Edge Functions)
* Audit logging with immutable records
* SLA tracking with automated escalation
* Object-level storage security with signed URLs

### Integration Layer
* REST/JSON + Webhooks
* OpenAPI specification for future DMS integration
* Event-driven architecture with outbox pattern

### Security & Compliance
* Row Level Security (RLS) policies
* Immutable audit logging
* Signed URLs with TTL for file access
* Role-based access control (RBAC)

## Data Model

### Core Entities
* `users` - System users with roles
* `profiles` - Extended user profile information
* `applicants` - Housing subsidy applicants
* `applications` - Main application records
* `application_steps` - Workflow state tracking
* `documents` - Document metadata and verification
* `control_visits` - Scheduled control inspections
* `control_photos` - Photos from control visits
* `technical_reports` - Technical assessment reports
* `social_reports` - Social assessment reports
* `income_records` - Income verification data
* `tasks` - Automated workflow tasks
* `audit_logs` - Immutable audit trail
* `reference_data` - System configuration data
* `attachments` - File storage metadata
* `outbox_events` - Integration event queue

### Key Fields

#### Applicant Demographics
* Personal identification (ID, name, marital status, nationality)
* Household composition (children, dependents)
* Employment and income details
* Contact information

#### Property Details
* Title type and ownership documentation
* Perceelkaart (plot map) information
* Surface area (opp. m²)
* Housing type and building floors
* Utility connections (nutsvoorzieningen)

#### Technical Assessment
* Foundation condition
* Floor and structural integrity
* Roof condition
* Windows and doors
* Sanitation facilities
* Sewerage system

#### Social Assessment
* Household situation
* Health considerations
* Specific needs assessment
* Reason for assistance request

## Workflow States (State Machine)

### Application States
1. **DRAFT** - Initial application creation
2. **INTAKE_REVIEW** - Front office review
3. **CONTROL_ASSIGN** - Assignment to control department
4. **CONTROL_VISIT_SCHEDULED** - Visit scheduled
5. **CONTROL_IN_PROGRESS** - Control visit ongoing
6. **TECHNICAL_REVIEW** - Technical assessment
7. **SOCIAL_REVIEW** - Social assessment
8. **DIRECTOR_REVIEW** - DVH Director review
9. **MINISTER_DECISION** - Final ministerial decision
10. **CLOSURE** - Application completed
11. **REJECTED** - Application denied
12. **ON_HOLD** - Temporary suspension

### Transition Rules
* **Gate Control**: No progress to DIRECTOR_REVIEW without:
  - All required documents verified
  - Minimum photo count from control visit
  - Technical and social reports submitted

### SLA Timers
* Automated task creation per state
* SLA monitoring with escalation alerts
* Performance metrics tracking

## Role-based Access Matrix

| Resource / Action    | Admin | IT | Staff | Control | Director | Minister | Front Office | Applicant |
|---------------------|-------|----|----|-------|----------|----------|-------------|-----------|
| Create application  | ✓     | ✓  | ✓  |       |          |          | ✓           | (future)  |
| Edit intake fields  | ✓     | ✓  | ✓  |       |          |          | ✓           |           |
| Schedule control    | ✓     | ✓  |    | ✓     |          |          |             |           |
| Upload photos       |       |    |    | ✓     |          |          |             |           |
| Submit tech report  |       |    | ✓  | ✓     |          |          |             |           |
| Submit social report|       |    | ✓  |       |          |          |             |           |
| Director recommendation|   |    |    |       | ✓        |          |             |           |
| Minister decision   |       |    |    |       |          | ✓        |             |           |
| Manage users/roles  | ✓     | ✓  |    |       |          |          |             |           |

## Form Validation Rules

### Applicant Details (Step 1)

**Required Text Fields:**
- National ID (min 1 character)
- First Name (min 1 character)
- Last Name (min 1 character)
- Date of Birth (valid date)
- Phone Number (min 1 character)
- Email (valid email format)
- Address (min 1 character)

**Required Dropdown Fields:**
- Marital Status: Single, Married, Divorced, Widowed, Common Law
- District: Paramaribo, Wanica, Nickerie, Coronie, Saramacca, Commewijne, Marowijne, Para, Brokopondo, Sipaliwini
- Employment Status: Employed, Self-Employed, Unemployed, Retired, Student, Disabled

**Conditional Fields:**
- Spouse Name (required if marital_status = "married" or "common_law")
- Spouse Income (required if marital_status = "married" or "common_law")

**Optional Fields:**
- Nationality (default: "Surinamese")
- Household Size (default: 1)
- Children Count (default: 0)
- Monthly Income (default: 0)
- Employer Name

### Property Details (Step 2)

**Required Text Fields:**
- Property Address (min 1 character)
- Requested Amount (min 1)
- Reason for Request (min 10 characters)

**Optional Dropdown Fields:**
- Property Type: Residential House, Apartment, Land, Commercial, Mixed Use
- Property District: (same as applicant district options)
- Title Type: Eigendom, Erfpacht, Grondhuur, None
- Ownership Status: Owner, Co-owner, Tenant, Family Property, Other
- Priority Level: High (1), Medium-High (2), Normal (3), Low (4) - default: Normal

**Optional Fields:**
- Property Surface Area (m²)
- Special Circumstances

### Document Upload (Step 3)

**Required Documents:** Minimum 1 document uploaded

### Review & Submit (Step 4)

**Final Validation:** All required fields from Steps 1-3 must be valid before submission.

---

## Required Documents (12 Items)

1. Nationale verklaring + uittreksel
2. Gezinsuittreksel
3. ID kopieën (all household members)
4. Perceelkaart (plot map)
5. Eigendom/koopakte/beschikking (ownership documents)
6. Toestemmingsbrief eigenaar/SVS (permission letter)
7. AOV verklaring (pension declaration)
8. Pensioenverklaring (pension statement)
9. Hypotheek uittreksel (mortgage statement)
10. Recente loonstrook (recent pay slip)
11. Werkgeversverklaring (employer declaration)
12. Dorpsverklaring / DC-verklaring (village/district declaration)

## UI/UX Requirements (Darkone Theme)

### Dashboard Components
* Role-aware landing dashboards using existing Darkone layouts
* Application summary cards with status indicators
* Work queue tables with filtering and sorting

### Application Detail Interface
* Tabbed interface using Bootstrap nav-tabs:
  - Applicant Information
  - Property Details
  - Document Management
  - Control Process
  - Review Reports
  - Decision History

### Form Components
* Multi-step forms using existing validation patterns
* Document upload with progress tracking
* Technical defects matrix with checkboxes
* Social assessment questionnaires

### Administrative Interfaces
* User and role management using GridJS tables
* Reference data configuration
* System settings and feature flags

## Performance Requirements

* Page load times under 2 seconds
* File upload progress tracking
* Responsive design for mobile control visits
* Offline capability for control department

## Integration Requirements

### Future DMS Integration
* OpenAPI specification
* Webhook endpoints for status updates
* Document synchronization
* Event-driven architecture

### Reporting Integration
* CSV export functionality
* Analytics dashboard integration
* Performance metrics API

## Migration & Portability

* Business logic encapsulated in Edge Functions
* Database schema version control
* Storage abstraction layer
* Configuration-driven feature flags

## Risk Mitigation

* **Missing Documents**: Automated task reminders and notifications
* **Photo Manipulation**: File hashing and EXIF data validation
* **Role Management**: Centralized capability testing
* **Legacy Integration**: Bulk import tools with barcode scanning

## Success Metrics

* Application processing time reduction (target: 50%)
* Document verification accuracy (target: 95%)
* User satisfaction scores (target: 4.5/5)
* System uptime (target: 99.5%)
* Compliance audit readiness (target: 100%)

## Timeline

* **Week 1**: Foundation and Application Intake
* **Week 2**: Control Department and Review Modules
* **Week 3**: Decision Workflows and Reporting
* **Week 4**: Integrations and Security Hardening

## Compliance & Security

* GDPR compliance for personal data
* Government security standards
* Audit trail requirements
* Data retention policies
* Backup and disaster recovery procedures