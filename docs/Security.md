# IMS Security Architecture & Implementation

## Security Overview

The IMS security model implements defense-in-depth principles with multiple layers of protection, from database-level Row Level Security (RLS) to application-level access controls and comprehensive audit logging.

## Authentication Model

### Supabase Authentication
- **Primary Method**: Email/password authentication
- **Session Management**: JWT tokens with automatic refresh
- **Password Policy**: Minimum 8 characters, complexity requirements
- **Account Security**: Email verification, password reset flows
- **Session Timeout**: Configurable timeout with automatic logout

### Multi-Factor Authentication (Future)
- SMS-based 2FA for high-privilege roles
- TOTP application support
- Backup codes for account recovery
- Admin-enforced MFA for sensitive roles

### Single Sign-On Integration (Future)
- SAML 2.0 support for government SSO
- OAuth 2.0 for external identity providers
- JWT token federation
- User provisioning and deprovisioning

## Authorization & Access Control

### Role-Based Access Control (RBAC)

#### Role Definitions
```typescript
export enum UserRole {
  ADMIN = 'Admin',
  IT = 'IT',
  STAFF = 'Staff',
  CONTROL = 'Control',
  DIRECTOR = 'Director',
  MINISTER = 'Minister',
  FRONT_OFFICE = 'Front Office'
}
```

#### Permission Matrix
```typescript
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    applications: ['create', 'read', 'update', 'delete'],
    documents: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    control_visits: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update'],
    decisions: ['read'],
    audit_logs: ['read'],
    system_settings: ['read', 'update']
  },
  
  [UserRole.IT]: {
    applications: ['create', 'read', 'update'],
    documents: ['create', 'read', 'update'],
    users: ['create', 'read', 'update'],
    control_visits: ['create', 'read', 'update'],
    reports: ['create', 'read', 'update'],
    decisions: ['read'],
    audit_logs: ['read'],
    system_settings: ['read', 'update']
  },
  
  [UserRole.STAFF]: {
    applications: ['create', 'read', 'update'],
    documents: ['create', 'read', 'update'],
    control_visits: ['read'],
    reports: ['create', 'read', 'update'],
    decisions: ['read']
  },
  
  [UserRole.CONTROL]: {
    applications: ['read', 'update'], // Only assigned applications
    documents: ['read'],
    control_visits: ['create', 'read', 'update'],
    control_photos: ['create', 'read'],
    reports: ['create', 'read']
  },
  
  [UserRole.DIRECTOR]: {
    applications: ['read'],
    documents: ['read'],
    control_visits: ['read'],
    reports: ['read'],
    decisions: ['create', 'read', 'update']
  },
  
  [UserRole.MINISTER]: {
    applications: ['read'],
    documents: ['read'],
    reports: ['read'],
    decisions: ['create', 'read', 'update']
  },
  
  [UserRole.FRONT_OFFICE]: {
    applications: ['create', 'read', 'update'], // Only own applications
    documents: ['create', 'read', 'update'],
    applicants: ['create', 'read', 'update']
  }
} as const
```

### Contextual Permissions
```typescript
// Permission checking with context
export const checkApplicationAccess = (
  user: User,
  application: Application,
  action: string
): boolean => {
  const basePermission = hasBasePermission(user.role, 'applications', action)
  
  if (!basePermission) return false
  
  switch (user.role) {
    case UserRole.FRONT_OFFICE:
      return application.created_by === user.id
      
    case UserRole.CONTROL:
      return application.assigned_control_officer === user.id
      
    case UserRole.DIRECTOR:
      return application.status === 'DIRECTOR_REVIEW'
      
    case UserRole.MINISTER:
      return application.status === 'MINISTER_DECISION'
      
    case UserRole.ADMIN:
    case UserRole.IT:
    case UserRole.STAFF:
      return true
      
    default:
      return false
  }
}
```

## Database Security

### Row Level Security (RLS) Policies

#### User Profile Security
```sql
-- Users can only view/edit their own profile, admins can manage all
CREATE POLICY profiles_access_policy ON profiles
  FOR ALL USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('Admin', 'IT')
    )
  );
```

