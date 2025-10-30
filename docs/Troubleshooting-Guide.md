# IMS Troubleshooting Guide

## Quick Diagnostic Flowchart

```
Issue Reported
    ↓
Can user access login page?
    ├─ NO → Check DNS, SSL, Hosting
    └─ YES → Can user log in?
        ├─ NO → Check Auth, Credentials, RLS
        └─ YES → Does dashboard load?
            ├─ NO → Check Role Assignment, Cache
            └─ YES → Specific feature issue
                → See Feature-Specific Issues below
```

---

## 🔍 Common Issues by Category

### 1. Authentication & Access

#### Issue: Cannot Log In
**Symptoms:**
- "Invalid credentials" error with correct password
- Login button does nothing
- Redirect loop after login

**Diagnostic Steps:**
```sql
-- Check if user exists in auth.users
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- Check user profile exists
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Check active roles
SELECT role, is_active FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@example.com');
```

**Solutions:**
1. **Password Reset:**
   ```typescript
   await supabase.auth.resetPasswordForEmail('user@example.com', {
     redirectTo: 'https://your-domain.com/auth/reset-password',
   });
   ```

2. **Manual Password Reset (Admin):**
   - Supabase Dashboard → Authentication → Users
   - Find user → Send magic link

3. **Check Email Confirmation:**
   - Verify email_confirmed_at is set in auth.users
   - Resend confirmation email if needed

#### Issue: "You don't have permission to access this page"
**Symptoms:**
- Logged in but can't access dashboard
- See message about insufficient permissions
- Empty dashboard or "Access Denied"

**Diagnostic Steps:**
```sql
-- Verify user has active role
SELECT ur.role, ur.is_active, p.email
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'user@example.com';

-- Check if admin exists (for first-time setup)
SELECT admin_user_exists();
```

**Solutions:**
1. **Assign Role (Admin Required):**
   ```sql
   INSERT INTO user_roles (user_id, role, assigned_by, is_active)
   VALUES (
     (SELECT id FROM profiles WHERE email = 'user@example.com'),
     'staff', -- or 'admin', 'control', etc.
     auth.uid(),
     true
   );
   ```

2. **Reactivate Inactive Role:**
   ```sql
   UPDATE user_roles 
   SET is_active = true 
   WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@example.com');
   ```

3. **First-Time Setup:**
   - Navigate to `/admin/users/setup`
   - Create initial admin account
   - Then assign roles to other users

---

### 2. Dashboard & UI Issues

#### Issue: Stuck on Loading Screen / Infinite Spinner
**Symptoms:**
- Loading spinner never disappears
- Blank white screen with spinner for >30 seconds
- Page never finishes loading
- Browser tab shows loading indicator indefinitely

**Quick Diagnostic:**
```javascript
// Open DevTools (F12) → Console
// Check for auth timeout warnings
// Should see one of:
"⚠️ [AUTH] Timeout after 8s, forcing continue"
"⚠️ [AUTH] Force-stopping loading after 10 seconds"
"⛔ [SYSTEM] Force-stopping loading after 12 seconds"
```

**Immediate Solutions:**

1. **Wait for Recovery UI (12 seconds):**
   - If loading exceeds 12 seconds, automatic recovery UI appears
   - Click "Reload Application" button to refresh
   - Or click "Continue Anyway" to force render

2. **Manual Recovery:**
   ```javascript
   // In DevTools console
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Check Network Connection:**
   - DevTools → Network tab → Check for failed requests
   - Look for red/failed requests to `supabase.co`
   - Verify internet connectivity

4. **Verify Supabase Status:**
   - Check https://status.supabase.com
   - Verify project is not paused/suspended
   - Test Supabase connection:
     ```javascript
     const { data, error } = await supabase.auth.getSession();
     console.log('Session:', data, 'Error:', error);
     ```

**Root Causes:**
- Slow/unstable network connection
- Supabase service delays
- RLS policy performance issues
- Browser extension conflicts

**Prevention (Implemented in v0.15.6):**
- ✅ 8-second timeout on user data fetch
- ✅ 10-second global auth loading limit
- ✅ 12-second recovery UI trigger
- ✅ Automatic fallback mechanisms

**Related Documentation:**
- See [Auth Stabilization Guide](./AuthStabilization.md) for technical details
- See [Session Stability Testing](./testing/Session-Stability-Testing.md) for test procedures

---

#### Issue: Dashboard Not Loading / Blank Screen
**Symptoms:**
- White screen after successful login (but no spinner)
- Console shows "Module not found" errors
- Dashboard components don't render

**Browser Console Check:**
```javascript
// Open DevTools (F12) → Console
// Check for errors

// Test auth status
const { data, error } = await supabase.auth.getUser();
console.log('User:', data.user);

