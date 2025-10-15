# UAT Data Seeding Test Guide

## 🎯 Objective
Test the test-data-seeding Edge Function to ensure it properly creates, manages, and cleans up test data for User Acceptance Testing.

---

## 📋 Prerequisites

### ✅ Required Access
- Must be signed in as **Admin** or **IT** role
- Edge function `test-data-seeding` must be deployed

### ✅ Navigation
1. Sign in to the IMS Admin system
2. Navigate to: `/testing/uat-preparation`
3. Click on the **"Test Data Seeding"** tab

---

## 🧪 TEST PROCEDURE

### Test 1: Seed Test Data ✅

**Expected Behavior:**
- Creates 3 test applicants with diverse profiles
- Creates 3 applications in different workflow states
- Creates 1 control visit (scheduled)
- Creates 1 technical report
- Creates 1 social report

**Steps:**

1. **Click "Seed Test Data" Button**
   - Button should show loading state: "Seeding..."
   - Process should take 2-5 seconds

2. **Verify Success Toast**
   - ✅ Success message should appear: "Test data seeded: 3 applicants, 3 applications"
   - ✅ Checklist items under "Test Data" should turn green (Pass)

3. **Verify Data in Database**
   
   Navigate to **Applications List** (`/applications/list`) and verify:
   
   | Application # | Applicant | State | District | Amount |
   |--------------|-----------|-------|----------|---------|
   | APP-2024-TEST-001 | Jan de Vries | INTAKE_REVIEW | Paramaribo | SRD 15,000 |
   | APP-2024-TEST-002 | Maria Santos | CONTROL_ASSIGN | Wanica | SRD 12,000 |
   | APP-2024-TEST-003 | Ravi Sharma | TECHNICAL_REVIEW | Nickerie | SRD 18,000 |

4. **Verify Control Visit**
   
   Navigate to **Control Queue** (`/control/queue`) and verify:
   - ✅ 1 control visit for Maria Santos (APP-2024-TEST-002)
   - ✅ Status: SCHEDULED
   - ✅ Visit Type: TECHNICAL_INSPECTION
   - ✅ Scheduled for ~3 days from now

5. **Verify Technical Report**
   
   Navigate to **Technical Reviews** (`/reviews/technical`) and verify:
   - ✅ 1 technical report for Ravi Sharma (APP-2024-TEST-003)
   - ✅ Foundation: NEEDS_REPAIR
   - ✅ Roof: NEEDS_REPLACEMENT
   - ✅ Estimated Cost: SRD 18,000
   - ✅ Urgency: High (1)

6. **Verify Social Report**
   
   Navigate to **Social Reviews** (`/reviews/social`) and verify:
   - ✅ 1 social report for Ravi Sharma (APP-2024-TEST-003)
   - ✅ Vulnerability Score: 7/10
   - ✅ Priority Level: 1 (High)
   - ✅ Recommendation mentions maximum subsidy

---

### Test 2: Idempotency (Re-run Seeding) 🔄

**Expected Behavior:**
- Re-running seed should NOT create duplicates
- Should update existing records instead (upsert behavior)

**Steps:**

1. **Click "Seed Test Data" Again**
   - Process should complete successfully
   - Success message should appear

2. **Verify No Duplicates**
   - Navigate to Applications List
   - ✅ Should still show only 3 TEST applications
   - ✅ Application numbers should remain: APP-2024-TEST-001, 002, 003
   - ❌ Should NOT see: APP-2024-TEST-004, 005, etc.

