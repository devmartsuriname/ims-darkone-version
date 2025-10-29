# Role-Based Access Testing Guide

## Overview
This document provides comprehensive test cases for validating role-based access control across all user roles in the IMS (Internal Management System).

## Test Environment Setup

### Prerequisites
- Clean browser cache before testing
- Valid test accounts for each role
- Access to Supabase Dashboard for verification
- Test data seeded via UAT seeder

### Test Accounts
```
Admin:        admin@example.com
IT:           it@example.com
Staff:        staff@example.com
Control:      control@example.com
Director:     director@example.com
Minister:     minister@example.com
Front Office: frontoffice@example.com
Applicant:    applicant@example.com
```

---

## Test Case 1: Admin Account Access

### Objective
Verify that admin users have full system access and can view all metrics and tools.

### Steps
1. **Login**
   - Navigate to `/auth/sign-in`
   - Enter: `admin@example.com` / `password123`
   - Click "Sign In"
   - Expected: Redirect to `/dashboards`

2. **Dashboard Verification**
   - Verify page loads within 2 seconds
   - Confirm all 6 metric cards are visible:
     - ✅ Total Applications
     - ✅ Pending Reviews
     - ✅ Control Visits
     - ✅ Approved
     - ✅ SLA Violations
     - ✅ My Queue
   - Check SystemMetricsDashboard renders
   - Verify WorkflowChart displays data
   - Confirm IntegrationTestRunner visible (Admin/IT only)

3. **Navigation Access**
   - ✅ Applications → Intake (Create new application)
   - ✅ Applications → List (View all applications)
   - ✅ Control → Queue (View control queue)
   - ✅ Control → Schedule (Schedule visits)
   - ✅ Control → Visits (View all visits)
   - ✅ Reviews → Technical (Technical review)
   - ✅ Reviews → Social (Social review)
   - ✅ Reviews → Director (Director review)
   - ✅ Reviews → Minister (Minister decision)
   - ✅ Admin → Users (User management)
   - ✅ Admin → Settings (System settings)
   - ✅ Monitoring → System Health
   - ✅ Workflow → Monitoring

4. **Data Access Verification**
   - Create test application
   - Verify application appears in list
   - Assign to another user
   - Verify assignment successful

5. **Logout**
   - Click profile dropdown → Logout
   - Verify redirect to `/auth/sign-in`

### Expected Results
- ✅ Full access to all features
- ✅ All metrics visible
- ✅ No permission errors
- ✅ Session persists across tabs

### Pass Criteria
All steps complete without errors, all features accessible.

---

## Test Case 2: IT Account Access

### Objective
Verify IT users have identical access to Admin users.

### Steps
1. **Login**
   - Use: `it@example.com` / `password123`
   - Expected: Redirect to `/dashboards`

2. **Dashboard Verification**
   - Verify all 6 metrics visible (same as Admin)
   - Confirm IntegrationTestRunner visible
   - Check admin tools accessible

3. **Administrative Actions**
   - Navigate to Admin → Users
   - Verify user management access
   - Test creating a new user
   - Test updating user roles

4. **Workflow Monitoring**
   - Navigate to Workflow → Monitoring
   - Verify workflow data visible
   - Test workflow state transitions

### Expected Results
- ✅ Identical access to Admin role
- ✅ All admin tools functional
- ✅ User management works

### Pass Criteria
No difference in access compared to Admin role.

---

## Test Case 3: Staff Account Access

### Objective
Verify Staff users have application management access without admin tools.

### Steps
1. **Login**
   - Use: `staff@example.com` / `password123`

2. **Dashboard Verification**
   - Verify 5 metrics visible:
     - ✅ Total Applications
     - ✅ Pending Reviews
     - ✅ Control Visits
     - ✅ Approved
     - ✅ SLA Violations
   - Confirm "My Queue" NOT visible (Staff specific)
   - Verify IntegrationTestRunner NOT visible

3. **Application Management**
   - ✅ Navigate to Applications → Intake
   - ✅ Create new application
   - ✅ Upload documents
   - ✅ Submit application
   - ✅ View application list
   - ✅ Edit draft applications

4. **Social Review Access**
   - Navigate to Reviews → Social
   - Verify social assessment form accessible
   - Test creating social report

5. **Restricted Access**
   - ❌ Navigate to Admin → Users (Should be denied)
   - ❌ Navigate to Control → Visit (Should be denied)
   - ❌ Navigate to Reviews → Minister (Should be denied)

### Expected Results
- ✅ Can manage applications
- ✅ Can create social reports
- ❌ Cannot access admin tools
- ❌ Cannot access control tools
- ❌ Cannot make ministerial decisions

### Pass Criteria
Staff can manage applications but cannot access admin/control/decision tools.

---

## Test Case 4: Control Account Access

### Objective
Verify Control users have access to control queue and visit management.

### Steps
1. **Login**
   - Use: `control@example.com` / `password123`