// Test role function
const { data: canManage } = await supabase.rpc('can_manage_applications');
console.log('Can manage:', canManage);
```

**Solutions:**
1. **Clear Browser Cache:**
   - **Chrome/Edge:** Ctrl+Shift+Delete → Clear cached images and files
   - **Firefox:** Ctrl+Shift+Delete → Cached Web Content
   - **Safari:** Cmd+Option+E
   - Then hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

2. **Clear Application Storage:**
   - DevTools → Application → Storage → Clear site data
   - This preserves your login but clears cached components

3. **Check Version Mismatch:**
   ```javascript
   // In browser console
   const appVersion = localStorage.getItem('app_version');
   console.log('Stored version:', appVersion);
   console.log('Current version:', import.meta.env.VITE_BUILD_VERSION);
   
   // Force cache clear
   localStorage.removeItem('app_version');
   location.reload();
   ```

4. **Verify Role Assignment:**
   - See "You don't have permission" section above

#### Issue: Components Loading Slowly
**Symptoms:**
- Dashboard takes 5+ seconds to load
- Spinners visible for extended time
- Browser becomes unresponsive

**Performance Diagnostics:**
```javascript
// Check bundle size in Network tab
// DevTools → Network → Disable cache → Reload

// Profile component rendering
// React DevTools → Profiler → Record → Interact → Stop

// Check memory usage
// DevTools → Performance → Memory → Take heap snapshot
```

**Solutions:**
1. **Check Internet Connection:**
   - Supabase dashboard requires stable connection
   - Test: `ping supabase.co`

2. **Reduce Data Load:**
   ```typescript
   // Limit initial query results
   const { data } = await supabase
     .from('applications')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(20); // Instead of loading all
   ```

3. **Clear React Query Cache:**
   ```typescript
   import { queryClient } from '@/main';
   queryClient.clear();
   ```

---

### 3. Data & RLS Issues

#### Issue: "Row Level Security Policy Violation"
**Symptoms:**
- Cannot create new applications
- Empty tables despite data existing
- Console error: "new row violates row-level security policy"

**RLS Policy Check:**
```sql
-- List all policies for a table
SELECT tablename, policyname, permissive, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'applications';

-- Test specific RLS functions
SELECT 
  can_manage_applications() as can_manage,
  can_review_applications() as can_review,
  is_admin_or_it() as is_admin;

-- Check user's active role
SELECT role, is_active 
FROM user_roles 
WHERE user_id = auth.uid();
```

**Solutions:**
1. **Verify User Has Role:**
   - User must have at least one active role in user_roles table
   - Use admin panel: `/admin/users` to assign roles

2. **Check Column Constraints:**
   ```sql
   -- Ensure user_id or assigned_to is set when required
   -- Example for applications:
   INSERT INTO applications (applicant_id, created_by, ...)
   VALUES (..., auth.uid(), ...);  -- created_by MUST match current user
   ```

3. **Test Policy Manually:**
   ```sql
   -- Temporarily grant yourself admin role
   INSERT INTO user_roles (user_id, role, assigned_by, is_active)
   VALUES (auth.uid(), 'admin', auth.uid(), true)
   ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
   ```

#### Issue: Can't See Own Data
**Symptoms:**
- Applications list is empty
- Created records don't appear
- Other users can see the data but you can't

**Diagnostic Steps:**
```sql
-- Check if records exist
SELECT id, created_by, assigned_to, current_state
FROM applications
WHERE created_by = auth.uid() OR assigned_to = auth.uid();

-- Check RLS policies allow SELECT
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'applications' 
  AND cmd = 'SELECT';
```

**Solutions:**
1. **Verify created_by/assigned_to:**
   - Records must have created_by or assigned_to set to your user ID
   - Or your role must have broader SELECT permissions

2. **Check Active Role:**
   ```sql
   -- Your role must be active
   UPDATE user_roles 
   SET is_active = true 
   WHERE user_id = auth.uid();
   ```

---

### 4. File Upload Issues

#### Issue: File Upload Fails
**Symptoms:**
- Upload button does nothing
- "File size exceeds limit" error
- Permission denied on storage bucket

**File Size Limits:**
- **Documents bucket:** 50MB max
- **Control-photos bucket:** 25MB max

**Allowed File Types:**
- **Documents:** PDF, DOCX, TXT, JPG, PNG, GIF
- **Photos:** JPG, PNG, GIF, WEBP

**Diagnostic Steps:**
```sql
-- Check storage bucket configuration
SELECT * FROM storage.buckets WHERE id IN ('documents', 'control-photos');

-- Check if user can upload
SELECT * FROM storage.objects 
WHERE bucket_id = 'documents' 
  AND owner = auth.uid()
