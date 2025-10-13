# UAT Test Cases — IMS Admin System
**Version:** 1.0.0  
**Test Cycle:** Production Readiness

---

## Test Case Format
**TC-[Module]-[Number]:** Test Case Title  
**Priority:** Critical / High / Medium / Low  
**Role:** [Required user role]  
**Prerequisites:** [Setup requirements]  
**Steps:** [Detailed steps]  
**Expected Result:** [What should happen]  
**Actual Result:** [To be filled during testing]  
**Status:** ☐ Not Started | 🔄 In Progress | ✅ Pass | ❌ Fail

---

## 🔐 Authentication & Authorization (AUTH)

### TC-AUTH-001: Successful Login
**Priority:** Critical  
**Role:** Any  
**Prerequisites:** Valid user account exists  
**Steps:**
1. Navigate to login page
2. Enter valid email and password
3. Click "Sign In" button

**Expected Result:** User is redirected to dashboard, navigation menu shows role-appropriate options  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-AUTH-002: Failed Login - Invalid Credentials
**Priority:** Critical  
**Role:** Any  
**Prerequisites:** None  
**Steps:**
1. Navigate to login page
2. Enter invalid email or password
3. Click "Sign In" button

**Expected Result:** Error message displayed, user remains on login page  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-AUTH-003: Role-Based Menu Access
**Priority:** Critical  
**Role:** All roles  
**Prerequisites:** Users with different roles  
**Steps:**
1. Login as Admin
2. Note visible menu items
3. Logout and login as Front Office staff
4. Compare menu visibility

**Expected Result:** Each role sees only authorized menu items  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-AUTH-004: Session Timeout
**Priority:** High  
**Role:** Any  
**Prerequisites:** Active session  
**Steps:**
1. Login successfully
2. Leave browser idle for configured timeout period
3. Attempt to interact with the system

**Expected Result:** User is logged out and redirected to login page  
**Actual Result:** _____________________  
**Status:** ☐

---

## 📝 Application Intake (INTAKE)

### TC-INTAKE-001: Create New Application - Complete Form
**Priority:** Critical  
**Role:** Front Office  
**Prerequisites:** Logged in as Front Office user  
**Steps:**
1. Navigate to Applications → New Intake
2. Fill all required fields in Applicant Details tab
3. Complete Property Details tab
4. Upload all 12 required documents
5. Review and submit

**Expected Result:** Application created with unique number, status = INTAKE_REVIEW  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-INTAKE-002: Save Application as Draft
**Priority:** High  
**Role:** Front Office  
**Prerequisites:** Started new application  
**Steps:**
1. Fill only partial application details
2. Click "Save Draft" button
3. Navigate away from the page
4. Return to application list

**Expected Result:** Draft saved, status = DRAFT, can be edited later  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-INTAKE-003: Form Validation - Missing Required Fields
**Priority:** Critical  
**Role:** Front Office  
**Prerequisites:** New application form  
**Steps:**
1. Leave required field empty (e.g., National ID)
2. Attempt to proceed to next step
3. Observe validation message

**Expected Result:** Error message shown, cannot proceed until filled  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-INTAKE-004: Document Upload - Valid File Types
**Priority:** Critical  
**Role:** Front Office  
**Prerequisites:** Application in progress  
**Steps:**
1. Navigate to Document Upload tab
2. Select valid document type (PDF, JPG, PNG)
3. Upload file < 10MB
4. Verify upload success

**Expected Result:** File uploaded, preview available, verification status = PENDING  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-INTAKE-005: Document Upload - Invalid File Type
**Priority:** High  
**Role:** Front Office  
**Prerequisites:** Application in progress  
**Steps:**
1. Attempt to upload .exe or .zip file
2. Observe system response

**Expected Result:** Upload rejected with clear error message  
**Actual Result:** _____________________  
**Status:** ☐

---

## 🔍 Control Department (CONTROL)

### TC-CONTROL-001: Schedule Control Visit
**Priority:** Critical  
**Role:** Control Inspector  
**Prerequisites:** Application in CONTROL_ASSIGN status  
**Steps:**
1. Navigate to Control → Queue
2. Select application
3. Click "Schedule Visit"
4. Choose date and time
5. Assign inspector
6. Save schedule

**Expected Result:** Visit scheduled, status = CONTROL_VISIT_SCHEDULED, notification sent  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-CONTROL-002: Photo Capture During Visit
**Priority:** Critical  
**Role:** Control Inspector  
**Prerequisites:** Scheduled visit  
**Steps:**
1. Navigate to Control → Active Visit
2. Capture minimum 10 photos
3. Tag photos by category (foundation, roof, etc.)
4. Add description to each photo
5. Submit photos

**Expected Result:** Photos stored with metadata, GPS coordinates captured  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-CONTROL-003: Technical Assessment Form
**Priority:** Critical  
**Role:** Control Inspector  
**Prerequisites:** Photos captured  
**Steps:**
1. Complete technical assessment checklist
2. Rate condition of each building component
3. Add structural issues if any
4. Provide recommended repairs
5. Submit technical report

**Expected Result:** Report saved, status = TECHNICAL_REVIEW  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-CONTROL-004: Insufficient Photos Validation
**Priority:** High  
**Role:** Control Inspector  
**Prerequisites:** Active visit  
**Steps:**
1. Attempt to submit visit with < 10 photos
2. Try to proceed to technical report

**Expected Result:** System blocks progression, shows minimum photo requirement error  
**Actual Result:** _____________________  
**Status:** ☐

---

## 📊 Review Workflows (REVIEW)

### TC-REVIEW-001: Social Assessment Submission
**Priority:** Critical  
**Role:** Social Worker  
**Prerequisites:** Application in SOCIAL_REVIEW status  
**Steps:**
1. Navigate to Reviews → Social Assessment
2. Complete household situation form
3. Document health conditions
4. Assess special needs
5. Calculate vulnerability score
6. Submit assessment

**Expected Result:** Social report saved, ready for director review  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-REVIEW-002: Director Recommendation
**Priority:** Critical  
**Role:** DVH Director  
**Prerequisites:** Technical and social reports submitted  
**Steps:**
1. Review application summary
2. Review technical and social reports
3. Check all required documents verified
4. Provide director recommendation
5. Submit decision

**Expected Result:** Status = MINISTER_DECISION, notification sent to Minister  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-REVIEW-003: Minister Final Decision - Approval
**Priority:** Critical  
**Role:** Minister  
**Prerequisites:** Director recommendation submitted  
**Steps:**
1. Review complete application package
2. Review director recommendation
3. Approve application with granted amount
4. Add decision remarks
5. Submit final decision

**Expected Result:** Status = CLOSURE, applicant notified, disbursement ready  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-REVIEW-004: Minister Final Decision - Rejection
**Priority:** Critical  
**Role:** Minister  
**Prerequisites:** Director recommendation submitted  
**Steps:**
1. Review application
2. Select "Reject" option
3. Provide rejection reason
4. Submit decision

**Expected Result:** Status = REJECTED, applicant notified with reason  
**Actual Result:** _____________________  
**Status:** ☐

---

## 👥 User Management (USERS)

### TC-USERS-001: Create New User Account
**Priority:** Critical  
**Role:** Admin  
**Prerequisites:** Admin access  
**Steps:**
1. Navigate to Admin → User Management
2. Click "Add New User"
3. Fill user details (name, email, phone)
4. Assign role(s)
5. Set initial password
6. Save user

**Expected Result:** User created, welcome email sent, appears in user list  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-USERS-002: Modify User Roles
**Priority:** Critical  
**Role:** Admin  
**Prerequisites:** Existing user account  
**Steps:**
1. Select user from list
2. Click "Edit Roles"
3. Add/remove roles
4. Save changes

**Expected Result:** Roles updated, menu access changes for user  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-USERS-003: Deactivate User Account
**Priority:** High  
**Role:** Admin  
**Prerequisites:** Active user account  
**Steps:**
1. Select user
2. Click "Deactivate"
3. Confirm action

**Expected Result:** User cannot login, existing session terminated  
**Actual Result:** _____________________  
**Status:** ☐

---

## ⚙️ System Settings (SETTINGS)

### TC-SETTINGS-001: Modify Reference Data
**Priority:** High  
**Role:** Admin/IT  
**Prerequisites:** Admin access  
**Steps:**
1. Navigate to Admin → System Settings → Reference Data
2. Select category (e.g., Document Types)
3. Add new entry or edit existing
4. Save changes

**Expected Result:** Reference data updated, available in dropdowns  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-SETTINGS-002: Configure SLA Timers
**Priority:** High  
**Role:** Admin/IT  
**Prerequisites:** Admin access  
**Steps:**
1. Navigate to System Configuration tab
2. Modify SLA hours for workflow stage
3. Save changes
4. Create test application to verify

**Expected Result:** New SLA applied to future applications  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-SETTINGS-003: Notification Settings
**Priority:** Medium  
**Role:** Admin/IT  
**Prerequisites:** Admin access  
**Steps:**
1. Navigate to Notification Settings
2. Toggle email/SMS notifications
3. Set quiet hours
4. Save preferences

