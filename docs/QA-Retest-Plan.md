# 🧪 QA Retest Plan - Phase 2

## Overview
This document outlines the comprehensive QA retest plan following Phase 1 Critical Fixes. All modules must be validated before UAT deployment.

---

## ✅ Phase 1 Fixes to Validate

### Critical Fix #1: Notification Service
**Issue**: `allowedOrigins` undefined causing edge function failures  
**Fix**: Added `allowedOrigins` array to notification-service  
**Test Cases**:
1. Open browser console and verify no "Failed to fetch" errors
2. Navigate to `/admin/notifications` and verify notifications load
3. Test notification creation from any workflow action
4. Verify CORS headers in network tab (should show proper origin)

**Expected Result**: All notification API calls return 200 status, no CORS errors

---

### Critical Fix #2: Missing Route Registrations
**Issue**: 12 routes existed but were not registered in router  
**Fix**: Added all missing routes to `src/routes/index.tsx`  
**Affected Routes**:
- `/control/schedule` - Schedule Control Visit
- `/control/visit` - Control Visit
- `/control/visits` - Control Visits List
- `/reviews/technical` - Technical Review
- `/reviews/social` - Social Review  
- `/reviews/social/assessment` - Social Assessment
- `/reviews/archive` - Review Archive
- `/qa/dashboard` - QA Dashboard
- `/polish/security` - Security Polish
- `/polish/uat` - UAT Polish
- `/deployment/guide` - Deployment Guide
- `/security/final-validation` - Security Final Validation
- `/documentation/technical` - Technical Documentation
- `/documentation/user-guide` - User Guide
- `/monitoring/system-health` - System Health Monitoring

**Test Cases**:
1. Navigate to each route directly via URL
2. Verify page loads without 404 error
3. Verify role-based access control works
4. Check for console errors on page load

**Expected Result**: All routes accessible and render correctly

---

## 📋 Module-by-Module Test Plan

### 1. Dashboard Module
**Route**: `/dashboards`  
**Test Cases**:
- [ ] Dashboard loads with all metrics cards
- [ ] Recent activities display correctly
- [ ] Quick actions are clickable and functional
- [ ] Charts render with data
- [ ] System health indicators show correct status

**Validation Criteria**: All widgets load, no console errors, data displays correctly

---

### 2. Application Management
**Routes**: `/applications/intake`, `/applications/list`  
**Test Cases**:
- [ ] Create new application via intake form
- [ ] All form steps navigate correctly
- [ ] Document upload works (test with PDF, JPG)
- [ ] Application appears in list view
- [ ] Filtering and search work
- [ ] Edit existing application
- [ ] Delete application (admin only)

**Validation Criteria**: Full CRUD operations work, documents upload successfully, list filters correctly

---

### 3. Control Department
**Routes**: `/control/queue`, `/control/schedule`, `/control/visit`, `/control/visits`  
**Test Cases**:
- [ ] Queue displays applications awaiting control
- [ ] Schedule visit form works
- [ ] Visit page allows photo capture
- [ ] Technical assessment form saves
- [ ] Visits list shows all scheduled/completed visits
- [ ] Photo upload during visit works
- [ ] GPS/location capture works (if implemented)

**Validation Criteria**: Control workflow complete, photos upload, reports save

---

### 4. Reviews & Decisions
**Routes**: `/reviews/technical`, `/reviews/social`, `/reviews/social/assessment`, `/reviews/director`, `/reviews/minister`, `/reviews/archive`  
**Test Cases**:
- [ ] Technical review form loads and saves
- [ ] Social review form loads and saves  
- [ ] Social assessment captures all required fields
- [ ] Director can submit recommendations
- [ ] Minister can make final decisions
- [ ] Archive shows historical reviews
- [ ] Decision notifications sent correctly

**Validation Criteria**: All review stages work, decisions save, notifications trigger

---

### 5. User Management
**Route**: `/admin/users`  
**Test Cases**:
- [ ] User list displays all users
- [ ] Create new user with role assignment
- [ ] Edit user details and roles
- [ ] Deactivate/activate users
- [ ] Role changes reflect immediately
- [ ] Notification preferences can be set
- [ ] User search and filtering work

**Validation Criteria**: User CRUD operations work, roles enforce correctly

---

### 6. System Settings
**Routes**: `/admin/settings`, `/admin/notification-preferences`  
**Test Cases**:
- [ ] Reference data management works
- [ ] System configuration saves
- [ ] Database maintenance tools accessible
- [ ] Notification preferences update
- [ ] Settings changes persist after logout/login

**Validation Criteria**: All settings save and persist correctly

---

### 7. Workflow Management
**Routes**: `/workflow/validation`, `/workflow/testing`, `/workflow/monitoring`  
**Test Cases**:
- [ ] Workflow validation shows current state
- [ ] Workflow testing tools functional
- [ ] Monitoring displays real-time status
- [ ] State transitions logged correctly
- [ ] SLA timers display accurately

**Validation Criteria**: Workflow engine operates correctly, monitoring is accurate

---

### 8. Testing & QA
**Routes**: `/testing/integration`, `/testing/end-to-end`, `/testing/system-validation`, `/testing/uat-preparation`, `/qa/dashboard`  
**Test Cases**:
- [ ] Integration test dashboard loads
- [ ] Test runners execute correctly
- [ ] Test results display accurately
- [ ] End-to-end scenarios complete
- [ ] UAT preparation checklist works
- [ ] QA dashboard shows all metrics

**Validation Criteria**: All testing tools functional, results accurate

---

### 9. Security Tools
**Routes**: `/security/scanning`, `/security/monitoring`, `/security/hardening`, `/security/penetration`, `/security/final-validation`  
**Test Cases**:
- [ ] Security scanner runs and reports issues
- [ ] Security monitoring dashboard updates
- [ ] Hardening recommendations display
- [ ] Penetration testing tools accessible
- [ ] Final validation checklist complete
- [ ] No critical vulnerabilities reported

**Validation Criteria**: Security tools operational, scan results accurate

---

### 10. System Monitoring
**Route**: `/monitoring/system-health`  
**Test Cases**:
- [ ] System health metrics display
- [ ] Performance indicators accurate
- [ ] Database connection status shown
- [ ] Edge function health checks pass
- [ ] Real-time updates work
- [ ] Alert thresholds configurable

**Validation Criteria**: All health metrics accurate, alerts functional

---

### 11. Deployment Tools
**Routes**: `/deployment/readiness`, `/deployment/guide`  
**Test Cases**:
- [ ] Readiness checker runs all validations
- [ ] Deployment guide displays correctly
- [ ] Pre-deployment checklist complete
- [ ] Production configuration verified
- [ ] Rollback procedures documented

**Validation Criteria**: Deployment readiness confirmed, guides accessible

---

### 12. Documentation
**Routes**: `/documentation/technical`, `/documentation/user-guide`, `/polish/documentation`  
**Test Cases**:
- [ ] Technical documentation displays
- [ ] User guide accessible and readable
- [ ] Search functionality works
- [ ] Code examples render correctly
- [ ] Documentation is up-to-date

**Validation Criteria**: All documentation accessible and current

---

### 13. Polish Modules
**Routes**: `/polish/overview`, `/polish/performance`, `/polish/ux-enhancement`, `/polish/production-readiness`, `/polish/security`, `/polish/uat`  
**Test Cases**:
- [ ] Polish overview shows status
- [ ] Performance optimization tools work
- [ ] UX enhancement checklist complete
- [ ] Production readiness validated
- [ ] Security polish items addressed
- [ ] UAT preparation complete

**Validation Criteria**: All polish items checked and validated

---

## 🔍 Cross-Module Integration Tests

### Authentication Flow
- [ ] Login with valid credentials
- [ ] Logout and verify session cleared
- [ ] Role-based access enforced across all routes
- [ ] Unauthorized access redirects correctly
- [ ] Session persistence works

### Notification System
- [ ] Notifications trigger on workflow actions
- [ ] Email notifications sent (check logs)
- [ ] In-app notifications display
- [ ] Notification preferences respected
- [ ] Read/unread status updates

