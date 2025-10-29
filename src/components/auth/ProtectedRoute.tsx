import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import Preloader from '@/components/Preloader'
import { validateSession } from '@/utils/session-validator'
import { toast } from 'react-toastify'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requireAny?: boolean // If true, user needs ANY of the roles. If false, user needs ALL roles
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireAny = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, roles, session, profile, signOut } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ v0.14.7: Navigation Stability - Session validation on protected routes
  useEffect(() => {
    const checkSession = async () => {
      console.info(`🛡️ [ROUTE] ProtectedRoute check - Path: ${location.pathname}`)
      console.info(`🛡️ [ROUTE] Loading: ${loading}, Authenticated: ${isAuthenticated}, Profile: ${!!profile}, Roles: ${roles.length}`)
      
      if (!loading && isAuthenticated && session) {
        // Validate session on critical routes
        const validSession = await validateSession()
        
        if (!validSession) {
          console.error('❌ [ROUTE] Session validation failed, forcing logout')
          toast.error('Your session has expired. Please sign in again.', {
            position: 'top-center',
            autoClose: 5000
          })
          await signOut()
          return
        }
        
        console.info('✅ [ROUTE] Session validated successfully')
      } else if (!loading && !isAuthenticated) {
        console.info('🔄 [ROUTE] Not authenticated, redirecting to sign-in')
        // ✅ v0.15.2: Use replace to prevent back navigation to protected routes
        navigate(`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
      }
    }
    
    checkSession()
  }, [isAuthenticated, loading, session, navigate, location, signOut, profile, roles])

  // ✅ FIXED: Simplified loading logic - wait for auth check AND user data
  // Show loading while:
  // 1. Auth context is still loading
  // 2. User is authenticated but profile/roles haven't loaded yet
  if (loading) {
    console.info('⏳ [ROUTE] Auth context still loading...')
    return <Preloader />
  }

  if (isAuthenticated && (!profile || roles.length === 0)) {
    console.info('⏳ [ROUTE] Waiting for profile and roles to load...')
    return <Preloader />
  }

  // Not authenticated
  if (!isAuthenticated) {
    console.info('🚫 [ROUTE] Not authenticated, will redirect')
    return null // Will be redirected by useEffect
  }

  // Check role requirements if specified
  if (requiredRoles.length > 0) {
    const userRoles = roles.map(r => r.role)
    
    const hasRequiredRole = requireAny
      ? requiredRoles.some(role => userRoles.includes(role as any))
      : requiredRoles.every(role => userRoles.includes(role as any))

    if (!hasRequiredRole) {
      return (
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center mt-5">
              <div className="card">
                <div className="card-body">
                  <h4 className="text-danger">Access Denied</h4>
                  <p className="text-muted">
                    You don't have the required permissions to access this page.
                  </p>
                  <p className="small text-muted">
                    Required roles: {requiredRoles.join(', ')}
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute