# SQL Test Scripts - IMS Database

## RLS Policy Testing Scripts

### 1. User Role Verification

```sql
-- Check current user's roles
SELECT 
  p.email,
  p.first_name || ' ' || p.last_name as name,
  ur.role,
  ur.is_active,
  ur.assigned_at
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.id = auth.uid();

-- Test all RLS helper functions
SELECT 
  is_admin_or_it() as is_admin,
  can_manage_applications() as can_manage,
  can_review_applications() as can_review,
  can_control_inspect() as can_control,
  get_current_user_role() as current_role;
```

### 2. Application Access Testing

```sql
-- Test application visibility by role
-- Should return applications based on user's role and assignments
SELECT 
  id,
  application_number,
  current_state,
  assigned_to,
  created_by,
  CASE 
    WHEN assigned_to = auth.uid() THEN 'Assigned to me'
    WHEN created_by = auth.uid() THEN 'Created by me'
    ELSE 'General access'
  END as access_reason
FROM applications
ORDER BY created_at DESC
LIMIT 10;

-- Test application creation (staff/front_office only)
INSERT INTO applications (
  application_number,
  service_type,
  current_state,
  created_by
) VALUES (
  'TEST-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
  'SUBSIDY',
  'DRAFT',
  auth.uid()
) RETURNING id, application_number;

-- Clean up test record
-- DELETE FROM applications WHERE application_number LIKE 'TEST-%';
```

### 3. Document Access Testing

```sql
-- Test document visibility
SELECT 
  d.id,
  d.document_name,
  d.verification_status,
  a.application_number,
  d.uploaded_by = auth.uid() as is_my_upload
FROM documents d
JOIN applications a ON d.application_id = a.id
WHERE d.application_id IN (
  SELECT id FROM applications LIMIT 1
);

-- Test document upload permission
-- This should succeed for staff/front_office
INSERT INTO documents (
  application_id,
  document_type,
  document_name,
  uploaded_by,
  verification_status
) VALUES (
  (SELECT id FROM applications LIMIT 1),
  'NATIONAL_ID',
  'test-document.pdf',
  auth.uid(),
  'PENDING'
) RETURNING id;
```

### 4. Role-Based Table Access

```sql
-- Admin/IT: Should see all users
SELECT COUNT(*) as total_users FROM profiles;

-- Admin/IT: Should see all roles
SELECT role, COUNT(*) as user_count 
FROM user_roles 
WHERE is_active = true
GROUP BY role;

-- All authenticated: Should see reference data
SELECT COUNT(*) as reference_items FROM reference_data;

-- Staff: Should see applications
SELECT COUNT(*) as my_applications 
FROM applications 
WHERE assigned_to = auth.uid() OR created_by = auth.uid();
```

## Performance Testing Scripts

### 1. Index Usage Verification

```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM applications 
WHERE current_state = 'DRAFT'
ORDER BY created_at DESC
LIMIT 20;

-- Should show "Index Scan using idx_applications_current_state"

-- Check composite index usage
EXPLAIN ANALYZE
SELECT * FROM applications 
WHERE current_state = 'DIRECTOR_REVIEW' 
  AND assigned_to = auth.uid();

-- Should show "Index Scan using idx_applications_state_assigned"

-- Check notification query performance
EXPLAIN ANALYZE
SELECT * FROM notifications 
WHERE recipient_id = auth.uid() 
  AND read_at IS NULL
ORDER BY created_at DESC;

-- Should show "Index Scan using idx_notifications_recipient_unread"
```

### 2. Query Performance Benchmarks

```sql
-- Measure application list query time
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT 
  a.*,
  ap.first_name || ' ' || ap.last_name as applicant_name,
  COUNT(d.id) as document_count
FROM applications a
LEFT JOIN applicants ap ON a.applicant_id = ap.id
LEFT JOIN documents d ON a.id = d.application_id
WHERE a.current_state != 'CLOSURE'
GROUP BY a.id, ap.first_name, ap.last_name
ORDER BY a.created_at DESC
LIMIT 50;

-- Target: < 100ms execution time

-- Measure dashboard metrics query
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  current_state,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_age_days
FROM applications
WHERE completed_at IS NULL
GROUP BY current_state;

-- Target: < 50ms execution time
```

### 3. Index Size and Health

```sql
-- Check index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
  idx_scan as times_used,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Identify unused indexes (idx_scan = 0)
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%pkey%';
```