### Data Consistency
- [ ] Application data consistent across modules
- [ ] User data updates reflect everywhere
- [ ] Document references valid across views
- [ ] Workflow state accurate in all dashboards

---

## 🎯 Acceptance Criteria

### Critical (Must Pass)
- ✅ No 404 errors on any registered route
- ✅ No console errors on page load
- ✅ No failed network requests (401/500)
- ✅ All CRUD operations functional
- ✅ Authentication and authorization working
- ✅ Notification service operational

### High Priority (Should Pass)
- ⚠️ All forms validate correctly
- ⚠️ File uploads work consistently
- ⚠️ Search and filtering accurate
- ⚠️ Real-time updates functional
- ⚠️ Role-based UI rendering correct

### Medium Priority (Nice to Have)
- 📝 Performance optimizations applied
- 📝 UI/UX consistency across modules
- 📝 Responsive design on mobile
- 📝 Loading states implemented
- 📝 Error messages user-friendly

---

## 🚦 Test Execution Plan

### Day 1: Core Functionality
**Focus**: Dashboard, Applications, Control  
**Time**: 4 hours  
**Tester Roles**: Admin, Control

### Day 2: Reviews & Decisions
**Focus**: All review workflows  
**Time**: 4 hours  
**Tester Roles**: Staff, Director, Minister

### Day 3: Administration & Settings
**Focus**: User management, settings, security  
**Time**: 3 hours  
**Tester Roles**: Admin, IT

### Day 4: Testing & Monitoring Tools
**Focus**: QA tools, monitoring, deployment  
**Time**: 3 hours  
**Tester Roles**: IT, Admin

### Day 5: Integration & Regression
**Focus**: Cross-module workflows, edge cases  
**Time**: 4 hours  
**Tester Roles**: All roles

---

## 📊 Test Results Template

### Module Test Report
```markdown
## Module: [Name]
**Date**: [YYYY-MM-DD]  
**Tester**: [Name]  
**Role**: [Role Used]

### Test Results
- Total Test Cases: [X]
- Passed: [X]
- Failed: [X]
- Blocked: [X]

### Failed Cases
1. [Test Case] - [Description of failure]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]
   - Severity: [Critical/High/Medium/Low]
   - Screenshot: [Link/Attachment]

### Blockers
1. [Description] - [Impact]

### Notes
[Any additional observations]
```

---

## 🐛 Bug Reporting Template

```markdown
## Bug Report: [Short Title]
**Severity**: [Critical/High/Medium/Low]  
**Module**: [Module Name]  
**Route**: [URL Path]  
**User Role**: [Role Testing As]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Console Errors
```
[Paste console errors if any]
```

### Network Logs
[Any failed requests with status codes]

### Screenshots
[Attach screenshots]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]
- Device: [Desktop/Mobile]
```

---

## ✅ Sign-off Checklist

### Technical QA Lead
- [ ] All critical tests passed
- [ ] No blocking bugs remaining
- [ ] Performance benchmarks met
- [ ] Security scans clean
- [ ] Documentation complete

### Product Owner
- [ ] User workflows validated
- [ ] Business logic correct
- [ ] UI/UX acceptable
- [ ] Ready for UAT

### System Administrator
- [ ] Deployment readiness verified
- [ ] Backup/restore tested
- [ ] Monitoring configured
- [ ] Access controls validated

---

## 🎉 UAT Readiness Gate

**System is ready for UAT when**:
1. ✅ All critical acceptance criteria met
2. ✅ No critical or high-severity bugs open
3. ✅ All modules accessible and functional
4. ✅ Security validation passed
5. ✅ Performance benchmarks achieved
6. ✅ Documentation complete
7. ✅ Stakeholder sign-offs obtained

**Current Status**: 🟡 In Progress  
**Target Date**: [TBD]  
**UAT Start Date**: [TBD after QA completion]

---

## 📞 Support & Escalation

**QA Team Lead**: [Contact]  
**Technical Lead**: [Contact]  
**Bug Priority**: Critical → Immediate, High → Same day, Medium → 2 days, Low → Sprint  
**Communication**: Slack #ims-qa-testing
