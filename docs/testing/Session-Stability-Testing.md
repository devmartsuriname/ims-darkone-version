# Session Stability Testing Guide

## Overview
This document provides test cases for validating session management, token refresh, and authentication stability enhancements implemented in v0.14.4.

## System Components

### Session Validator
- **File**: `src/utils/session-validator.ts`
- **Functions**: `validateSession()`, `forceRefreshSession()`, `handleTokenRefreshFailure()`

### Enhanced Auth Context
- **File**: `src/context/useAuthContext.tsx`
- **Enhancements**: Retry logic (3 attempts), 100ms fetch delay

### Protected Route Guard
- **File**: `src/components/auth/ProtectedRoute.tsx`
- **Features**: Session validation on route access

---

## Test Case 1: Session Initialization

### Objective
Verify session initializes correctly on app load.

### Prerequisites
- Clean browser state
- Valid user account

### Steps
1. Clear all browser data
2. Navigate to app
3. Login as admin@example.com
4. Open DevTools → Console
5. Check for logs:
   - `🔐 Auth state changed: SIGNED_IN`
   - `✅ Session refreshed successfully` (if needed)
6. Open DevTools → Application → Local Storage
7. Verify `sb-shwfzxpypygdxoqxutae-auth-token` exists
8. Verify token has valid expiry time

### Expected Results
- ✅ Session initialized within 2 seconds
- ✅ Auth token stored in localStorage
- ✅ User profile fetched successfully
- ✅ User roles loaded
- ✅ Redirect to dashboard

### Pass Criteria
Session initialization completes without errors, user authenticated.

---

## Test Case 2: Profile Fetch Retry Logic

### Objective
Verify profile fetch retries on failure.

### Prerequisites
- Supabase connection can be temporarily disrupted
- User logged in

### Steps
1. Login as admin@example.com
2. Open DevTools → Network
3. Block requests to `profiles` table (or simulate 500 error)
4. Reload page
5. Observe console logs:
   - `❌ Error fetching profile: ...`
   - `🔄 Retrying profile fetch (2 attempts left)`
   - `🔄 Retrying profile fetch (1 attempts left)`
6. Unblock network after 2 retries
7. Verify profile fetched on retry

### Expected Results
- ✅ Initial fetch fails
- ✅ Retry triggered automatically
- ✅ 1 second delay between retries
- ✅ Profile fetched on successful retry
- ✅ Max 3 retry attempts

### Pass Criteria
System retries failed profile fetches up to 3 times before giving up.

---

## Test Case 3: Role Fetch Retry Logic

### Objective
Verify role fetch retries on failure.

### Prerequisites
- Supabase connection can be temporarily disrupted

### Steps
1. Login as staff@example.com
2. Block requests to `user_roles` table
3. Reload page
4. Observe console logs:
   - `❌ Error fetching roles: ...`
   - `🔄 Retrying roles fetch (2 attempts left)`
5. Unblock network
6. Verify roles fetched on retry
7. Verify dashboard shows correct metrics for Staff role

### Expected Results
- ✅ Initial fetch fails
- ✅ Retry triggered
- ✅ Roles fetched on retry
- ✅ Dashboard updates correctly

### Pass Criteria
System retries role fetch and recovers gracefully.

---

## Test Case 4: Session Validation on Protected Routes

### Objective
Verify session validation occurs when accessing protected routes.

### Prerequisites
- User logged in
- Session near expiry (optional: manually set expiry)

### Steps
1. Login as admin@example.com
2. Navigate to `/dashboards`
3. Open DevTools → Console
4. Observe: Session validation check runs
5. If session expiring soon (<5 minutes), observe:
   - `🔄 Session expiring soon, refreshing...`
   - `✅ Session refreshed successfully`
6. Navigate to `/admin/users`
7. Verify session validated again

### Expected Results
- ✅ Session validated on protected route access
- ✅ Session refreshed if near expiry
- ✅ Navigation completes successfully
- ✅ No forced logout

### Pass Criteria
Session validation prevents expired token issues.

---

## Test Case 5: Token Refresh Failure Handling

### Objective
Verify graceful handling of token refresh failures.

### Prerequisites
- User logged in
- Ability to simulate token refresh failure

### Steps
1. Login as admin@example.com
2. Simulate token refresh failure (network disruption)
3. Navigate to protected route
4. Observe console logs:
   - `❌ Token refresh failed: ...`
   - `🔄 Token refresh retry 1/3`
   - Exponential backoff (1s, 2s, 4s delays)
5. After 3 failed retries, observe:
   - `❌ All token refresh retries failed`
   - Toast notification: "Your session has expired. Please sign in again."
   - Redirect to `/auth/sign-in`

