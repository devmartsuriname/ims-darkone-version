# Auth Stabilization Testing Guide

**Version:** v0.15.6  
**Purpose:** Comprehensive test cases for authentication stabilization (Phase 7)  
**Status:** Ready for Execution

---

## 🎯 Test Objectives

Validate that the 6-phase authentication stabilization successfully resolves:
1. Infinite loading states
2. Slow RLS queries
3. Editor preview delays
4. Lack of error recovery
5. Poor logging visibility

---

## 📋 Test Environment Setup

### Prerequisites
- [ ] Fresh browser session (incognito/private mode recommended)
- [ ] DevTools open (F12) with Console and Network tabs visible
- [ ] Clear browser cache and localStorage before starting
- [ ] Stable internet connection
- [ ] Access to both editor preview and live deployment

### Environment Configuration

**Testing URLs:**
- **Live:** https://your-production-domain.com
- **Editor Preview:** https://lovableproject.com/projects/your-project-id
- **Staging:** https://your-staging-domain.lovable.app

**Logging Configuration (.env):**
```env
VITE_LOG_LEVEL=debug
VITE_LOG_AUTH=true
VITE_LOG_ROUTE=true
VITE_LOG_SETUP=true
VITE_LOG_WORKFLOW=false
VITE_LOG_CACHE=false
VITE_LOG_SYSTEM=true
```

---

## 🧪 Test Case 1: Fresh Page Load (Root Path)

### Objective
Verify dashboard loads quickly on first visit with no cached data.

### Prerequisites
```javascript
// Clear all storage in DevTools console
localStorage.clear()
sessionStorage.clear()
// Clear cookies manually or use DevTools → Application → Cookies → Clear All
```

### Steps
1. Close all browser tabs
2. Open fresh incognito/private window
3. Navigate to `/`
4. Start timer when page begins loading
5. Observe loading behavior
6. Stop timer when dashboard content appears

### Expected Results
- ✅ Page loads in **≤5 seconds**
- ✅ No console errors
- ✅ Console shows auth logs:
  ```
  [AUTH] Initializing authentication context
  [AUTH] Initial session check: No session
  ```
- ✅ Redirects to `/auth/sign-in`
- ✅ No infinite spinner

### Actual Results
| Run | Load Time | Console Errors | Result |
|-----|-----------|----------------|--------|
| 1   |           |                | ⬜ PASS / ⬜ FAIL |
| 2   |           |                | ⬜ PASS / ⬜ FAIL |
| 3   |           |                | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 2: Protected Route Direct Access

### Objective
Verify protected routes load quickly when accessing directly via URL.

### Prerequisites
- User must be logged in
- Clear page cache but preserve auth session

### Steps
1. Log in to application
2. Copy protected route URL (e.g., `/admin/users`)
3. Open new tab
4. Paste URL and press Enter
5. Start timer
6. Observe loading behavior
7. Stop timer when page content appears

### Expected Results
- ✅ Page loads in **≤3 seconds**
- ✅ No infinite loading spinner
- ✅ Console shows:
  ```
  [AUTH] Session found - initializing user data
  [ROUTE] ProtectedRoute check - Path: /admin/users
  [AUTH] User data loaded successfully
  ```
- ✅ User list displays correctly
- ✅ No redirect to login page

### Actual Results
| Route | Load Time | Console Logs | Result |
|-------|-----------|--------------|--------|
| /admin/users | | | ⬜ PASS / ⬜ FAIL |
| /dashboards | | | ⬜ PASS / ⬜ FAIL |
| /control/queue | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 3: Logout → Login Flow

### Objective
Verify seamless logout and re-login with proper redirects.

### Steps
1. From authenticated dashboard
2. Click "Sign Out" button
3. Observe redirect behavior
4. Enter valid credentials on sign-in page
5. Click "Sign In"
6. Start timer
7. Observe redirect and dashboard load
8. Stop timer when dashboard content appears