#### Application Security
```sql
-- Role-based application access with contextual restrictions
CREATE POLICY applications_select_policy ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        -- Admin and IT can see all
        p.role IN ('Admin', 'IT') OR
        
        -- Staff can see all applications
        p.role = 'Staff' OR
        
        -- Front Office can see only applications they created
        (p.role = 'Front Office' AND created_by = p.id) OR
        
        -- Control can see only assigned applications
        (p.role = 'Control' AND assigned_control_officer = p.id) OR
        
        -- Director can see applications in review
        (p.role = 'Director' AND status IN ('DIRECTOR_REVIEW', 'MINISTER_DECISION', 'CLOSURE')) OR
        
        -- Minister can see applications requiring decision
        (p.role = 'Minister' AND status IN ('MINISTER_DECISION', 'CLOSURE'))
      )
    )
  );

-- Application creation restricted to authorized roles
CREATE POLICY applications_insert_policy ON applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Staff', 'Front Office')
    ) AND
    created_by = auth.uid()
  );

-- Application updates based on role and workflow state
CREATE POLICY applications_update_policy ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        -- Admin and IT can update any application
        p.role IN ('Admin', 'IT') OR
        
        -- Staff can update applications in early stages
        (p.role = 'Staff' AND status IN ('DRAFT', 'INTAKE_REVIEW')) OR
        
        -- Front Office can update only their draft applications
        (p.role = 'Front Office' AND created_by = p.id AND status = 'DRAFT') OR
        
        -- Control can update during control phase
        (p.role = 'Control' AND assigned_control_officer = p.id AND 
         status IN ('CONTROL_ASSIGN', 'CONTROL_VISIT_SCHEDULED', 'CONTROL_IN_PROGRESS')) OR
        
        -- Director can update during review phase
        (p.role = 'Director' AND status = 'DIRECTOR_REVIEW') OR
        
        -- Minister can update during decision phase
        (p.role = 'Minister' AND status = 'MINISTER_DECISION')
      )
    )
  );
```

#### Document Security
```sql
-- Document access based on application access
CREATE POLICY documents_access_policy ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = application_id AND (
        -- Admin, IT, Staff can see all documents
        p.role IN ('Admin', 'IT', 'Staff') OR
        
        -- Front Office can see documents for their applications
        (p.role = 'Front Office' AND a.created_by = p.id) OR
        
        -- Control can see documents for assigned applications
        (p.role = 'Control' AND a.assigned_control_officer = p.id) OR
        
        -- Director and Minister can see documents for applications in their review
        (p.role = 'Director' AND a.status IN ('DIRECTOR_REVIEW', 'MINISTER_DECISION', 'CLOSURE')) OR
        (p.role = 'Minister' AND a.status IN ('MINISTER_DECISION', 'CLOSURE'))
      )
    )
  );

-- Document upload restrictions
CREATE POLICY documents_insert_policy ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = application_id AND (
        p.role IN ('Admin', 'IT', 'Staff') OR
        (p.role = 'Front Office' AND a.created_by = p.id) OR
        (p.role = 'Control' AND a.assigned_control_officer = p.id)
      )
    ) AND
    uploaded_by = auth.uid()
  );
```

#### Control Visit Security
```sql
-- Control visits restricted to control department
CREATE POLICY control_visits_access_policy ON control_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        p.role IN ('Admin', 'IT', 'Staff', 'Director', 'Minister') OR
        (p.role = 'Control' AND (assigned_officer = p.id OR scheduled_by = p.id))
      )
    )
  );

-- Photo access for control visits
CREATE POLICY control_photos_access_policy ON control_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (
        p.role IN ('Admin', 'IT', 'Staff', 'Director', 'Minister') OR
        p.role = 'Control'
      )
    )
  );
```

#### Audit Log Security
```sql
-- Audit logs are read-only for authorized roles
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Director')
    )
  );

-- Prevent modifications to audit logs
CREATE POLICY audit_logs_immutable ON audit_logs 
  FOR UPDATE USING (false);
  
CREATE POLICY audit_logs_no_delete ON audit_logs 
  FOR DELETE USING (false);
```

### Database Triggers for Security