ORDER BY created_at DESC LIMIT 5;

-- Test file validation function
SELECT validate_file_upload(
  'documents',
  'test.pdf',
  10485760,  -- 10MB in bytes
  'application/pdf'
);
```

**Solutions:**
1. **Compress Large Files:**
   - Use online tools to compress PDFs/images
   - Target: <10MB for best performance

2. **Check File Extension:**
   ```typescript
   // Allowed extensions
   const allowedDocs = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
   const allowedPhotos = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
   ```

3. **Verify Storage Policies:**
   ```sql
   -- Check RLS on storage.objects
   SELECT * FROM storage.policies 
   WHERE bucket_id = 'documents';
   ```

4. **Manual Upload Test:**
   ```typescript
   const file = document.querySelector('input[type="file"]').files[0];
   const { data, error } = await supabase.storage
     .from('documents')
     .upload(`test/${file.name}`, file);
   console.log('Upload result:', data, error);
   ```

---

### 5. Workflow & State Issues

#### Issue: Application Stuck in State
**Symptoms:**
- Cannot transition to next workflow state
- "Transition not allowed" error
- Missing required data prevents progression

**State Machine Rules:**
```
DRAFT → INTAKE_REVIEW
  ↓
CONTROL_ASSIGN
  ↓
CONTROL_VISIT_SCHEDULED → CONTROL_IN_PROGRESS
  ↓
TECHNICAL_REVIEW ← Must have control photos
  ↓
SOCIAL_REVIEW
  ↓
DIRECTOR_REVIEW ← Must have tech + social reports
  ↓
MINISTER_DECISION
  ↓
CLOSURE or REJECTED
```

**Gate Control Requirements:**
- **DIRECTOR_REVIEW:** Requires
  - All required documents verified
  - Minimum photo count from control visit (typically 5+)
  - Technical report submitted
  - Social report submitted

**Diagnostic Steps:**
```sql
-- Check application status
SELECT id, current_state, sla_deadline, assigned_to
FROM applications 
WHERE id = 'application-id';

-- Check required documents
SELECT document_type, verification_status 
FROM documents 
WHERE application_id = 'application-id' AND is_required = true;

-- Check control photos count
SELECT COUNT(*) as photo_count
FROM control_photos 
WHERE application_id = 'application-id';

-- Check reports
SELECT 'technical' as report_type, COUNT(*) as count
FROM technical_reports WHERE application_id = 'application-id'
UNION ALL
SELECT 'social', COUNT(*) 
FROM social_reports WHERE application_id = 'application-id';
```

**Solutions:**
1. **Upload Missing Documents:**
   - Navigate to application → Documents tab
   - Upload and verify all required documents (12 total)

2. **Complete Control Visit:**
   - Schedule visit: `/control/schedule`
   - Conduct visit: `/control/visit`
   - Upload minimum photos (5+)

3. **Submit Reports:**
   - Technical report: `/reviews/technical`
   - Social report: `/reviews/social`

4. **Manual State Override (Admin Only):**
   ```sql
   -- Emergency state change
   UPDATE applications 
   SET current_state = 'DIRECTOR_REVIEW'::application_state
   WHERE id = 'application-id';
   
   -- Log the manual change
   INSERT INTO audit_logs (table_name, operation, record_id, user_id)
   VALUES ('applications', 'UPDATE', 'application-id', auth.uid());
   ```

---

### 6. Notification Issues

#### Issue: Notifications Not Appearing
**Symptoms:**
- No toast notifications
- Missing workflow alerts
- Email notifications not sent

**Diagnostic Steps:**
```sql
-- Check notification records
SELECT id, title, message, type, read_at, created_at
FROM notifications 
WHERE recipient_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 10;

-- Check notification service health
SELECT * FROM system_health_reports 
ORDER BY created_at DESC 
LIMIT 1;
```

**Solutions:**
1. **Check Browser Permissions:**
   - Settings → Site permissions → Notifications
   - Allow notifications for your domain

2. **Verify Notification Preferences:**
   ```sql
   SELECT notification_preferences 
   FROM profiles 
   WHERE id = auth.uid();
   ```

3. **Test Notification Creation:**
   ```sql
   INSERT INTO notifications (recipient_id, title, message, type, category)
   VALUES (
     auth.uid(),
     'Test Notification',
     'This is a test message',
     'info',
     'system'
   );
   ```

4. **Check Edge Function Logs:**
   ```bash
   supabase functions logs notification-service --project-ref shwfzxpypygdxoqxutae
   ```

---

### 7. Performance Issues

#### Issue: Slow Query Performance
**Symptoms:**
- Lists take >3 seconds to load
- Dashboard metrics timeout
- Database connection errors

**Performance Check:**
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements 
WHERE mean_exec_time > 1000  -- Queries taking >1 second
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE schemaname = 'public' 
  AND null_frac > 0.1  -- >10% null values
  AND n_distinct > 100;  -- Many distinct values (good index candidate)
```

