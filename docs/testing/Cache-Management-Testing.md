# Cache Management Testing Guide

## Overview
This document provides test cases for validating the browser cache management system implemented in v0.14.4.

## System Components

### Cache Cleaner Utility
- **File**: `src/utils/cache-cleaner.ts`
- **Purpose**: Automatically clear stale cached builds
- **Trigger**: On app initialization (main.tsx)

### Build Versioning
- **File**: `vite.config.ts`
- **Strategy**: Hash-based file naming + timestamp versioning
- **Format**: `assets/[name]-[hash].js`

### Cache Control Headers
- **File**: `index.html`
- **Headers**: `no-cache`, `no-store`, `must-revalidate`

---

## Test Case 1: Initial Build Version Setting

### Objective
Verify that build version is set on first app load.

### Prerequisites
- Clean browser (incognito mode or cleared localStorage)
- App deployed with build version

### Steps
1. Open app in incognito mode
2. Open DevTools → Console
3. Check for log: `🎯 Build version initialized: v[timestamp]`
4. Open DevTools → Application → Local Storage
5. Verify key `app_build_version` exists
6. Verify value matches current build

### Expected Results
- ✅ Build version logged to console
- ✅ localStorage key `app_build_version` created
- ✅ No cache clear triggered on first load

### Pass Criteria
Build version initialized without errors.

---

## Test Case 2: Cache Clear on New Build

### Objective
Verify that cache is cleared when a new build is detected.

### Prerequisites
- App already loaded with version A
- New build (version B) deployed

### Steps
1. Load app with build version A
2. Note build version in localStorage
3. Deploy new build (version B)
4. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
5. Check console for:
   - `🧹 New build detected (vA → vB), clearing cache...`
   - `✅ Browser caches cleared`
   - `✅ Cache cleanup complete, reloading...`
6. Verify page reloads automatically
7. Verify localStorage `app_build_version` updated to vB

### Expected Results
- ✅ Cache clear triggered
- ✅ localStorage cleared (except auth token)
- ✅ sessionStorage cleared
- ✅ Browser caches cleared
- ✅ Page reloads automatically
- ✅ Build version updated

### Pass Criteria
Cache cleared successfully, auth token preserved, no errors.

---

## Test Case 3: Auth Token Preservation

### Objective
Verify that authentication tokens are preserved during cache clear.

### Prerequisites
- User logged in
- Auth token in localStorage

### Steps
1. Login as admin@example.com
2. Note auth token: `sb-shwfzxpypygdxoqxutae-auth-token`
3. Copy token value from localStorage
4. Trigger cache clear (deploy new build or use manual clear)
5. After page reload, check localStorage
6. Verify auth token still exists
7. Verify user still authenticated (no redirect to login)

### Expected Results
- ✅ Auth token preserved during clear
- ✅ User remains logged in
- ✅ No forced logout
- ✅ Session persists

### Pass Criteria
User can continue working after cache clear without re-login.

---

## Test Case 4: Manual Cache Clear

### Objective
Verify manual cache clearing function works.

### Prerequisites
- App loaded
- DevTools console open

### Steps
1. Load app
2. Open DevTools → Console
3. Execute: `window.__forceClearCache()`
4. Observe console logs
5. Verify page reloads
6. Check localStorage cleared (except auth)

### Expected Results
- ✅ Console log: `🔧 Manual cache clear initiated`
- ✅ All caches deleted
- ✅ Page reloads
- ✅ Auth token preserved

### Pass Criteria
Manual clear works identical to automatic clear.

---

## Test Case 5: Hash-Based File Naming

### Objective
Verify that production builds generate unique file names with hashes.

### Prerequisites
- Production build generated (`npm run build`)

### Steps
1. Build app: `npm run build`
2. Navigate to `dist/assets/` folder
3. List all JS files
4. Verify file naming format: `[name]-[hash].js`
5. Build again (make small change)
6. Verify new hash generated
7. Compare old vs new hash

