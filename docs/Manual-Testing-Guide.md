# Manual Route Testing Guide — All Roles

## 🎯 Testing Objective
Verify that all routes are accessible to appropriate roles and that unauthorized access is properly blocked.

---

## 📋 PRE-TESTING SETUP

### Step 1: Create Test Users for Each Role

Use the **User Management** page (`/admin/users`) to create test accounts:

| Role | Email | Purpose |
|------|-------|---------|
| Admin | admin.test@dvh.sr | Full system access |
| IT | it.test@dvh.sr | Technical administration |
| Staff | staff.test@dvh.sr | Application management |
| Front Office | frontoffice.test@dvh.sr | Intake processing |
| Control | control.test@dvh.sr | Inspections & visits |
| Director | director.test@dvh.sr | Final review & recommendations |
| Minister | minister.test@dvh.sr | Final decisions |

**Password for all test accounts:** `TestUser2025!`

### Step 2: Seed Test Data (Optional)

Navigate to `/testing/uat-preparation` and click **"Seed Test Data"** to populate:
- Sample applicants
- Applications in various states
- Control visits
- Technical & social reports

---

## 🧪 MANUAL TESTING PROCEDURE

### Testing Method

For **each role**, perform the following:

1. **Sign Out** (if currently signed in)
2. **Sign In** using the test account for that role
3. **Navigate** to each route listed in the checklist below
4. **Verify** the expected behavior:
   - ✅ **PASS**: Page loads successfully with appropriate content
   - ❌ **FAIL**: Access denied, error, or unexpected redirect
   - 🔒 **BLOCKED**: Correctly denied access (expected for unauthorized roles)
5. **Record** results in the checklist

---

## 🗺️ ROUTE TESTING CHECKLIST

### 1️⃣ ADMIN ROLE (Full Access Expected)

**Test Account:** `admin.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | ✅ Intake form accessible | [ ] |
| `/applications/list` | ✅ Application list loads | [ ] |
| `/control/queue` | ✅ Control queue visible | [ ] |
| `/control/schedule` | ✅ Schedule management | [ ] |
| `/control/visit` | ✅ Visit form accessible | [ ] |
| `/reviews/technical` | ✅ Technical review page | [ ] |
| `/reviews/social` | ✅ Social review page | [ ] |
| `/reviews/director` | ✅ Director dashboard | [ ] |
| `/reviews/minister` | ✅ Minister dashboard | [ ] |
| `/admin/users` | ✅ User management | [ ] |
| `/admin/settings` | ✅ System settings | [ ] |
| `/monitoring/system-health` | ✅ Monitoring dashboard | [ ] |
| `/testing/system-validation` | ✅ Testing tools | [ ] |
| `/testing/uat-preparation` | ✅ UAT tools | [ ] |

---

### 2️⃣ IT ROLE (Technical Administration)

**Test Account:** `it.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | ✅ Intake form accessible | [ ] |
| `/applications/list` | ✅ Application list loads | [ ] |
| `/control/queue` | ✅ Control queue visible | [ ] |
| `/control/schedule` | ✅ Schedule management | [ ] |
| `/control/visit` | ✅ Visit form accessible | [ ] |
| `/reviews/technical` | ✅ Technical review page | [ ] |
| `/reviews/social` | ✅ Social review page | [ ] |
| `/reviews/director` | 🔒 Should be blocked | [ ] |
| `/reviews/minister` | 🔒 Should be blocked | [ ] |
| `/admin/users` | ✅ User management | [ ] |
| `/admin/settings` | ✅ System settings | [ ] |
| `/monitoring/system-health` | ✅ Monitoring dashboard | [ ] |
| `/testing/system-validation` | ✅ Testing tools | [ ] |

---

### 3️⃣ STAFF ROLE (Application Management)

**Test Account:** `staff.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | ✅ Intake form accessible | [ ] |
| `/applications/list` | ✅ Application list loads | [ ] |
| `/control/queue` | 🔒 Should be blocked | [ ] |
| `/control/schedule` | 🔒 Should be blocked | [ ] |
| `/control/visit` | 🔒 Should be blocked | [ ] |
| `/reviews/technical` | ✅ Can view reports | [ ] |
| `/reviews/social` | ✅ Can view reports | [ ] |
| `/reviews/director` | 🔒 Should be blocked | [ ] |
| `/reviews/minister` | 🔒 Should be blocked | [ ] |
| `/admin/users` | 🔒 Should be blocked | [ ] |
| `/admin/settings` | 🔒 Should be blocked | [ ] |

---

### 4️⃣ FRONT OFFICE ROLE (Intake Only)

**Test Account:** `frontoffice.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | ✅ Intake form accessible | [ ] |
| `/applications/list` | ✅ Application list loads | [ ] |
| `/control/queue` | 🔒 Should be blocked | [ ] |
| `/control/schedule` | 🔒 Should be blocked | [ ] |
| `/control/visit` | 🔒 Should be blocked | [ ] |
| `/reviews/technical` | 🔒 Should be blocked | [ ] |
| `/reviews/social` | 🔒 Should be blocked | [ ] |
| `/reviews/director` | 🔒 Should be blocked | [ ] |
| `/reviews/minister` | 🔒 Should be blocked | [ ] |
| `/admin/users` | 🔒 Should be blocked | [ ] |