2. **Dashboard Verification**
   - Verify 3 metrics visible:
     - ✅ Control Visits
     - ✅ My Queue
     - ✅ Pending (control-specific)
   - Confirm application metrics NOT visible

3. **Control Queue Access**
   - Navigate to Control → Queue
   - Verify assigned applications visible
   - Test filtering by status
   - Test searching applications

4. **Visit Management**
   - Navigate to Control → Schedule
   - Schedule a control visit
   - Navigate to Control → Visit
   - Access visit form
   - Upload control photos
   - Complete technical assessment

5. **Photo Capture System**
   - Test photo upload
   - Verify GPS data captured
   - Test photo categorization
   - Verify minimum photo count validation

6. **Technical Report**
   - Navigate to Reviews → Technical
   - Create technical report
   - Complete all assessment fields
   - Submit report

7. **Restricted Access**
   - ❌ Navigate to Applications → Intake (Should be denied)
   - ❌ Navigate to Reviews → Minister (Should be denied)
   - ❌ Navigate to Admin → Users (Should be denied)

### Expected Results
- ✅ Can view control queue
- ✅ Can schedule visits
- ✅ Can capture photos
- ✅ Can create technical reports
- ❌ Cannot create applications
- ❌ Cannot access admin tools

### Pass Criteria
Control can manage inspections but cannot create applications or access admin tools.

---

## Test Case 5: Director Account Access

### Objective
Verify Director users have review and approval access.

### Steps
1. **Login**
   - Use: `director@example.com` / `password123`

2. **Dashboard Verification**
   - Verify 3 metrics visible:
     - ✅ Pending Reviews
     - ✅ Approved
     - ✅ My Queue
   - Confirm control metrics NOT visible

3. **Director Review Dashboard**
   - Navigate to Reviews → Director
   - Verify applications in review state visible
   - Test filtering by application status
   - Test searching applications

4. **Review Process**
   - Open application details
   - Verify all sections are readonly
   - Verify documents are viewable
   - Verify technical report visible
   - Verify social report visible
   - Add director recommendation
   - Approve/Reject application

5. **Application Details Access**
   - Verify applicant information visible
   - Verify property details visible
   - Verify control photos accessible
   - Verify all reports accessible

6. **Restricted Access**
   - ❌ Navigate to Applications → Intake (Should be readonly/denied)
   - ❌ Navigate to Control → Visit (Should be denied)
   - ❌ Navigate to Admin → Users (Should be denied)
   - ❌ Navigate to Reviews → Minister (Should be denied)

### Expected Results
- ✅ Can view applications pending review
- ✅ Can add recommendations
- ✅ Can approve/reject applications
- ❌ Cannot create applications
- ❌ Cannot conduct control visits
- ❌ Cannot make final ministerial decisions

### Pass Criteria
Director can review and recommend but cannot create applications or make final decisions.

---

## Test Case 6: Minister Account Access

### Objective
Verify Minister users have final decision-making access.

### Steps
1. **Login**
   - Use: `minister@example.com` / `password123`

2. **Dashboard Verification**
   - Verify 3 metrics visible:
     - ✅ Pending Reviews (ministerial level)
     - ✅ Approved
     - ✅ My Queue
   - Confirm only decision-ready applications visible

3. **Minister Decision Dashboard**
   - Navigate to Reviews → Minister
   - Verify applications with director recommendation visible
   - Test filtering by priority
   - Test searching applications

4. **Final Decision Process**
   - Open application details
   - Review all reports (technical, social, director)
   - Review director recommendation
   - Add ministerial notes
   - Make final decision (Approve/Reject)
   - Set approved amount (if applicable)

5. **Historical Data Access**
   - Verify access to completed applications
   - Verify access to decision history
   - Test exporting decision reports

6. **Restricted Access**
   - ❌ Navigate to Applications → Intake (Should be denied)
   - ❌ Navigate to Control → Visit (Should be denied)
   - ❌ Navigate to Admin → Users (Should be denied)

### Expected Results
- ✅ Can view applications ready for decision
- ✅ Can make final approval/rejection
- ✅ Can set approved amounts
- ✅ Can access historical decisions
- ❌ Cannot create applications
- ❌ Cannot conduct control visits
- ❌ Cannot access admin tools

### Pass Criteria
Minister can make final decisions but cannot access operational tools.

---

## Test Case 7: Front Office Account Access

### Objective
Verify Front Office users have application intake access only.

### Steps
1. **Login**
   - Use: `frontoffice@example.com` / `password123`

2. **Dashboard Verification**
   - Verify 2 metrics visible:
     - ✅ Total Applications
     - ✅ Pending
   - Confirm review/control metrics NOT visible

3. **Application Intake**
   - Navigate to Applications → Intake
   - Complete applicant details step
   - Complete property details step
   - Upload required documents (all 12)
   - Review and submit

4. **Document Upload Verification**
   - Test file type validation
   - Test file size limits (50MB max)
   - Verify document categories
   - Test document replacement