### Expected Results
- ✅ Retry with exponential backoff
- ✅ Max 3 retry attempts
- ✅ User-friendly error message
- ✅ Graceful logout
- ✅ Redirect to login

### Pass Criteria
System handles refresh failures without crashing, informs user.

---

## Test Case 6: 100ms Profile Fetch Delay

### Objective
Verify profile fetch delay prevents race conditions.

### Prerequisites
- User logged in

### Steps
1. Login as admin@example.com
2. Open DevTools → Console
3. Monitor auth state change event
4. Observe 100ms delay before profile fetch:
   - `🔐 Auth state changed: SIGNED_IN`
   - [100ms pause]
   - Profile fetch initiated
5. Verify no race condition errors
6. Verify profile loads correctly

### Expected Results
- ✅ 100ms delay between auth state and profile fetch
- ✅ No race conditions
- ✅ Profile loads successfully

### Pass Criteria
Delay prevents race conditions without noticeable UX impact.

---

## Test Case 7: Session Persistence Across Tabs

### Objective
Verify session persists across multiple browser tabs.

### Prerequisites
- User logged in

### Steps
1. Login in Tab A as admin@example.com
2. Open Tab B, navigate to app
3. Verify Tab B auto-authenticates (no login prompt)
4. Create application in Tab A
5. Switch to Tab B, refresh
6. Verify application visible in Tab B
7. Logout in Tab A
8. Switch to Tab B
9. Verify Tab B still has active session (until page refresh)
10. Refresh Tab B
11. Verify Tab B redirects to login

### Expected Results
- ✅ Session shared across tabs
- ✅ Auth token accessible to all tabs
- ✅ Logout in one tab doesn't immediately affect others
- ✅ Refresh after logout triggers re-authentication

### Pass Criteria
Session correctly shared and synchronized across tabs.

---

## Test Case 8: Session Expiry Handling

### Objective
Verify correct behavior when session expires naturally.

### Prerequisites
- User logged in
- Session has 1 hour TTL (default Supabase)

### Steps
**Note**: This test requires waiting for actual expiry or manually setting token expiry.

1. Login as admin@example.com
2. Note session expiry time (check localStorage token)
3. Wait until 5 minutes before expiry
4. Navigate to any protected route
5. Observe automatic token refresh:
   - `🔄 Session expiring soon, refreshing...`
   - `✅ Session refreshed successfully`
6. Continue using app
7. Verify new expiry time extended

**Alternative (Manual Testing)**:
1. Login as admin
2. Manually edit token expiry to 1 minute from now
3. Wait 1 minute
4. Attempt to access protected route
5. Verify forced logout and redirect

### Expected Results
- ✅ Auto-refresh at 5 minutes before expiry
- ✅ New token issued
- ✅ User continues working seamlessly
- ✅ Expired session forces re-authentication

### Pass Criteria
Session expiry handled gracefully without user interruption.

---

## Test Case 9: Concurrent Session Management

### Objective
Verify behavior with multiple concurrent sessions.

### Prerequisites
- User account
- Multiple browsers or incognito windows

### Steps
1. Login as admin@example.com in Chrome
2. Login as admin@example.com in Firefox (same account)
3. Perform actions in Chrome (create application)
4. Switch to Firefox, refresh
5. Verify action reflected in Firefox
6. Logout in Chrome
7. Verify Firefox session remains active
8. Attempt action in Firefox
9. Verify Firefox can still operate

### Expected Results
- ✅ Multiple sessions allowed
- ✅ Actions synchronized via database
- ✅ Logout in one session doesn't kill others
- ✅ Each session has independent token

### Pass Criteria
Multiple concurrent sessions supported without conflicts.

---

## Test Case 10: Session Validation Error Handling

### Objective
Verify error handling when session validation fails.

### Prerequisites
- User logged in
- Network can be disrupted

### Steps
1. Login as admin@example.com
2. Navigate to `/dashboards`
3. Disable network (DevTools → Offline)
4. Navigate to `/admin/users`
5. Observe session validation fails
6. Check console:
   - `❌ Session validation failed: ...`
7. Check for user notification (toast)
8. Re-enable network
9. Retry navigation
10. Verify recovery

### Expected Results
- ✅ Validation failure logged
- ✅ User notified via toast
- ✅ No app crash
- ✅ Recovery when network restored

### Pass Criteria
Session validation errors handled gracefully.

---

## Test Case 11: onAuthStateChange Deadlock Prevention

### Objective
Verify no deadlocks occur in auth state change handler.

### Prerequisites
- User can login/logout multiple times

### Steps
1. Login as admin@example.com
2. Immediately logout
3. Immediately login again
4. Repeat 5 times rapidly
5. Observe console for:
   - No errors
   - No deadlock warnings
   - Proper state transitions
