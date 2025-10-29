# IMS Production Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Cache Strategy & Browser Management](#cache-strategy--browser-management)
4. [Environment Variables](#environment-variables)
5. [Deployment Process](#deployment-process)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Rollback Procedures](#rollback-procedures)

## Overview

This guide provides comprehensive instructions for deploying the Internal Management System (IMS) to production, including security configuration, performance optimization, monitoring setup, and maintenance procedures.

## Pre-Deployment Checklist

### 1. Security Validation ✅

**Authentication & Authorization**
- [ ] Supabase Auth configured with proper redirect URLs
- [ ] Row Level Security (RLS) enabled on all 18 tables
- [ ] User roles and permissions validated
- [ ] Edge functions JWT verification configured
- [ ] Storage bucket policies implemented
- [ ] Password breach detection enabled

**Data Protection**
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled
- [ ] File upload restrictions configured (50MB documents, 25MB photos)
- [ ] API rate limiting implemented

### 2. Database Preparation ✅

**Schema Validation**
- [ ] All migrations applied successfully
- [ ] 39 strategic indexes created for performance
- [ ] Foreign key constraints validated
- [ ] Triggers and functions tested
- [ ] RLS policies verified with `supabase db lint`

**Data Seeding**
- [ ] Reference data populated
- [ ] Initial admin user created
- [ ] Default system settings configured

### 3. Application Configuration ✅

**Environment Setup**
- [ ] Production Supabase project configured
- [ ] Domain names and URLs updated
- [ ] SSL certificates installed
- [ ] CDN configuration (if applicable)

**Feature Validation**
- [ ] All 51 routes functional
- [ ] Integration tests passing
- [ ] User acceptance testing completed
- [ ] Performance benchmarks met (target: <2s page load)

## Cache Strategy & Browser Management

### Version Management & Cache Synchronization

The IMS uses a multi-layer cache management system to ensure users always receive the latest updates without stale cached assets.

**Key Components:**

1. **Static Build Versioning** (Priority 1)
   ```bash
   # .env
   VITE_BUILD_VERSION=0.14.6  # Bump on each deployment
   ```

2. **Hash-Based Filenames** (Priority 2)
   ```typescript
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

3. **Automatic Cache Invalidation** (Priority 3)
   ```typescript
   // src/utils/cache-cleaner.ts
   const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || 'dev';
   
   export const checkAndClearCache = async () => {
     const storedVersion = localStorage.getItem('app_build_version');
     
     // Only clear cache if version actually changed (not on every load)
     if (storedVersion !== BUILD_VERSION && BUILD_VERSION !== 'dev') {
       console.info(`🧹 New version deployed (${storedVersion} → ${BUILD_VERSION})`);
       
       // Preserve auth tokens before clearing
       const authToken = localStorage.getItem('sb-*-auth-token');
       
       // Clear all caches
       if ('caches' in window) {
         const cacheNames = await caches.keys();
         await Promise.all(cacheNames.map(name => caches.delete(name)));
       }
       
       localStorage.clear();
       sessionStorage.clear();
       
       // Restore auth token
       if (authToken) localStorage.setItem('sb-*-auth-token', authToken);
       
       // Update version and reload
       localStorage.setItem('app_build_version', BUILD_VERSION);
       window.location.reload();
     }
   };
   ```

### Version Bump Workflow (CRITICAL)

**Before Each Production Deployment:**

1. **Update Build Version**
   ```bash
   # Edit .env
   VITE_BUILD_VERSION=0.14.7  # Increment appropriately
   ```

2. **Document Changes**
   ```bash
   # Update docs/Changelog.md with new version entry
   ```

3. **Rebuild Application**
   ```bash
   npm run build
   ```

4. **Verify Version in Build**
   - Check console logs after deployment
   - Should see: `✅ Version current: 0.14.7`
   - No constant "New build detected" messages

**Version Increment Rules:**
- **PATCH** (0.14.6 → 0.14.7): Bug fixes, hotfixes
- **MINOR** (0.14.7 → 0.15.0): New features, non-breaking changes
- **MAJOR** (0.15.0 → 1.0.0): Breaking changes, major releases

**⚠️ CRITICAL:** Never use timestamp-based versions (`Date.now()`) in production. This causes constant cache clearing and page reloads.

### Cache Troubleshooting

**Issue: Users Not Receiving Updates**
```bash
# Solution 1: Verify version is set
cat .env | grep VITE_BUILD_VERSION

# Solution 2: Rebuild with static version
VITE_BUILD_VERSION=0.14.7 npm run build

# Solution 3: Clear CDN cache (if using Cloudflare/Vercel)
```

**Issue: Constant Cache Clearing**
```bash
# Check if version is dynamic (wrong)
# vite.config.ts should NOT have:
# VITE_BUILD_VERSION: Date.now()  ❌

# Should have static version from .env:
# VITE_BUILD_VERSION=0.14.7  ✅
```

**Manual Cache Clear (For Debugging)**
```javascript
// In browser console
window.__forceClearCache()
```

For detailed version management, see: [Version-Management.md](./Version-Management.md)

### Cache Control Headers

**HTML Meta Tags:**
```html
<!-- index.html -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### Service Worker (Optional Enhancement)

For advanced offline support and push notifications:

**Create `public/sw.js`:**
```javascript
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
```

**Register in main.tsx:**
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Cache Invalidation Strategy

1. **On Build:** Increment `VITE_APP_VERSION` in package.json
2. **On Load:** Check version mismatch and clear cache
3. **Preserve:** Authentication tokens and session data
4. **Clear:** Component cache, API responses, stale assets

## Environment Variables

### Required Variables

**Production Environment:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://shwfzxpypygdxoqxutae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_VERSION=0.14.5
VITE_APP_ENV=production
VITE_APP_NAME="IMS - Internal Management System"

# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: Analytics
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

### Edge Function Secrets

Configure in Supabase Dashboard → Edge Functions → Secrets:

```bash
SUPABASE_URL=https://shwfzxpypygdxoqxutae.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[password]@db.shwfzxpypygdxoqxutae.supabase.co:5432/postgres
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

### Environment Variable Security

- **Never commit** `.env` files to version control
- Use `.env.example` as a template
- Store secrets in Supabase Vault or hosting platform
- Rotate keys regularly (quarterly recommended)
- Use different keys for staging and production

## Deployment Process

### Step 1: Supabase Production Setup

1. **Database Migration**
   ```bash
   # Apply all migrations including performance indexes
   supabase db push --project-ref shwfzxpypygdxoqxutae
   ```

2. **Configure Authentication**
   ```
   Authentication > Settings > URL Configuration
   - Site URL: https://your-production-domain.com
   - Redirect URLs: https://your-production-domain.com/**
   ```

3. **Deploy Edge Functions**
   ```bash
   # Deploy all 12 edge functions
   supabase functions deploy --project-ref shwfzxpypygdxoqxutae
   ```

4. **Verify RLS Policies**
   ```bash
   # Run linter to check for security issues
   supabase db lint
   ```

### Step 2: Application Deployment

1. **Build Production Bundle**
   ```bash
   npm run build
   
   # Verify build output
   ls -lh dist/assets/
   ```

2. **Deploy to Hosting Platform**
   
   **Option A: Vercel**
   ```bash
   vercel --prod
   ```
   
   **Option B: Netlify**
   ```bash
   netlify deploy --prod
   ```
   
   **Option C: Custom Server**
   ```bash
   # Upload dist/ folder to your server
   rsync -avz dist/ user@server:/var/www/ims/
   ```

3. **Configure Domain & SSL**
   - Point DNS to hosting platform
   - Enable SSL/TLS (automatic with Vercel/Netlify)
   - Verify HTTPS redirect

### Step 3: Post-Deployment Verification

**Automated Checks:**
```bash
# Run health check
curl https://your-domain.com/api/health-check

# Verify Supabase connectivity
curl https://your-domain.com/api/system-health
```

**Manual Testing Checklist:**
- [ ] User registration and login
- [ ] Dashboard loads for all roles (Admin, IT, Staff, Control, Director, Minister)
- [ ] Application intake form submission
- [ ] Document upload (test 10MB+ files)
- [ ] Control visit scheduling
- [ ] Workflow state transitions
- [ ] Notification delivery
- [ ] Report generation

## Security Configuration

### Authentication Settings

**Supabase Auth Configuration:**
```sql
-- Enable email confirmation (recommended)
ALTER DATABASE postgres SET app.jwt_secret TO 'your-jwt-secret';

-- Session configuration
-- Navigate to: Authentication > Settings
-- Session timeout: 3600 seconds (1 hour)
-- Refresh token rotation: Enabled
```

### Row Level Security Validation

**Verify RLS Status:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All 18 tables should have rowsecurity = true
```

**Test RLS Policies:**
```sql
-- Test as different roles
SET ROLE authenticated;
SELECT * FROM applications LIMIT 1;

-- Should respect user_roles and assignments
```

## Performance Optimization

### Database Performance

**Installed Indexes (39 total):**
- Application queries: 5 indexes
- Document queries: 3 indexes  
- Control visits: 4 indexes
- Tasks: 4 indexes
- Notifications: 4 indexes
- User management: 3 indexes
- Composite indexes: 3 for common patterns

**Query Optimization:**
```sql
-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Frontend Performance

**Current Metrics (Target):**
- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s
- Largest Contentful Paint: <2.5s
- Bundle size: <500KB (gzipped)

**Optimization Strategies:**
- Lazy load routes with React.lazy()
- Image compression (80% quality JPEG)
- Code splitting by route
- Tree-shaking unused dependencies

## Monitoring and Logging

### Application Monitoring

**Health Check Endpoints:**
```typescript
// GET /api/health-check
{
  "status": "healthy",
  "timestamp": "2025-01-29T00:00:00Z",
  "database": "connected",
  "auth": "operational"
}

// GET /api/system-health
{
  "overall_status": "healthy",
  "database_metrics": {...},
  "service_metrics": {...}
}
```

**Setup Monitoring Service:**
1. Configure Uptime Robot or similar
2. Monitor health endpoints every 5 minutes
3. Alert on 3 consecutive failures
4. Track response time trends

### Logging Strategy

**Application Logs:**
- User authentication (success/failure)
- Application state changes (via workflow-service)
- File uploads/downloads
- API errors (4xx, 5xx)

**Audit Logs (Automatic):**
- All INSERT/UPDATE/DELETE on critical tables
- User role changes
- Document verifications
- Workflow approvals

**Access Logs:**
```sql
-- View recent audit logs
SELECT * FROM audit_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. **Dashboard Not Loading / Blank Screen**

**Symptoms:**
- White screen after login
- Console errors about missing modules
- Infinite redirect loop

**Solutions:**
```bash
# Clear browser cache
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Clear site data: DevTools > Application > Clear storage

# Check auth status
localStorage.getItem('supabase.auth.token')

# Verify role assignment
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
```

**Prevention:**
- Ensure cache-cleaner.ts runs on app load
- Verify user has active role in user_roles table
- Check redirect URLs in Supabase Auth settings

#### 2. **"Row Level Security Policy Violation"**

**Symptoms:**
- Error when creating/viewing records
- "new row violates row-level security policy"
- Empty data tables despite records existing

**Solutions:**
```sql
-- Check user's active roles
SELECT role, is_active FROM user_roles WHERE user_id = auth.uid();

-- Verify RLS policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'applications';

-- Test policy manually
SET ROLE authenticated;
SELECT can_manage_applications(); -- Should return true for staff
```

**Prevention:**
- Always use security definer functions for RLS
- Test policies with different user roles
- Ensure user_id columns are NOT NULL where used in RLS

#### 3. **File Upload Failures**

**Symptoms:**
- Upload hangs or times out
- "File size exceeds limit" error
- Permission denied on storage bucket

**Solutions:**
```sql
-- Check storage policies
SELECT * FROM storage.objects WHERE bucket_id = 'documents' LIMIT 5;

-- Verify user can upload
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Check file size limits (from validate_file_upload function)
-- Documents: 50MB max
-- Control photos: 25MB max
```

**Prevention:**
- Implement client-side file size validation
- Show clear error messages for file type restrictions
- Use resumable uploads for files >10MB

#### 4. **Session Expires Unexpectedly**

**Symptoms:**
- Logged out after short time
- Token refresh fails
- "JWT expired" errors

**Solutions:**
```typescript
// Check session validity
import { supabase } from '@/integrations/supabase/client';
const { data: { session } } = await supabase.auth.getSession();

// Force refresh
await supabase.auth.refreshSession();

// Check session timeout setting
// Supabase Dashboard > Authentication > Settings
// Default: 3600 seconds (1 hour)
```

**Prevention:**
- Implement automatic token refresh (see session-validator.ts)
- Increase session timeout for production
- Add session validation on protected routes

#### 5. **Edge Function Errors (500/504)**

**Symptoms:**
- API calls timeout
- "Function execution timed out" errors
- Inconsistent responses

**Solutions:**
```bash
# Check function logs
supabase functions logs workflow-service --project-ref shwfzxpypygdxoqxutae

# Test function directly
curl -X POST https://shwfzxpypygdxoqxutae.supabase.co/functions/v1/health-check

# Verify secrets configured
# Supabase Dashboard > Edge Functions > Secrets
```

**Prevention:**
- Add timeout handling in edge functions (max 60s)
- Implement retry logic for external API calls
- Monitor function execution time

#### 6. **Slow Page Load Times**

**Symptoms:**
- Dashboard takes >5 seconds to load
- Large bundle size warnings
- High memory usage

**Solutions:**
```bash
# Analyze bundle size
npm run build -- --mode analyze

# Check for duplicate dependencies
npm dedupe

# Profile component rendering
# React DevTools > Profiler > Record
```

**Prevention:**
- Lazy load non-critical components
- Implement pagination for large lists
- Use React Query for data caching
- Optimize images (compress to 80% quality)

#### 7. **Notifications Not Appearing**

**Symptoms:**
- Toast notifications don't show
- Missing workflow update alerts
- Email notifications not sent

**Solutions:**
```sql
-- Check notification records
SELECT * FROM notifications 
WHERE recipient_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify notification service running
SELECT * FROM system_health_reports 
ORDER BY created_at DESC 
LIMIT 1;

-- Check email service (if configured)
-- Edge function logs for email-service
```

**Prevention:**
- Test notification-service edge function
- Verify RESEND_API_KEY configured
- Check user notification preferences

### Debugging Tools

**Browser Console Commands:**
```javascript
// Check current user
supabase.auth.getUser();

// Check session
supabase.auth.getSession();

// Test RLS function
supabase.rpc('is_admin_or_it');

// Clear cache
localStorage.clear();
sessionStorage.clear();
```

**SQL Debugging:**
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- View recent errors
SELECT * FROM postgres_logs 
WHERE error_severity IN ('ERROR', 'FATAL') 
ORDER BY timestamp DESC 
LIMIT 20;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM applications WHERE current_state = 'DRAFT';
```

## Rollback Procedures

### Application Rollback

**Immediate Rollback (Hosting Platform):**
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert HEAD
npm run build
# Deploy previous version
```

### Database Rollback

**Restore from Backup:**
```bash
# List backups
supabase db backups list --project-ref shwfzxpypygdxoqxutae

# Restore specific backup
supabase db restore backup_id --project-ref shwfzxpypygdxoqxutae
```

**Migration Rollback:**
```sql
-- Rollback last migration manually
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;

-- Drop indexes if needed
DROP INDEX IF EXISTS idx_applications_current_state;
-- Repeat for other indexes from last migration
```

### Incident Communication

**Rollback Checklist:**
- [ ] Notify users of system maintenance
- [ ] Create backup before rollback
- [ ] Execute rollback procedure
- [ ] Verify system functionality
- [ ] Communicate restoration to users
- [ ] Document incident and root cause

---

## Quick Reference

### Emergency Contacts
- **System Admin:** [Your contact]
- **Database Admin:** [Your contact]
- **Supabase Support:** https://supabase.com/dashboard/support

### Critical URLs
- **Production App:** https://your-domain.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/shwfzxpypygdxoqxutae
- **Monitoring:** [Your monitoring service]

### Support Resources
- **Documentation:** `/docs/` folder
- **Architecture:** `/docs/Architecture.md`
- **Backend:** `/docs/Backend.md`
- **Security:** `/docs/Security.md`
- **Changelog:** `/docs/Changelog.md`

---

*This deployment guide ensures a secure, performant, and maintainable production deployment of the IMS system.*

**Version:** 0.14.5  
**Last Updated:** January 29, 2025  
**Status:** Production Ready ✅