5. **Application List Access**
   - Navigate to Applications → List
   - Verify only intake-stage applications visible
   - Test filtering by status
   - Test basic search

6. **Restricted Access**
   - ❌ Navigate to Reviews → Technical (Should be denied)
   - ❌ Navigate to Reviews → Director (Should be denied)
   - ❌ Navigate to Control → Queue (Should be denied)
   - ❌ Navigate to Admin → Users (Should be denied)

### Expected Results
- ✅ Can create applications
- ✅ Can upload documents
- ✅ Can view intake applications
- ❌ Cannot access review tools
- ❌ Cannot access control tools
- ❌ Cannot access admin tools

### Pass Criteria
Front Office can only perform intake tasks, no review or control access.

---

## Test Case 8: Applicant Account Access

### Objective
Verify Applicant users have minimal access (view own applications only).

### Steps
1. **Login**
   - Use: `applicant@example.com` / `password123`

2. **Dashboard Verification**
   - Verify minimal dashboard (if any)
   - Confirm no admin metrics visible

3. **Own Applications Access**
   - Navigate to Applications (if accessible)
   - Verify only own applications visible
   - Test viewing application status
   - Test viewing uploaded documents

4. **Restricted Access**
   - ❌ All admin features should be denied
   - ❌ All control features should be denied
   - ❌ All review features should be denied
   - ❌ Cannot view other applicants' data

### Expected Results
- ✅ Can view own applications
- ✅ Can check application status
- ❌ Cannot access any admin/staff features
- ❌ Cannot view others' applications

### Pass Criteria
Applicant can only view own data, no system access.

---

## Cross-Role Testing

### Test Case 9: Role Switching
1. Login as Admin
2. Navigate to Admin → Users
3. Change own role to "Staff"
4. Refresh page
5. Verify dashboard updates to Staff view
6. Verify admin tools no longer accessible

### Test Case 10: Concurrent Sessions
1. Login as Admin in Browser A
2. Login as Admin in Browser B
3. Perform action in Browser A (create application)
4. Verify action reflects in Browser B (after refresh)
5. Logout in Browser A
6. Verify Browser B session remains active

### Test Case 11: Permission Escalation Prevention
1. Login as Staff
2. Attempt direct URL access to `/admin/users`
3. Verify "Access Denied" message
4. Attempt API call to admin-only endpoint
5. Verify 403/401 response

---

## Performance Testing

### Test Case 12: Dashboard Load Time
1. Login as Admin
2. Measure time to dashboard display
3. **Pass Criteria**: < 2 seconds

### Test Case 13: Application List Load
1. Login as Staff
2. Navigate to Applications → List
3. Measure time to table render
4. **Pass Criteria**: < 3 seconds for 100 records

### Test Case 14: Concurrent Users
1. Login with 5 different users simultaneously
2. Perform actions concurrently
3. Verify no session conflicts
4. Verify no data corruption

---

## Security Testing

### Test Case 15: RLS Policy Validation
1. Login as Control
2. Attempt to query applications table directly (DevTools)
3. Verify only assigned applications returned
4. Attempt to update unassigned application
5. Verify RLS policy denies update

### Test Case 16: Session Hijacking Prevention
1. Login as Admin
2. Copy session token from localStorage
3. Logout
4. Attempt to use copied token in new session
5. Verify token is invalidated

### Test Case 17: SQL Injection Prevention
1. Login as Staff
2. Enter SQL injection payloads in search fields:
   - `'; DROP TABLE applications; --`
   - `1' OR '1'='1`
3. Verify queries are parameterized
4. Verify no SQL execution

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] All user roles can login
- [ ] Dashboard loads for all roles
- [ ] Metrics are accurate
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] Documents upload correctly
- [ ] Search/filter functions work
- [ ] Session persists across tabs
- [ ] Logout works correctly
- [ ] No console errors
- [ ] No network errors (404, 500)

---

## Test Result Template

```markdown
## Test Execution Report

**Date**: YYYY-MM-DD
**Tester**: Name
**Build Version**: v0.14.4

### Test Results Summary
- Total Tests: 17
- Passed: __
- Failed: __
- Blocked: __

### Failed Tests
| Test Case | Role | Issue | Severity |
|-----------|------|-------|----------|
| TC-3.4    | Staff | Cannot create social report | High |

### Bugs Found
1. **BUG-001**: Description
   - Steps to Reproduce: ...
   - Expected: ...
   - Actual: ...
   - Severity: Critical/High/Medium/Low

### Recommendations
- Fix BUG-001 before production
- Retest TC-3.4 after fix
```

---

## Automation Opportunities

Consider automating:
1. Login/logout for all roles
2. Dashboard metric validation
3. RLS policy checks
4. API endpoint authorization
5. Cross-browser compatibility

---

## Sign-Off

**QA Lead**: _______________  
**Date**: _______________  
**Status**: ☐ Passed ☐ Failed ☐ Conditional  
**Notes**: _______________