**Expected Result:** Notifications sent according to settings  
**Actual Result:** _____________________  
**Status:** ☐

---

## 📈 Reporting & Analytics (REPORTS)

### TC-REPORTS-001: Dashboard Metrics Display
**Priority:** High  
**Role:** All  
**Prerequisites:** Applications exist in system  
**Steps:**
1. Navigate to Dashboard
2. Observe metrics cards (Total, Pending, Approved, Rejected)
3. Check workflow chart
4. View recent activities

**Expected Result:** All metrics show accurate real-time data  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-REPORTS-002: Export Applications to CSV
**Priority:** Medium  
**Role:** Admin/IT/Staff  
**Prerequisites:** Applications in list view  
**Steps:**
1. Navigate to Applications → List
2. Apply filters if needed
3. Click "Export" → "CSV"
4. Download and open file

**Expected Result:** CSV file contains all visible columns and data  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-REPORTS-003: Export Application to PDF
**Priority:** Medium  
**Role:** Admin/IT/Staff  
**Prerequisites:** Applications in list view  
**Steps:**
1. Select applications
2. Click "Export" → "PDF"
3. Download and review PDF

**Expected Result:** PDF formatted correctly with all application details  
**Actual Result:** _____________________  
**Status:** ☐

---

## 🔄 Bulk Operations (BULK)

### TC-BULK-001: Bulk Document Verification
**Priority:** High  
**Role:** Control/Admin  
**Prerequisites:** Multiple applications with documents  
**Steps:**
1. Select multiple applications
2. Click "Bulk Verify Documents"
3. Confirm action

**Expected Result:** All selected documents marked as verified  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-BULK-002: Bulk Status Update
**Priority:** Medium  
**Role:** Admin  
**Prerequisites:** Multiple applications  
**Steps:**
1. Select applications
2. Choose "Update Status"
3. Select new status
4. Confirm bulk update

**Expected Result:** All selected applications updated to new status  
**Actual Result:** _____________________  
**Status:** ☐

---

## 📱 Responsiveness (RESPONSIVE)

### TC-RESPONSIVE-001: Mobile View - Dashboard
**Priority:** High  
**Role:** Any  
**Prerequisites:** Mobile device or browser dev tools  
**Steps:**
1. Access dashboard on mobile viewport (< 768px)
2. Check layout adaptation
3. Test navigation menu toggle
4. Verify charts are readable

**Expected Result:** All elements adapt correctly, no horizontal scroll  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-RESPONSIVE-002: Tablet View - Forms
**Priority:** Medium  
**Role:** Front Office  
**Prerequisites:** Tablet viewport (768px - 1024px)  
**Steps:**
1. Open application intake form
2. Fill form fields
3. Upload documents
4. Submit form

**Expected Result:** Form is usable, buttons accessible, no layout breaks  
**Actual Result:** _____________________  
**Status:** ☐

---

## 🔒 Security (SECURITY)

### TC-SECURITY-001: Unauthorized Access Attempt
**Priority:** Critical  
**Role:** Front Office (testing as non-admin)  
**Prerequisites:** Non-admin user logged in  
**Steps:**
1. Attempt to access /admin/users directly via URL
2. Try to access admin-only menu items

**Expected Result:** Access denied, redirected or error shown  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-SECURITY-002: Data Isolation Between Users
**Priority:** Critical  
**Role:** Multiple users  
**Prerequisites:** Applications assigned to different users  
**Steps:**
1. Login as User A
2. Note visible applications
3. Logout and login as User B
4. Compare visible applications

**Expected Result:** Each user sees only authorized applications  
**Actual Result:** _____________________  
**Status:** ☐

---

### TC-SECURITY-003: Audit Log Creation
**Priority:** High  
**Role:** Admin  
**Prerequisites:** Admin access  
**Steps:**
1. Perform critical action (create user, approve application)
2. Check audit logs
3. Verify entry details

**Expected Result:** Action logged with timestamp, user, and details  
**Actual Result:** _____________________  
**Status:** ☐

---

## Test Summary
**Total Test Cases:** 45  
**Critical:** 22  
**High:** 15  
**Medium:** 7  
**Low:** 1  

**Execution Tracking:**
- Not Started: ☐ _____
- In Progress: 🔄 _____
- Passed: ✅ _____
- Failed: ❌ _____

**Overall Status:** ________________  
**Tested By:** ________________  
**Test Date:** ________________  
**Sign-off:** ________________