#### Automatic Audit Logging
```sql
-- Audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all changes to critical tables
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    timestamp
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    current_setting('request.headers')::json->>'x-forwarded-for',
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER applications_audit AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER documents_audit AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER profiles_audit AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_changes();
```

#### Data Validation Triggers
```sql
-- Ensure workflow state transitions are valid
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate status transitions
  IF NOT is_valid_transition(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  -- Validate role permissions for status changes
  IF NOT can_change_status(auth.uid(), OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Insufficient permissions to change status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_application_status_change
  BEFORE UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION validate_status_transition();
```

## File Storage Security

### Storage Bucket Configuration
```sql
-- Secure document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Control photos storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'control-photos',
  'control-photos',
  false,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### Storage Access Policies
```sql
-- Document storage access
CREATE POLICY documents_storage_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM documents d
      JOIN applications a ON a.id = d.application_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE d.file_path = name AND (
        p.role IN ('Admin', 'IT', 'Staff', 'Director', 'Minister') OR
        (p.role = 'Front Office' AND a.created_by = p.id) OR
        (p.role = 'Control' AND a.assigned_control_officer = p.id)
      )
    )
  );

-- Document upload restrictions
CREATE POLICY documents_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND 
      p.role IN ('Admin', 'IT', 'Staff', 'Front Office', 'Control')
    )
  );

-- Prevent document deletion (use soft delete in metadata)
CREATE POLICY documents_storage_no_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );
```

### Signed URL Generation
```typescript
// Secure file access with time-limited URLs
export class FileAccessService {
  private supabase = supabaseClient
  
  async getSecureFileUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    // Verify user has access to this file
    const hasAccess = await this.verifyFileAccess(bucket, path)
    if (!hasAccess) {
      throw new Error('Access denied')
    }
    
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    
    if (error) throw error
    
    // Log file access for audit
    await this.logFileAccess(bucket, path)
    
    return data.signedUrl
  }
  
  private async verifyFileAccess(bucket: string, path: string): Promise<boolean> {
    // Implement file access verification based on RLS policies
    const { data } = await this.supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'))
    
    return data?.some(file => file.name === path.split('/').pop())
  }
  
  private async logFileAccess(bucket: string, path: string): Promise<void> {
    await this.supabase.functions.invoke('audit-log', {
      body: {
        action: 'FILE_ACCESS',
        entity_type: 'storage_object',
        entity_id: `${bucket}/${path}`,
        new_values: { bucket, path, accessed_at: new Date() }
      }
    })
  }
}
```

## Application Security

### Input Validation & Sanitization
```typescript
// Comprehensive input validation
export const applicationValidationSchema = yup.object({
  applicant: yup.object({
    nationalId: yup.string()
      .required('National ID is required')
      .matches(/^[0-9]{9}$/, 'National ID must be 9 digits')
      .test('unique', 'National ID already exists', async (value) => {
        if (!value) return true
        const exists = await checkNationalIdExists(value)
        return !exists
      }),
    
    firstName: yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    
    email: yup.string()
      .email('Invalid email format')
      .max(255, 'Email cannot exceed 255 characters'),
    
    phone: yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .min(7, 'Phone number too short')
      .max(15, 'Phone number too long')
  }),
  
  property: yup.object({
    address: yup.string()
      .required('Address is required')
      .min(10, 'Address must be at least 10 characters')
      .max(255, 'Address cannot exceed 255 characters'),
    
    surfaceArea: yup.number()
      .required('Surface area is required')
      .positive('Surface area must be positive')
      .max(10000, 'Surface area seems unrealistic')
  })
})

// HTML sanitization for text inputs
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}
```

### CSRF Protection
```typescript
// CSRF token management
export class CSRFService {
  private static TOKEN_HEADER = 'X-CSRF-Token'
  
  static generateToken(): string {
    return crypto.randomUUID()
  }
  
  static setToken(token: string): void {
    sessionStorage.setItem('csrf_token', token)
  }
  
  static getToken(): string | null {
    return sessionStorage.getItem('csrf_token')
  }
  
  static attachToRequest(request: any): any {
    const token = this.getToken()
    if (token) {
      request.headers[this.TOKEN_HEADER] = token
    }
    return request
  }
}

