# Session Stability & Cache Management

## Session Management Architecture (v0.14.4)

### Session Validator Utilities

**File**: `src/utils/session-validator.ts`

```typescript
/**
 * Validates the current session and refreshes if needed
 * @returns Valid session or null if validation fails
 */
export const validateSession = async (): Promise<Session | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // Check if session is expiring soon (within 5 minutes)
  const expiresAt = session.expires_at;
  if (expiresAt) {
    const timeUntilExpiry = expiresAt - Math.floor(Date.now() / 1000);
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      const { data: { session: refreshedSession } } = 
        await supabase.auth.refreshSession();
      return refreshedSession;
    }
  }
  
  return session;
};

/**
 * Handles token refresh failure with retry logic
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @returns Valid session or null after all retries fail
 */
export const handleTokenRefreshFailure = async (
  maxRetries: number = 3
): Promise<Session | null> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    // Wait with exponential backoff: 1s, 2s, 4s
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, retries) * 1000)
    );
    
    const session = await forceRefreshSession();
    if (session) return session;
    
    retries++;
  }
  
  return null;
};
```

### Enhanced Auth Context

**File**: `src/context/useAuthContext.tsx`

#### Profile Fetch with Retry Logic
```typescript
const fetchUserData = async (userId: string, retries: number = 3): Promise<boolean> => {
  try {
    // Fetch profile with retry
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && retries > 0) {
      console.warn(`🔄 Retrying profile fetch (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserData(userId, retries - 1);
    }
    
    if (profileData) setProfile(profileData);
    
    // Same retry logic for roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (rolesError && retries > 0) {
      console.warn(`🔄 Retrying roles fetch (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserData(userId, retries - 1);
    }
    
    if (rolesData) setRoles(rolesData);
    return true;
  } catch (error) {
    if (retries > 0) {
      console.warn(`🔄 Retrying after exception (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserData(userId, retries - 1);
    }
    return false;
  }
};
```

#### Auth State Initialization
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.info(`🔐 Auth state changed: ${event}`);
      
      setSession(session);
      
      if (session?.user) {
        setUser(session.user as AuthUser);
        
        // ✅ 100ms delay prevents race conditions (increased from 0ms)
        setTimeout(async () => {
          const success = await fetchUserData(session.user.id);
          if (!success) {
            console.error('❌ Failed to fetch user data after retries');
          }
        }, 100);
      } else {
        setUser(null);
        setProfile(null);
        setRoles([]);
      }
      
      setLoading(false);
    }
  );

  // Check for existing session with validation
  supabase.auth.getSession().then(async ({ data: { session }, error }) => {
    if (error) {
      console.error('❌ Session retrieval error:', error);
      setLoading(false);
      return;
    }
    
    setSession(session);
    
    if (session?.user) {
      setUser(session.user as AuthUser);
      await fetchUserData(session.user.id);
    }
    
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

### Protected Route Session Validation

**File**: `src/components/auth/ProtectedRoute.tsx`

```typescript
const ProtectedRoute = ({ children, requiredRoles, requireAny }) => {
  const { isAuthenticated, loading, session, signOut } = useAuthContext();
  const [sessionValidated, setSessionValidated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!loading && isAuthenticated && session) {
        // Validate session on route access
        const validSession = await validateSession();
        
        if (!validSession) {
          console.error('❌ Session validation failed, forcing logout');
          toast.error('Your session has expired. Please sign in again.');
          await signOut();
          return;
        }
        
        setSessionValidated(true);
      } else if (!loading && !isAuthenticated) {
        navigate(`/auth/sign-in?redirectTo=${...}`);
      }
    };
    
    checkSession();
  }, [isAuthenticated, loading, session]);

  // Show loading while validating
  if (loading || (isAuthenticated && !sessionValidated)) {
    return <Preloader />;
  }

  return <>{children}</>;
};
```

## Cache Management System (v0.14.4)

### Build Version Tracking

**File**: `src/utils/cache-cleaner.ts`

```typescript
const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || `build-${Date.now()}`;
const STORAGE_KEY = 'app_build_version';
const AUTH_TOKEN_KEY = 'sb-shwfzxpypygdxoqxutae-auth-token';

export const checkAndClearCache = async (): Promise<void> => {
  const storedVersion = localStorage.getItem(STORAGE_KEY);
  
  // If version changed, clear cache
  if (storedVersion && storedVersion !== BUILD_VERSION) {
    console.info(`🧹 New build detected (${storedVersion} → ${BUILD_VERSION})`);
    
    // Preserve auth token
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore auth
    if (authToken) localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
    
    window.location.reload();
  } else if (!storedVersion) {
    localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
  }
};
```

### Vite Configuration

**File**: `vite.config.ts`

```typescript
export default defineConfig(({ mode }) => ({
  // ... existing config ...
  
  // Hash-based file naming for cache busting
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  
  // Build version injection
  define: {
    'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(
      process.env.VITE_BUILD_VERSION || `v${Date.now()}`
    )
  }
}));
```

### Cache Control Headers

**File**: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Cache Control Headers -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <title>IMS | DVH - Internal Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Application Initialization

**File**: `src/main.tsx`

```typescript
import { checkAndClearCache } from './utils/cache-cleaner';

// Check cache before rendering
checkAndClearCache().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={basePath}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});
```

## Benefits

### Session Stability
- ✅ **Retry Logic**: 3 attempts with 1s delay between retries
- ✅ **Race Condition Prevention**: 100ms delay before profile fetch
- ✅ **Session Validation**: Auto-refresh sessions expiring within 5 minutes
- ✅ **Token Refresh Failure**: Exponential backoff retry (1s, 2s, 4s)
- ✅ **Error Logging**: Clear console indicators for debugging

### Cache Management
- ✅ **Automatic Clear**: Detects new builds and clears stale cache
- ✅ **Auth Preservation**: Keeps users logged in through cache clears
- ✅ **Hash-Based Naming**: Prevents browser from serving stale JS/CSS
- ✅ **No-Cache Headers**: Forces fresh fetch of index.html
- ✅ **Manual Clear**: Debugging function `window.__forceClearCache()`

## Testing

Refer to comprehensive testing documentation:
- `docs/testing/Session-Stability-Testing.md` (16 test cases)
- `docs/testing/Cache-Management-Testing.md` (14 test cases)
- `docs/testing/Role-Based-Access-Testing.md` (17 test cases)