**Solutions:**
1. **Add Pagination:**
   ```typescript
   const { data, count } = await supabase
     .from('applications')
     .select('*', { count: 'exact' })
     .range(0, 19)  // First 20 records
     .order('created_at', { ascending: false });
   ```

2. **Optimize Queries:**
   ```typescript
   // ❌ Bad: SELECT *
   const { data } = await supabase.from('applications').select('*');
   
   // ✅ Good: Select only needed columns
   const { data } = await supabase
     .from('applications')
     .select('id, application_number, current_state, created_at');
   ```

3. **Use Indexes:**
   - Already created 39 strategic indexes in latest migration
   - Run `ANALYZE` to update statistics:
   ```sql
   ANALYZE applications;
   ANALYZE documents;
   ```

---

## 🛠️ Debugging Tools & Commands

### Browser DevTools

**Check Authentication:**
```javascript
// Console tab
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

**Check RLS Functions:**
```javascript
const { data: isAdmin } = await supabase.rpc('is_admin_or_it');
const { data: canManage } = await supabase.rpc('can_manage_applications');
const { data: canReview } = await supabase.rpc('can_review_applications');
console.log({ isAdmin, canManage, canReview });
```

**Clear Cache Manually:**
```javascript
// Clear everything except auth
Object.keys(localStorage).forEach(key => {
  if (!key.includes('supabase.auth')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

### SQL Debugging

**User & Role Queries:**
```sql
-- Get current user info
SELECT 
  p.id, 
  p.email, 
  p.first_name, 
  p.last_name,
  array_agg(ur.role) as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.is_active = true
WHERE p.id = auth.uid()
GROUP BY p.id, p.email, p.first_name, p.last_name;

-- Check all users and their roles
SELECT 
  p.email,
  p.first_name || ' ' || p.last_name as name,
  ur.role,
  ur.is_active
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.email, ur.role;
```

**Application Status Check:**
```sql
-- Application workflow summary
SELECT 
  current_state,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_days
FROM applications
GROUP BY current_state
ORDER BY count DESC;

-- Applications with missing requirements
SELECT 
  a.id,
  a.application_number,
  a.current_state,
  COUNT(DISTINCT d.id) FILTER (WHERE d.is_required AND d.verification_status != 'VERIFIED') as unverified_docs,
  COUNT(DISTINCT cp.id) as photo_count,
  EXISTS(SELECT 1 FROM technical_reports WHERE application_id = a.id) as has_tech_report,
  EXISTS(SELECT 1 FROM social_reports WHERE application_id = a.id) as has_social_report
FROM applications a
LEFT JOIN documents d ON a.id = d.application_id
LEFT JOIN control_photos cp ON a.id = cp.application_id
GROUP BY a.id, a.application_number, a.current_state
HAVING a.current_state IN ('TECHNICAL_REVIEW', 'SOCIAL_REVIEW', 'DIRECTOR_REVIEW');
```

**Performance Analysis:**
```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 📞 Escalation & Support

### When to Escalate

**Immediate Escalation (System Down):**
- All users cannot access the system
- Database connection errors
- Critical security breach
- Data loss or corruption

**Standard Escalation (Feature Broken):**
- Specific feature not working for all users
- Consistent errors across browsers
- RLS policies blocking legitimate access

**Low Priority (User-Specific):**
- Single user cannot log in
- Browser-specific rendering issues
- Performance on slow connections

### Support Checklist

Before contacting support, gather:
- [ ] User email and role
- [ ] Browser and version (Chrome 120, Firefox 121, etc.)
- [ ] Console error messages (screenshot)
- [ ] Network tab errors (screenshot)
- [ ] Steps to reproduce the issue
- [ ] Expected vs actual behavior
- [ ] Application ID (if applicable)

### Contact Information

**Internal Support:**
- System Admin: [Your contact]
- Database Admin: [Your contact]
- IT Support: [Your contact]

**External Support:**
- Supabase Support: https://supabase.com/dashboard/support
- Lovable Support: [If applicable]

---

## 📚 Additional Resources

- **Architecture Documentation:** `/docs/Architecture.md`
- **Backend Documentation:** `/docs/Backend.md`
- **Security Guide:** `/docs/Security.md`
- **Deployment Guide:** `/docs/Deployment.md`
- **Changelog:** `/docs/Changelog.md`

---

**Last Updated:** January 29, 2025  
**Version:** 0.14.5  
**Status:** Active Guide ✅