3. **Check Database Count**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT COUNT(*) FROM applicants WHERE national_id LIKE 'TEST-%';
   -- Expected: 3
   
   SELECT COUNT(*) FROM applications WHERE application_number LIKE 'APP-2024-TEST-%';
   -- Expected: 3
   ```

---

### Test 3: Cleanup Test Data 🧹

**Expected Behavior:**
- Removes ALL test data created by the seeding function
- Cascading deletes remove related records

**Steps:**

1. **Click "Cleanup Test Data" Button**
   - Button should show loading state: "Cleaning..."
   - Process should take 1-3 seconds

2. **Verify Success Toast**
   - ✅ Success message: "Test data cleaned up successfully"
   - ✅ Checklist should reset to "Pending" status

3. **Verify Applications Removed**
   - Navigate to Applications List
   - ✅ APP-2024-TEST-001, 002, 003 should be GONE
   - ✅ No test applications should appear

4. **Verify Applicants Removed**
   - Check that Jan de Vries, Maria Santos, Ravi Sharma are removed
   - ✅ No applicants with "TEST-" national IDs

5. **Verify Related Data Removed**
   - Control visits for test applications: REMOVED ✅
   - Technical reports for test applications: REMOVED ✅
   - Social reports for test applications: REMOVED ✅

6. **Database Verification**
   ```sql
   -- All should return 0
   SELECT COUNT(*) FROM applicants WHERE national_id LIKE 'TEST-%';
   SELECT COUNT(*) FROM applications WHERE application_number LIKE 'APP-2024-TEST-%';
   SELECT COUNT(*) FROM control_visits WHERE application_id IN 
     (SELECT id FROM applications WHERE application_number LIKE 'APP-2024-TEST-%');
   ```

---

### Test 4: Authorization Check 🔒

**Expected Behavior:**
- Only Admin and IT roles can seed/cleanup
- Other roles should receive authorization error

**Steps:**

1. **Test with Unauthorized Role**
   - Sign out
   - Sign in as **Staff** or **Front Office** user
   - Navigate to `/testing/uat-preparation`
   - ✅ Should see "Access Denied" or be redirected
   - OR: If page loads, clicking "Seed Test Data" should fail with authorization error

2. **Error Message**
   - ❌ Expected error: "Only admin/IT can seed test data"
   - ✅ Toast error should appear
   - ✅ No data should be created

---

### Test 5: Edge Function Logging 📊

**Expected Behavior:**
- Edge function logs successful operations
- Errors are captured in logs

**Steps:**

1. **Seed Test Data**
   - Complete seeding operation

2. **Check Edge Function Logs**
   - Open Supabase Dashboard
   - Navigate to: Edge Functions → `test-data-seeding` → Logs
   - ✅ Should see recent invocation
   - ✅ Status: 200 (success)
   - ✅ Response shows data counts

3. **Verify Log Contents**
   ```json
   {
     "success": true,
     "message": "Test data seeded successfully",
     "data": {
       "applicants": 3,
       "applications": 3,
       "controlVisits": 1,
       "technicalReports": 1,
       "socialReports": 1
     }
   }
   ```

---

## 📊 TEST DATA SPECIFICATION

### Applicants Created

| Field | Applicant 1 | Applicant 2 | Applicant 3 |
|-------|------------|------------|------------|
| **National ID** | TEST-001-2024 | TEST-002-2024 | TEST-003-2024 |
| **Name** | Jan de Vries | Maria Santos | Ravi Sharma |
| **DOB** | 1980-05-15 | 1975-08-22 | 1982-03-10 |
| **Marital Status** | MARRIED | SINGLE | MARRIED |
| **Phone** | +597-8123456 | +597-8234567 | +597-8345678 |
| **Email** | jan.devries@test.sr | maria.santos@test.sr | ravi.sharma@test.sr |
| **District** | Paramaribo | Wanica | Nickerie |
| **Employment** | EMPLOYED | SELF_EMPLOYED | EMPLOYED |
| **Income** | SRD 3,500 | SRD 2,800 | SRD 4,200 |
| **Household Size** | 4 | 3 | 5 |
| **Children** | 2 | 2 | 3 |

### Applications Created

| Field | App 1 | App 2 | App 3 |
|-------|-------|-------|-------|
| **Number** | APP-2024-TEST-001 | APP-2024-TEST-002 | APP-2024-TEST-003 |
| **Applicant** | Jan de Vries | Maria Santos | Ravi Sharma |
| **State** | INTAKE_REVIEW | CONTROL_ASSIGN | TECHNICAL_REVIEW |
| **Property** | Teststraat 1 | Testweg 45 | Testlaan 78 |
| **District** | Paramaribo | Wanica | Nickerie |
| **Title Type** | EIGENDOM | ERFPACHT | EIGENDOM |
| **Area (m²)** | 180.50 | 150.00 | 200.00 |
| **Requested** | SRD 15,000 | SRD 12,000 | SRD 18,000 |
| **Priority** | 2 (Medium) | 3 (Normal) | 1 (High) |
| **Reason** | Roof replacement & foundation | Sanitation improvement | Full renovation after storm |

---

## ✅ SUCCESS CRITERIA

### Required Outcomes

| Test | Criteria | Pass/Fail |
|------|----------|-----------|
| **Seed Data** | 3 applicants created | [ ] |
| **Seed Data** | 3 applications created | [ ] |
| **Seed Data** | 1 control visit scheduled | [ ] |
| **Seed Data** | 1 technical report exists | [ ] |
| **Seed Data** | 1 social report exists | [ ] |
| **Idempotency** | Re-running doesn't duplicate | [ ] |
| **Cleanup** | All test applicants removed | [ ] |
| **Cleanup** | All test applications removed | [ ] |
| **Cleanup** | Related data cascade deleted | [ ] |
| **Authorization** | Staff/Front Office blocked | [ ] |
| **Logging** | Operations logged correctly | [ ] |

### Overall Assessment

- **All Tests Pass (11/11)**: ✅ READY FOR UAT
- **1-2 Tests Fail**: 🟡 MINOR ISSUES - Fix and retest
- **3+ Tests Fail**: 🔴 CRITICAL - Review edge function

---

## 🐛 TROUBLESHOOTING

### Issue: "Unauthorized" Error

**Symptoms:**
- Error message: "Unauthorized"
- No data created

**Solutions:**
1. Verify you're signed in as Admin or IT
2. Check user_roles table for active role
3. Verify edge function authentication

### Issue: Duplicate Records Created

**Symptoms:**
- Multiple applicants with same national_id
- Applications numbered TEST-004, 005, etc.

**Solutions:**
1. Check `upsert` is using correct conflict resolution
2. Verify `onConflict` parameter: `'national_id'` for applicants
3. Verify `onConflict` parameter: `'application_number'` for applications

### Issue: Cleanup Doesn't Remove Data

**Symptoms:**
- Test data still visible after cleanup
- Count queries return non-zero

**Solutions:**
1. Check RLS policies allow deletion
2. Verify cascading foreign key relationships
3. Check edge function uses service role key

### Issue: Missing Related Records

**Symptoms:**
- Applications exist but no control visits
- Applications exist but no reports

**Solutions:**
1. Check foreign key references are correct
2. Verify application IDs match after upsert
3. Review edge function logic for sequential creates

---

## 🔗 RELATED RESOURCES

- **Edge Function:** `supabase/functions/test-data-seeding/index.ts`
- **UI Component:** `src/app/(admin)/testing/uat-preparation/page.tsx`
- **Database Schema:** Applicants, Applications, Control Visits, Reports tables
- **Supabase Dashboard:** Edge Functions → test-data-seeding

---

## 📝 TEST REPORT TEMPLATE

```markdown
## UAT Data Seeding Test Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Development/Staging]

### Test Results
- [ ] Seed Test Data: PASS / FAIL
- [ ] Idempotency Check: PASS / FAIL
- [ ] Cleanup Test Data: PASS / FAIL
- [ ] Authorization Check: PASS / FAIL
- [ ] Edge Function Logging: PASS / FAIL

### Issues Found
1. [Description of issue 1]
2. [Description of issue 2]

### Recommendations
- [Any recommendations for improvement]

### Overall Status
✅ READY FOR UAT / 🔴 NEEDS FIXES
```