### Expected Results
- ✅ Logout redirects to `/auth/sign-in` immediately
- ✅ No blank screen during logout
- ✅ Login completes in **≤3 seconds**
- ✅ Redirects to `/dashboards` after login
- ✅ Console shows:
  ```
  [AUTH] Sign out initiated
  [AUTH] Sign out successful
  [AUTH] Sign in successful
  [AUTH] User data loaded successfully
  ```
- ✅ Dashboard metrics load correctly

### Actual Results
| Attempt | Logout Time | Login Time | Redirect | Result |
|---------|-------------|------------|----------|--------|
| 1 | | | | ⬜ PASS / ⬜ FAIL |
| 2 | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 4: Editor Preview Mode

### Objective
Verify editor preview uses mock authentication and loads quickly.

### Prerequisites
- Access to Lovable editor
- Project must be open in editor

### Steps
1. Open project in Lovable editor
2. Navigate to Preview tab
3. Start timer
4. Observe loading behavior
5. Check console for editor detection log
6. Stop timer when dashboard appears
7. Verify mock data is being used

### Expected Results
- ✅ Preview loads in **≤3 seconds**
- ✅ Console shows:
  ```
  🧪 [AUTH] Editor preview detected – using mock roles
  ```
- ✅ Mock profile appears:
  - Name: "Preview User"
  - Role: ADMIN
- ✅ Full dashboard access available
- ✅ No real database queries for profile/roles

### Actual Results
| Test | Load Time | Mock Detection | Mock Data | Result |
|------|-----------|----------------|-----------|--------|
| 1 | | | | ⬜ PASS / ⬜ FAIL |
| 2 | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 5: Live Production Environment

### Objective
Verify production uses real authentication (no mock data).

### Prerequisites
- Deployed to production domain
- Access to production URL

### Steps
1. Navigate to production URL
2. Observe authentication flow
3. Check console for environment detection
4. Verify real user data is loaded
5. Compare with editor preview behavior

### Expected Results
- ✅ No "Editor preview detected" message
- ✅ Real profile data from database
- ✅ Real roles from `user_roles` table
- ✅ Console shows:
  ```
  [AUTH] Fetching user data for ID: <real-uuid>
  [AUTH] User data loaded successfully
  ```
- ✅ Load time **≤5 seconds** (first load)

### Actual Results
| Environment | Load Time | Real Data | Console Logs | Result |
|-------------|-----------|-----------|--------------|--------|
| Production | | | | ⬜ PASS / ⬜ FAIL |
| Staging | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 6: Network Delay Simulation

### Objective
Verify timeout mechanisms trigger correctly under poor network conditions.

### Prerequisites
- Chrome DevTools or Firefox DevTools

### Steps
1. Open DevTools → Network tab
2. Select throttling: **Slow 3G**
3. Reload application
4. Start timer
5. Observe console warnings
6. Check for timeout logs
7. Verify app eventually loads or shows recovery UI

### Expected Results
- ✅ After 8 seconds, console shows:
  ```
  ⚠️ [AUTH] Timeout after 8s, forcing continue
  ```
- ✅ After 10 seconds, console shows:
  ```
  ⚠️ [AUTH] Force-stopping loading after 10 seconds
  ```
- ✅ Loading state ends (spinner disappears)
- ✅ Either app loads or recovery UI appears
- ✅ No permanent freeze

### Actual Results
| Throttle | 8s Timeout | 10s Timeout | Recovery | Result |
|----------|------------|-------------|----------|--------|
| Slow 3G | | | | ⬜ PASS / ⬜ FAIL |
| Offline (delayed) | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 7: Recovery UI Trigger

### Objective
Verify AuthLoadingBoundary recovery UI appears and functions correctly.

### Prerequisites
- DevTools with Network request blocking capability