6. Verify final state is authenticated

### Expected Results
- ✅ No deadlock
- ✅ No infinite loops
- ✅ Rapid state changes handled
- ✅ Final state correct

### Pass Criteria
Auth state changes handled without deadlocks or freezes.

---

## Test Case 12: Profile Fetch Timeout

### Objective
Verify timeout handling for profile fetch.

### Prerequisites
- Network can be slowed

### Steps
1. Login as admin@example.com
2. Use DevTools → Network → Slow 3G
3. Reload page
4. Observe profile fetch
5. Verify retries with delays
6. If all retries fail, verify:
   - Error logged
   - User can still access app
   - Limited functionality (no profile data)

### Expected Results
- ✅ Retries attempted
- ✅ Timeout doesn't break app
- ✅ Graceful degradation

### Pass Criteria
App remains functional even if profile fetch fails.

---

## Test Case 13: Role Assignment Change

### Objective
Verify session updates when user role changes.

### Prerequisites
- Admin access to change roles
- Test user account

### Steps
1. Login as testuser@example.com (role: Staff)
2. Verify Staff dashboard visible
3. In separate window, login as admin
4. Change testuser role to Control
5. Return to testuser window
6. Refresh page
7. Observe auth state change
8. Verify Control dashboard now visible

### Expected Results
- ✅ Role change detected
- ✅ Profile/roles refetched
- ✅ Dashboard updates correctly
- ✅ Access permissions updated

### Pass Criteria
Role changes reflected immediately after refresh.

---

## Performance Testing

### Test Case 14: Session Validation Performance

### Objective
Measure performance impact of session validation.

### Steps
1. Login as admin@example.com
2. Navigate to 10 different protected routes
3. Measure average session validation time
4. **Target**: < 50ms per validation

### Expected Results
- ✅ Average validation time < 50ms
- ✅ No noticeable UI lag
- ✅ Smooth navigation

---

## Security Testing

### Test Case 15: Token Tampering Detection

### Objective
Verify tampered tokens are rejected.

### Steps
1. Login as admin@example.com
2. Open DevTools → Application → Local Storage
3. Copy auth token value
4. Modify token (change 1 character)
5. Reload page
6. Observe session validation fails
7. Verify forced logout

### Expected Results
- ✅ Tampered token detected
- ✅ Validation fails
- ✅ User logged out
- ✅ Redirect to login

### Pass Criteria
System detects and rejects tampered tokens.

---

## Stress Testing

### Test Case 16: Rapid Page Navigation

### Objective
Verify session stability under rapid navigation.

### Steps
1. Login as admin@example.com
2. Rapidly navigate between routes:
   - /dashboards
   - /applications/list
   - /admin/users
   - /control/queue
   (Repeat 20 times)
3. Verify no session errors
4. Verify no authentication loss

### Expected Results
- ✅ Session remains stable
- ✅ No auth errors
- ✅ No memory leaks

### Pass Criteria
Session survives rapid navigation without issues.

---

## Regression Testing Checklist

After session stability changes, verify:

- [ ] Login works for all roles
- [ ] Profile fetch succeeds
- [ ] Role fetch succeeds
- [ ] Retries trigger on failure
- [ ] Session validates on protected routes
- [ ] Token refresh works
- [ ] Session persists across tabs
- [ ] Session expiry handled
- [ ] Logout works correctly
- [ ] No console errors
- [ ] No deadlocks
- [ ] Performance acceptable

---

## Troubleshooting Guide

### Issue: Profile not loading
**Check**:
1. Network connectivity
2. Retry logs in console
3. Supabase connection
4. RLS policies on profiles table

### Issue: Infinite retry loop
**Check**:
1. Retry count logic
2. Error handling
3. Network persistent failure

### Issue: Session expired unexpectedly
**Check**:
1. Token expiry time
2. Auto-refresh logic
3. Session validation frequency

---

## Test Execution Report Template

```markdown
## Session Stability Test Report

**Date**: YYYY-MM-DD
**Tester**: Name
**Build Version**: v0.14.4

### Summary
- Total Tests: 16
- Passed: __
- Failed: __

### Results
| Test | Status | Notes |
|------|--------|-------|
| TC-1: Initialization | ✅ | Session init in 1.2s |
| TC-2: Profile Retry | ✅ | Retried 3 times successfully |

### Performance Metrics
- Session initialization: 1.2s
- Validation time: 35ms avg
- Profile fetch (with retry): 1.8s

### Issues Found
None

### Sign-Off
**Status**: ☐ Passed ☐ Failed  
**Approved By**: _______________
```