// Axios interceptor for CSRF
axios.interceptors.request.use((config) => {
  return CSRFService.attachToRequest(config)
})
```

### XSS Protection
```typescript
// Content Security Policy
export const CSP_POLICY = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' ${supabaseUrl} https://api.iconify.design;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`

// React component sanitization
export const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
}
```

## Audit Logging & Monitoring

### Comprehensive Audit Trail
```typescript
// Audit service for application events
export class AuditService {
  private supabase = supabaseClient
  
  async logUserAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: any
  ): Promise<void> {
    const user = await getCurrentUser()
    
    await this.supabase.functions.invoke('audit-log', {
      body: {
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        new_values: details,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        session_id: this.getSessionId()
      }
    })
  }
  
  async logSecurityEvent(
    event: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details: any
  ): Promise<void> {
    await this.supabase.functions.invoke('security-log', {
      body: {
        event,
        severity,
        details,
        timestamp: new Date().toISOString(),
        user_id: (await getCurrentUser())?.id,
        ip_address: await this.getClientIP()
      }
    })
  }
  
  private getSessionId(): string {
    return sessionStorage.getItem('session_id') || 'anonymous'
  }
  
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}
```

### Security Event Monitoring
```typescript
// Security monitoring service
export class SecurityMonitoringService {
  private auditService = new AuditService()
  
  // Monitor failed login attempts
  async handleFailedLogin(email: string): Promise<void> {
    await this.auditService.logSecurityEvent('FAILED_LOGIN', 'MEDIUM', {
      email,
      timestamp: new Date().toISOString()
    })
    
    // Check for brute force attacks
    const recentFailures = await this.getRecentFailedLogins(email)
    if (recentFailures.length >= 5) {
      await this.handleBruteForceAttempt(email)
    }
  }
  
  // Monitor suspicious file access
  async handleSuspiciousFileAccess(fileId: string, userId: string): Promise<void> {
    await this.auditService.logSecurityEvent('SUSPICIOUS_FILE_ACCESS', 'HIGH', {
      file_id: fileId,
      user_id: userId,
      reason: 'Access to file without application relationship'
    })
  }
  
  // Monitor privilege escalation attempts
  async handlePrivilegeEscalation(userId: string, attemptedAction: string): Promise<void> {
    await this.auditService.logSecurityEvent('PRIVILEGE_ESCALATION', 'CRITICAL', {
      user_id: userId,
      attempted_action: attemptedAction,
      current_role: await this.getCurrentUserRole(userId)
    })
  }
  
  private async handleBruteForceAttempt(email: string): Promise<void> {
    // Implement account lockout logic
    // Send alert to administrators
    // Log critical security event
    await this.auditService.logSecurityEvent('BRUTE_FORCE_DETECTED', 'CRITICAL', {
      target_email: email,
      action_taken: 'account_lockout'
    })
  }
}
```

## Data Privacy & Compliance

### GDPR Compliance
```typescript
// Data privacy service
export class DataPrivacyService {
  private supabase = supabaseClient
  
  // Data anonymization for audit logs
  async anonymizeUserData(userId: string): Promise<void> {
    // Replace PII with anonymized identifiers
    await this.supabase.rpc('anonymize_user_data', {
      user_id: userId,
      anonymization_key: this.generateAnonymizationKey()
    })
  }
  
  // Data export for GDPR requests
  async exportUserData(userId: string): Promise<any> {
    const userData = await this.supabase.rpc('export_user_data', {
      user_id: userId
    })
    
    // Log data export request
    await new AuditService().logUserAction(
      'DATA_EXPORT',
      'user',
      userId,
      { export_type: 'gdpr_request' }
    )
    
    return userData
  }
  
  // Data retention compliance
  async enforceDataRetention(): Promise<void> {
    // Archive old applications
    const cutoffDate = new Date()
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7) // 7-year retention
    
    await this.supabase.rpc('archive_old_applications', {
      cutoff_date: cutoffDate.toISOString()
    })
  }
  
  private generateAnonymizationKey(): string {
    return crypto.randomUUID()
  }
}
```

### Data Encryption
```typescript
// Client-side encryption for sensitive data
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM'
  private static readonly KEY_LENGTH = 256
  
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    )
  }
  
  static async encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      dataBuffer
    )
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)
    
    return btoa(String.fromCharCode(...combined))
  }
  
  static async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    )
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  }
}
```

## Security Testing & Validation

### Automated Security Testing
```typescript
// Security test suite
describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token'
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${invalidToken}`)
        
      expect(response.status).toBe(401)
    })
    
    it('should enforce session timeout', async () => {
      // Test session expiration logic
    })
  })
  
  describe('Authorization', () => {
    it('should prevent unauthorized access to applications', async () => {
      const frontOfficeUser = await createTestUser('Front Office')
      const otherUserApplication = await createTestApplication()
      
      const response = await request(app)
        .get(`/api/applications/${otherUserApplication.id}`)
        .set('Authorization', await getAuthToken(frontOfficeUser))
        
      expect(response.status).toBe(403)
    })
  })
  
  describe('Input Validation', () => {
    it('should sanitize HTML input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('Hello')
    })
    
    it('should validate file uploads', async () => {
      const maliciousFile = new File(['<script>'], 'malicious.js', {
        type: 'application/javascript'
      })
      
      await expect(uploadDocument(maliciousFile)).rejects.toThrow('Invalid file type')
    })
  })
})
```

### Penetration Testing Checklist
- [ ] SQL injection testing on all database queries
- [ ] Cross-site scripting (XSS) testing on all input fields
- [ ] Cross-site request forgery (CSRF) testing
- [ ] Authentication bypass testing
- [ ] Authorization bypass testing
- [ ] File upload vulnerability testing
- [ ] Session management testing
- [ ] Information disclosure testing
- [ ] Business logic testing
- [ ] API security testing

## Security Incident Response

### Incident Response Plan
```typescript
// Security incident response service
export class IncidentResponseService {
  private static readonly SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  } as const
  
  async handleSecurityIncident(
    type: string,
    severity: keyof typeof IncidentResponseService.SEVERITY_LEVELS,
    details: any
  ): Promise<void> {
    // Log the incident
    await new AuditService().logSecurityEvent(type, severity, details)
    
    // Immediate response based on severity
    switch (severity) {
      case 'CRITICAL':
        await this.handleCriticalIncident(type, details)
        break
      case 'HIGH':
        await this.handleHighSeverityIncident(type, details)
        break
      default:
        await this.handleStandardIncident(type, details)
    }
    
    // Notify incident response team
    await this.notifyIncidentTeam(type, severity, details)
  }
  
  private async handleCriticalIncident(type: string, details: any): Promise<void> {
    // Immediate containment actions
    if (type === 'BRUTE_FORCE_DETECTED') {
      await this.enableTemporaryLockout(details.target_email)
    }
    
    if (type === 'DATA_BREACH_SUSPECTED') {
      await this.enableEmergencyMode()
    }
  }
  
  private async enableEmergencyMode(): Promise<void> {
    // Implement emergency security measures
    // Disable non-essential features
    // Increase audit logging
    // Alert all administrators
  }
}
```

## Security Configuration

### Environment Security
```typescript
// Secure environment configuration
export const securityConfig = {
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT || '3600'), // 1 hour
    renewalThreshold: parseInt(process.env.SESSION_RENEWAL_THRESHOLD || '600'), // 10 minutes
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3')
  },
  
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true'
  },
  
  bruteForce: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900'), // 15 minutes
    attackThreshold: parseInt(process.env.ATTACK_THRESHOLD || '10')
  },
  
  audit: {
    retentionPeriod: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'), // 7 years
    realTimeAlerting: process.env.REAL_TIME_ALERTING === 'true',
    encryptionEnabled: process.env.AUDIT_ENCRYPTION === 'true'
  }
}
```

## Security Maintenance

### Regular Security Tasks
- [ ] Weekly security scan execution
- [ ] Monthly user access review
- [ ] Quarterly penetration testing
- [ ] Annual security architecture review
- [ ] Continuous vulnerability monitoring
- [ ] Regular backup and recovery testing
- [ ] Security awareness training updates
- [ ] Incident response plan testing