## Administrative Scripts

### 1. User Management

```sql
-- Create new admin user (requires admin privileges)
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Get user ID from profiles
  SELECT id INTO new_user_id 
  FROM profiles 
  WHERE email = 'newadmin@example.com';
  
  -- Assign admin role
  INSERT INTO user_roles (user_id, role, assigned_by, is_active)
  VALUES (new_user_id, 'admin', auth.uid(), true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET is_active = true;
END $$;

-- Deactivate user role
UPDATE user_roles 
SET is_active = false 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@example.com');

-- List all active users by role
SELECT 
  p.email,
  p.first_name || ' ' || p.last_name as name,
  ur.role,
  ur.assigned_at
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.is_active = true
ORDER BY ur.role, p.email;
```

### 2. Application Workflow Management

```sql
-- Find stuck applications (in same state > 30 days)
SELECT 
  a.id,
  a.application_number,
  a.current_state,
  a.assigned_to,
  p.email as assigned_to_email,
  EXTRACT(DAY FROM NOW() - a.updated_at) as days_in_state
FROM applications a
LEFT JOIN profiles p ON a.assigned_to = p.id
WHERE a.completed_at IS NULL
  AND a.updated_at < NOW() - INTERVAL '30 days'
ORDER BY a.updated_at ASC;

-- Reassign stuck applications to new user
UPDATE applications
SET assigned_to = (SELECT id FROM profiles WHERE email = 'newassignee@example.com')
WHERE id = 'application-uuid-here';

-- Bulk state update (emergency only)
UPDATE applications 
SET current_state = 'DIRECTOR_REVIEW'
WHERE id IN (
  SELECT a.id FROM applications a
  WHERE a.current_state = 'TECHNICAL_REVIEW'
    AND EXISTS (SELECT 1 FROM technical_reports WHERE application_id = a.id)
    AND EXISTS (SELECT 1 FROM social_reports WHERE application_id = a.id)
);
```

### 3. Data Cleanup

```sql
-- Remove test applications
DELETE FROM applications 
WHERE application_number LIKE 'TEST-%' 
  AND created_at > NOW() - INTERVAL '1 day';

-- Archive old notifications (soft delete - mark as read)
UPDATE notifications 
SET read_at = NOW() 
WHERE created_at < NOW() - INTERVAL '90 days' 
  AND read_at IS NULL;

-- Clean orphaned documents (no application)
SELECT d.id, d.document_name, d.uploaded_at
FROM documents d
LEFT JOIN applications a ON d.application_id = a.id
WHERE a.id IS NULL;

-- Before deleting, backup orphaned documents!
```

### 4. System Health Checks

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check recent database errors
SELECT 
  timestamp,
  error_severity,
  event_message
FROM postgres_logs
WHERE error_severity IN ('ERROR', 'FATAL', 'PANIC')
ORDER BY timestamp DESC
LIMIT 20;

-- Check active connections
SELECT 
  datname,
  usename,
  application_name,
  state,
  COUNT(*)
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY datname, usename, application_name, state;

-- Vacuum statistics
SELECT 
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY last_autovacuum DESC NULLS LAST;
```

## Testing Checklist

### Before Running Tests
- [ ] Backup database: `pg_dump` or use Supabase Dashboard
- [ ] Run tests on staging environment first
- [ ] Have admin credentials ready
- [ ] Document current system state

### RLS Policy Tests
- [ ] Test with each role type (admin, it, staff, control, director, minister, front_office)
- [ ] Verify users can only access their assigned data
- [ ] Confirm admins can access all data
- [ ] Test edge cases (deactivated roles, multiple roles)

### Performance Tests
- [ ] Run each query 3 times and average results
- [ ] Compare before/after index creation
- [ ] Monitor memory and CPU usage
- [ ] Test with production-like data volume

### Administrative Tasks
- [ ] Test user role assignment
- [ ] Verify workflow state transitions
- [ ] Validate data cleanup scripts (on test data only!)
- [ ] Check system health metrics

---

**Safety Notes:**
- ⚠️ Always use transactions for destructive operations
- ⚠️ Test DELETE/UPDATE queries with SELECT first
- ⚠️ Keep backups before running cleanup scripts
- ⚠️ Run performance tests during off-peak hours

**Last Updated:** January 29, 2025  
**Version:** 0.14.5
