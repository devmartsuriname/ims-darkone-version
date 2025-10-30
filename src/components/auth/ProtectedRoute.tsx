import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import Preloader from '@/components/Preloader'

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
  const { isAuthenticated, loading, roles, profile } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Phase 3: Simplified routing - trust AuthContext state without redundant validation
  useEffect(() => {
    console.info(`🛡️ [ROUTE] ProtectedRoute check - Path: ${location.pathname}`)
    console.info(`🛡️ [ROUTE] Loading: ${loading}, Authenticated: ${isAuthenticated}, Profile: ${!!profile}, Roles: ${roles.length}`)
    
    if (!loading && !isAuthenticated) {
      console.info('🔄 [ROUTE] Not authenticated, redirecting to sign-in')
      navigate(`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, location])

  // ✅ Phase 3: Wait for auth context to finish loading
  if (loading) {
    console.info('⏳ [ROUTE] Auth context still loading...')
    return <Preloader />
  }

  // ✅ Phase 3: Wait for profile and roles to load after authentication
  if (isAuthenticated && (!profile || roles.length === 0)) {
    console.info('⏳ [ROUTE] Waiting for profile and roles to load...')
    return <Preloader />
  }

  // ✅ Phase 3: Not authenticated - show loader while redirecting
  if (!isAuthenticated) {
    console.info('🚫 [ROUTE] Not authenticated, redirecting...')
    return <Preloader />
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