### Steps
1. Open DevTools → Network tab
2. Add request blocking pattern:
   ```
   *supabase.co/rest/v1/profiles*
   *supabase.co/rest/v1/user_roles*
   ```
3. Reload application
4. Start 12-second timer
5. Observe loading behavior
6. Check for recovery UI after 12 seconds
7. Test both recovery options

### Expected Results
- ✅ Loading spinner shows for 12 seconds
- ✅ Console shows:
  ```
  ⛔ [SYSTEM] Force-stopping loading after 12 seconds
  ```
- ✅ Recovery UI appears with:
  - Warning icon
  - "Loading Timeout" heading
  - Explanation message
  - "Reload Application" button
  - "Continue Anyway" button
- ✅ "Reload Application" triggers full page refresh
- ✅ "Continue Anyway" dismisses recovery UI and renders app

### Actual Results
| Attempt | 12s Trigger | UI Display | Reload Works | Continue Works | Result |
|---------|-------------|------------|--------------|----------------|--------|
| 1 | | | | | ⬜ PASS / ⬜ FAIL |
| 2 | | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 8: RLS Query Performance

### Objective
Verify RLS policies execute quickly using cached role function.

### Prerequisites
- Access to Supabase dashboard
- SQL Editor access

### Steps
1. Open Supabase Dashboard → SQL Editor
2. Execute performance test:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM applications
   WHERE created_by = '<test-user-id>'
   LIMIT 10;
   ```
3. Check execution plan for `get_user_roles_cached` usage
4. Record execution time
5. Compare with Performance Advisor

### Expected Results
- ✅ Query execution time **<500ms**
- ✅ Execution plan shows `get_user_roles_cached` function call
- ✅ No slow query warnings in Performance Advisor
- ✅ Index usage confirmed in execution plan

### Actual Results
| Query | Execution Time | Function Used | Indexes Used | Result |
|-------|----------------|---------------|--------------|--------|
| applications | | | | ⬜ PASS / ⬜ FAIL |
| user_roles | | | | ⬜ PASS / ⬜ FAIL |
| documents | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 9: Concurrent Sessions

### Objective
Verify auth state handles multiple browser tabs correctly.

### Steps
1. Log in to application in Tab 1
2. Navigate to `/dashboards`
3. Open Tab 2 with same domain
4. Navigate to `/admin/users` in Tab 2
5. Log out from Tab 1
6. Observe behavior in Tab 2
7. Refresh Tab 2

### Expected Results
- ✅ Both tabs load authenticated content initially
- ✅ Logout in Tab 1 doesn't immediately affect Tab 2
- ✅ Refresh Tab 2 after logout redirects to sign-in
- ✅ No auth errors in console
- ✅ Session state properly synchronized

### Actual Results
| Scenario | Tab 1 | Tab 2 | Sync | Result |
|----------|-------|-------|------|--------|
| Concurrent load | | | | ⬜ PASS / ⬜ FAIL |
| Logout sync | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 🧪 Test Case 10: Structured Logging Validation

### Objective
Verify logging system filters and formats correctly.

### Prerequisites
- Update `.env` with various log configurations

### Steps

**Test 1: All Logs Enabled**
```env
VITE_LOG_LEVEL=debug
VITE_LOG_AUTH=true
VITE_LOG_ROUTE=true
VITE_LOG_SYSTEM=true
```
- Reload app
- Verify all log groups appear with proper formatting

**Test 2: Auth Only**
```env
VITE_LOG_LEVEL=info
VITE_LOG_AUTH=true
VITE_LOG_ROUTE=false
VITE_LOG_SYSTEM=false
```
- Reload app
- Verify only `[AUTH]` prefixed logs appear

**Test 3: Production Mode**
```env
VITE_LOG_LEVEL=error
VITE_LOG_AUTH=false
VITE_LOG_ROUTE=false
VITE_LOG_SYSTEM=false
```
- Reload app
- Verify minimal console output (errors only)

### Expected Results
- ✅ Log levels filter correctly (`debug` < `info` < `warn` < `error`)
- ✅ Groups enable/disable independently
- ✅ Timestamps appear in all logs
- ✅ Log format: `[TIMESTAMP] [GROUP] message`
- ✅ No logs when group disabled

### Actual Results
| Config | Logs Visible | Format | Filtering | Result |
|--------|--------------|--------|-----------|--------|
| All enabled | | | | ⬜ PASS / ⬜ FAIL |
| Auth only | | | | ⬜ PASS / ⬜ FAIL |
| Production | | | | ⬜ PASS / ⬜ FAIL |

### Notes


---

## 📊 Performance Baseline Comparison

### Before Stabilization (v0.15.5)
| Metric | Value | Notes |
|--------|-------|-------|
| Auth init (cold) | 15-30s | Frequent infinite loading |
| Auth init (warm) | 5-10s | Still slow |
| Editor preview | 8-15s | Same as production |
| RLS role query | 3-5s | No caching |
| Recovery option | None | Hard refresh only |

### After Stabilization (v0.15.6)
| Metric | Target | Measured | Pass/Fail |
|--------|--------|----------|-----------|
| Auth init (cold) | ≤5s | | ⬜ PASS / ⬜ FAIL |
| Auth init (warm) | ≤2s | | ⬜ PASS / ⬜ FAIL |
| Editor preview | ≤3s | | ⬜ PASS / ⬜ FAIL |
| RLS role query | <500ms | | ⬜ PASS / ⬜ FAIL |
| Recovery trigger | 12s | | ⬜ PASS / ⬜ FAIL |
| Infinite loading | 0% | | ⬜ PASS / ⬜ FAIL |

---

## 🐛 Regression Testing

Verify existing functionality not broken by changes:

### Core Features
- [ ] User login/logout
- [ ] Role-based access control
- [ ] Application creation
- [ ] Document upload
- [ ] Dashboard metrics
- [ ] Notifications
- [ ] User management
- [ ] Control visit scheduling

### Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ✅ Test Execution Checklist

### Pre-Test
- [ ] Review all test cases
- [ ] Setup test environments
- [ ] Configure logging
- [ ] Prepare test accounts
- [ ] Clear browser data

### During Test
- [ ] Record all results in tables above
- [ ] Take screenshots of failures
- [ ] Capture console logs for errors
- [ ] Note any unexpected behavior
- [ ] Record performance metrics

### Post-Test
- [ ] Calculate pass/fail rate
- [ ] Document all failures
- [ ] Create bug tickets for issues
- [ ] Update documentation
- [ ] Schedule retest for failures

---

## 📝 Test Execution Report Template

```markdown
# Auth Stabilization Test Execution Report

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Environment:** [Production / Staging / Editor]
**Build Version:** v0.15.6

## Summary
- Total Tests: 10
- Passed: X
- Failed: Y
- Pass Rate: Z%

## Detailed Results
[Copy results from tables above]

## Issues Found
1. [Issue description]
   - Severity: [Critical / High / Medium / Low]
   - Test Case: #X
   - Steps to Reproduce: [...]
   - Expected: [...]
   - Actual: [...]

## Performance Metrics
[Copy from Performance Baseline Comparison]

## Recommendations
[List any suggested improvements or follow-up actions]

## Sign-off
- [ ] All critical tests passed
- [ ] Performance targets met
- [ ] No regressions detected
- [ ] Ready for production deployment

Approved by: __________________
Date: __________________
```

---

## 🔗 Related Documentation

- [Auth Stabilization Guide](../AuthStabilization.md)
- [Troubleshooting Guide](../Troubleshooting-Guide.md)
- [Session Stability Testing](./Session-Stability-Testing.md)
- [Performance Baseline](./Performance-Baseline.md)

---

**Last Updated:** 2025-10-30  
**Version:** v0.15.6