---

### 5️⃣ CONTROL ROLE (Inspection Department)

**Test Account:** `control.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | 🔒 Should be blocked | [ ] |
| `/applications/list` | ✅ Can view applications | [ ] |
| `/control/queue` | ✅ Control queue visible | [ ] |
| `/control/schedule` | ✅ Schedule management | [ ] |
| `/control/visit` | ✅ Visit form accessible | [ ] |
| `/reviews/technical` | ✅ Can submit reports | [ ] |
| `/reviews/social` | 🔒 Should be blocked | [ ] |
| `/reviews/director` | 🔒 Should be blocked | [ ] |
| `/reviews/minister` | 🔒 Should be blocked | [ ] |
| `/admin/users` | 🔒 Should be blocked | [ ] |

---

### 6️⃣ DIRECTOR ROLE (DVH Director Review)

**Test Account:** `director.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | 🔒 Should be blocked | [ ] |
| `/applications/list` | ✅ Can view applications | [ ] |
| `/control/queue` | 🔒 Should be blocked | [ ] |
| `/control/visit` | 🔒 Should be blocked | [ ] |
| `/reviews/technical` | ✅ Can view reports | [ ] |
| `/reviews/social` | ✅ Can view reports | [ ] |
| `/reviews/director` | ✅ Director dashboard | [ ] |
| `/reviews/minister` | 🔒 Should be blocked | [ ] |
| `/admin/users` | 🔒 Should be blocked | [ ] |

---

### 7️⃣ MINISTER ROLE (Final Decision Authority)

**Test Account:** `minister.test@dvh.sr`

| Route | Expected Result | Status |
|-------|----------------|--------|
| `/admin/dashboards` | ✅ Dashboard loads | [ ] |
| `/applications/intake` | 🔒 Should be blocked | [ ] |
| `/applications/list` | ✅ Can view applications | [ ] |
| `/control/queue` | 🔒 Should be blocked | [ ] |
| `/control/visit` | 🔒 Should be blocked | [ ] |
| `/reviews/technical` | ✅ Can view reports | [ ] |
| `/reviews/social` | ✅ Can view reports | [ ] |
| `/reviews/director` | ✅ Can view recommendations | [ ] |
| `/reviews/minister` | ✅ Minister dashboard | [ ] |
| `/admin/users` | 🔒 Should be blocked | [ ] |

---

## 🔍 AUTOMATED TESTING OPTION

### Use System Validation Page

Navigate to `/testing/system-validation` while logged in as **Admin** or **IT**:

1. Click **"Run All Route Tests"**
2. Watch automated navigation through all routes
3. Review pass/fail results
4. Check console errors if any failures occur

---

## 📊 EXPECTED RESULTS SUMMARY

| Role | Total Routes | Should Pass | Should Block |
|------|-------------|-------------|--------------|
| Admin | 15 | 15 | 0 |
| IT | 14 | 12 | 2 |
| Staff | 12 | 7 | 5 |
| Front Office | 11 | 3 | 8 |
| Control | 11 | 6 | 5 |
| Director | 10 | 5 | 5 |
| Minister | 10 | 6 | 4 |

---

## ✅ COMPLETION CHECKLIST

- [ ] All 7 test user accounts created
- [ ] Test data seeded (if needed)
- [ ] Admin role testing completed (15/15 routes)
- [ ] IT role testing completed (14/14 routes)
- [ ] Staff role testing completed (12/12 routes)
- [ ] Front Office role testing completed (11/11 routes)
- [ ] Control role testing completed (11/11 routes)
- [ ] Director role testing completed (10/10 routes)
- [ ] Minister role testing completed (10/10 routes)
- [ ] All failures documented and resolved
- [ ] Automated testing completed (optional)

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Issue:** Access denied when it should be allowed
- **Check:** User role assignment in `/admin/users`
- **Verify:** RLS policies in database
- **Solution:** Re-assign role or update RoleGuard configuration

**Issue:** Infinite redirect loops
- **Check:** Browser console for redirect detection warnings
- **Solution:** Clear browser cache and localStorage

**Issue:** 404 Not Found
- **Check:** Route definition in `src/routes/router.tsx`
- **Verify:** Component path in route configuration

---

## 📝 REPORTING

### Test Report Template

```markdown
## Manual Route Testing Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Development/Staging]

### Summary
- Total Routes Tested: X
- Passed: X
- Failed: X
- Blocked (Expected): X

### Failures
1. [Route] - [Role] - [Description]
2. [Route] - [Role] - [Description]

### Notes
- [Any observations or recommendations]
```

---

## 🚀 NEXT STEPS AFTER TESTING

1. ✅ Document all failures
2. 🔧 Fix identified issues
3. 🔄 Re-test failed routes
4. 📊 Generate final UAT report
5. ✅ Mark Phase 2 testing complete
