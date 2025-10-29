# Version Management Guide

## Overview

The IMS application uses semantic versioning (MAJOR.MINOR.PATCH) with integrated cache management to ensure users always receive the latest updates without stale cached assets.

## Version Bump Checklist

Before each production deployment, follow these steps:

### 1. Update Version Number

**Update `.env` file:**
```bash
VITE_BUILD_VERSION=0.14.7  # Increment appropriately
```

**Version increment rules:**
- **PATCH** (0.14.6 → 0.14.7): Bug fixes, minor improvements, hotfixes
- **MINOR** (0.14.7 → 0.15.0): New features, non-breaking changes
- **MAJOR** (0.15.0 → 1.0.0): Breaking changes, major releases

### 2. Update Documentation

**Update `docs/Changelog.md`:**
```markdown
## [0.14.7] - 2025-01-29

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Improvement description
```

### 3. Rebuild Application

```bash
npm run build
```

This will:
- Bundle the application with the new version
- Generate hash-based filenames for cache invalidation
- Inject `VITE_BUILD_VERSION` into the build

### 4. Verify Cache Invalidation

After deployment:
1. Open browser DevTools → Console
2. Refresh the application
3. Look for version log messages:
   - `🎯 Version initialized: 0.14.7` (first load)
   - `✅ Version current: 0.14.7` (subsequent loads)
   - `🧹 New version deployed (0.14.6 → 0.14.7)` (after update)

### 5. Test Across Environments

- [ ] Test in incognito window
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Verify no console errors related to caching

## Cache Strategy

### Automatic Cache Invalidation

The system uses a multi-layer cache strategy:

**Layer 1: Hash-Based Filenames**
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: `assets/[name]-[hash].js`,
      chunkFileNames: `assets/[name]-[hash].js`,
      assetFileNames: `assets/[name]-[hash].[ext]`
    }
  }
}
```

**Layer 2: Version-Based Cache Clearing**
```typescript
// src/utils/cache-cleaner.ts
if (storedVersion !== BUILD_VERSION && BUILD_VERSION !== 'dev') {
  // Clear all caches and reload
}
```

**Layer 3: HTTP Cache Headers**
```html
<!-- index.html -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
```

### Manual Cache Clear

For debugging or emergency cache clearing:

**Browser Console:**
```javascript
window.__forceClearCache()
```

**User Instructions:**
1. Open DevTools (F12)
2. Navigate to Application → Storage
3. Click "Clear site data"
4. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)

## Development Workflow

### Local Development

During development, version is set to `'dev'` to prevent constant cache clearing:

```bash
# .env.local (optional)
VITE_BUILD_VERSION=dev
```

This disables cache invalidation while preserving hash-based filenames.

### Staging Deployment

Use timestamped versions for staging:

```bash
VITE_BUILD_VERSION=staging-$(date +%s) npm run build
```

### Production Deployment

Always use semantic versions for production:

```bash
VITE_BUILD_VERSION=0.14.7 npm run build
```

## Version Verification

### Client-Side Check

```typescript
import { checkServerVersion, getClientVersion } from '@/utils/version-checker';

// Get current version
const version = getClientVersion();
console.log('Running version:', version);

// Check server sync
const result = await checkServerVersion();
if (!result.isSync) {
  console.warn('Version mismatch detected');
}
```

### Health Check Endpoint

```bash
curl https://your-domain.com/health-check
```

Response:
```json
{
  "version": "0.14.7",
  "status": "healthy",
  "timestamp": "2025-01-29T12:00:00Z",
  "cache_strategy": "hash-based-filenames"
}
```

## Troubleshooting

### Issue: Users Not Receiving Updates

**Symptoms:**
- Users report old features
- Console shows old version number

**Solution:**
1. Verify `VITE_BUILD_VERSION` is set in `.env`
2. Rebuild application: `npm run build`
3. Clear CDN cache if using Cloudflare/Vercel/Netlify
4. Instruct users to hard reload (Ctrl+Shift+R)

### Issue: Constant Cache Clearing

**Symptoms:**
- Users experience frequent reloads
- Console shows "New build detected" on every load

**Solution:**
1. Check `VITE_BUILD_VERSION` is NOT using `Date.now()`
2. Verify `.env` has static version: `VITE_BUILD_VERSION=0.14.7`
3. Rebuild with static version

### Issue: Version Mismatch After Deployment

**Symptoms:**
- Health check returns different version than client
- Users see mixed old/new features

**Solution:**
1. Verify all edge functions are deployed
2. Check Supabase dashboard for function deployment status
3. Redeploy edge functions if needed
4. Wait 2-3 minutes for global propagation

## Best Practices

1. **Always bump version before deploying to production**
2. **Document all changes in Changelog.md**
3. **Test cache invalidation in staging first**
4. **Use semantic versioning consistently**
5. **Never use timestamp-based versions in production**
6. **Preserve auth tokens during cache clears**
7. **Monitor console logs after deployment**

## Quick Reference

### Version Format
```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     └── Bug fixes
  |     └── New features (backwards compatible)
  └── Breaking changes
```

### Key Files
- `.env` - Version configuration
- `vite.config.ts` - Build configuration
- `src/utils/cache-cleaner.ts` - Cache invalidation logic
- `src/utils/version-checker.ts` - Version verification
- `docs/Changelog.md` - Version history

### Emergency Commands
```bash
# Force rebuild with new version
VITE_BUILD_VERSION=0.14.8 npm run build

# Clear local cache
rm -rf .vite dist node_modules/.vite

# Test build locally
npm run preview
```

## Support

For version management issues:
1. Check this guide first
2. Review `docs/Deployment.md`
3. Consult `docs/Troubleshooting-Guide.md`
4. Contact system administrator

---

**Last Updated:** 2025-01-29  
**Version:** 0.14.6