### Expected Results
- ✅ Files named with hash suffix
- ✅ Each build generates unique hash
- ✅ Format: `index-a1b2c3d4.js`

### Sample Output
```
dist/assets/
  ├── index-7f3a9b2c.js
  ├── vendor-4d8e5f1a.js
  └── style-9c2f3e7b.css
```

### Pass Criteria
Every build generates unique file names to prevent stale cache.

---

## Test Case 6: Service Worker Compatibility

### Objective
Verify cache management works with/without service workers.

### Prerequisites
- App with and without service worker

### Steps
1. **Without Service Worker**:
   - Load app
   - Check DevTools → Application → Service Workers
   - Verify "No service workers" message
   - Trigger cache clear
   - Verify manual cache deletion works

2. **With Service Worker** (if added later):
   - Register service worker
   - Load app
   - Trigger cache clear
   - Verify service worker cache cleared
   - Verify app cache cleared

### Expected Results
- ✅ Works without service worker
- ✅ Compatible with future service worker
- ✅ Clears all cache types

### Pass Criteria
Cache management functional regardless of service worker presence.

---

## Test Case 7: Multiple Tabs Cache Sync

### Objective
Verify cache clear propagates across multiple tabs.

### Prerequisites
- App loaded in multiple tabs

### Steps
1. Open app in Tab A
2. Open app in Tab B
3. In Tab A, trigger cache clear (deploy new build)
4. Observe Tab A reload
5. Switch to Tab B
6. Refresh Tab B
7. Verify Tab B also clears cache
8. Verify both tabs on same build version

### Expected Results
- ✅ Tab A clears cache and reloads
- ✅ Tab B detects new version on refresh
- ✅ Both tabs synchronized
- ✅ No version mismatch

### Pass Criteria
All tabs eventually sync to same build version.

---

## Test Case 8: Cache Control Headers

### Objective
Verify HTTP cache control headers prevent browser caching.

### Prerequisites
- App deployed to server

### Steps
1. Open DevTools → Network tab
2. Load app
3. Select `index.html` request
4. Check Response Headers:
   - `Cache-Control: no-cache, no-store, must-revalidate`
   - `Pragma: no-cache`
   - `Expires: 0`
5. Hard refresh page
6. Verify `index.html` fetched from server (not cache)

### Expected Results
- ✅ All cache headers present
- ✅ index.html not cached by browser
- ✅ Hard refresh fetches from server

### Pass Criteria
Browser respects no-cache directives.

---

## Test Case 9: Offline Cache Clear

### Objective
Verify cache clear handles offline scenarios gracefully.

### Prerequisites
- App loaded online
- Network connection can be disabled

### Steps
1. Load app online
2. Open DevTools → Network → Set to "Offline"
3. Attempt to trigger cache clear
4. Observe error handling
5. Re-enable network
6. Verify cache clear retries/completes

### Expected Results
- ✅ Offline error logged
- ✅ No crash or infinite loop
- ✅ Graceful error message
- ✅ Cache clear completes when online

### Pass Criteria
Offline scenario handled without breaking app.

---

## Test Case 10: Build Version Mismatch

### Objective
Verify behavior when localStorage version doesn't match deployed version.

### Prerequisites
- App loaded with version A
- localStorage manually set to version X

### Steps
1. Load app with version A
2. Open DevTools → Application → Local Storage
3. Manually change `app_build_version` to `invalid-version`
4. Refresh page
5. Observe cache clear triggered
6. Verify version corrected to current build

### Expected Results
- ✅ Cache clear triggered
- ✅ Version corrected automatically
- ✅ No data corruption

### Pass Criteria
System self-corrects version mismatches.

---

## Test Case 11: Rapid Build Deployments

### Objective
Verify cache clear handles rapid successive build deployments.

### Prerequisites
- Ability to deploy multiple builds quickly

### Steps
1. Deploy build v1
2. Users load app (version v1)
3. Immediately deploy build v2
4. Users refresh (version v2 detected)
5. Immediately deploy build v3
6. Users refresh again
7. Verify final state is v3
8. Verify no data loss or corruption

### Expected Results
- ✅ Each version cleared properly
- ✅ Final version matches latest deploy
- ✅ No version leapfrogging
- ✅ Auth preserved throughout

### Pass Criteria
System handles rapid deployments without breaking.

---

## Test Case 12: Cache Size Monitoring

### Objective
Measure cache storage usage before/after clear.

### Prerequisites
- App with significant cached data

### Steps
1. Load app and use extensively (create data)
2. Open DevTools → Application → Storage
3. Note total storage usage
4. Trigger cache clear
5. Check storage usage after clear
6. Verify significant reduction

### Expected Results
- ✅ Before: Significant storage used
- ✅ After: Minimal storage (only auth token)
- ✅ Reduction: >90%

### Sample Metrics
```
Before Clear:
- localStorage: 2.5 MB
- sessionStorage: 500 KB
- Cache Storage: 15 MB
- Total: ~18 MB

After Clear:
- localStorage: 5 KB (auth token only)
- sessionStorage: 0 KB
- Cache Storage: 0 KB
- Total: ~5 KB
```

### Pass Criteria
Cache clear significantly reduces storage usage.

---

## Performance Testing

### Test Case 13: Cache Clear Speed

### Objective
Measure time to complete cache clear operation.

### Steps
1. Load app with substantial cache
2. Trigger cache clear
3. Measure time from trigger to reload
4. **Target**: < 2 seconds

### Expected Results
- ✅ Clear completes in < 2 seconds
- ✅ No UI freeze
- ✅ Smooth reload

---

## Browser Compatibility

### Test Case 14: Cross-Browser Cache Clear

### Objective
Verify cache management works across all supported browsers.

### Browsers to Test
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Steps
For each browser:
1. Load app
2. Check build version initialization
3. Trigger cache clear
4. Verify successful clear
5. Verify auth preservation

### Expected Results
- ✅ All browsers support cache clear
- ✅ Consistent behavior across browsers
- ✅ No browser-specific issues

### Pass Criteria
100% browser compatibility.

---

## Regression Testing Checklist

After cache system changes, verify:

- [ ] Build version initializes correctly
- [ ] New builds trigger cache clear
- [ ] Auth tokens preserved
- [ ] Manual clear function works
- [ ] Hash-based file names generated
- [ ] Cache control headers present
- [ ] Multiple tabs synchronized
- [ ] Offline scenarios handled
- [ ] Version mismatches corrected
- [ ] No console errors
- [ ] Performance acceptable (<2s clear)

---

## Troubleshooting Guide

### Issue: Cache not clearing
**Check**:
1. Build version actually changed?
2. localStorage accessible?
3. Cache API supported?
4. Console errors?

### Issue: Auth token lost
**Check**:
1. Token key matches: `sb-shwfzxpypygdxoqxutae-auth-token`
2. Preservation logic in `cache-cleaner.ts`
3. Token exists before clear

### Issue: Infinite reload loop
**Check**:
1. Build version setting properly
2. No version corruption
3. Cache clear completing successfully

---

## Test Execution Report Template

```markdown
## Cache Management Test Report

**Date**: YYYY-MM-DD
**Tester**: Name
**Build Version**: v0.14.4
**Browser**: Chrome 120

### Summary
- Total Tests: 14
- Passed: __
- Failed: __

### Results
| Test | Status | Notes |
|------|--------|-------|
| TC-1: Initial Version | ✅ | Version initialized correctly |
| TC-2: Cache Clear | ✅ | Cleared in 1.2s |
| TC-3: Auth Preservation | ✅ | Token preserved |

### Performance Metrics
- Cache clear time: 1.2s
- Storage reduction: 95%
- Page reload time: 0.8s

### Issues Found
None

### Sign-Off
**Status**: ☐ Passed ☐ Failed  
**Approved By**: _______________
```
