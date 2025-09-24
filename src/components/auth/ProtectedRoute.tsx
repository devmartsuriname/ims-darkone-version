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
  const { isAuthenticated, loading, roles } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to sign-in with current location as redirect target
      navigate(`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`)
    }
  }, [isAuthenticated, loading, navigate, location])

  // Show loading while checking authentication
  if (loading) {
    return <Preloader />
  }

  // Not authenticated
  if (!isAuthenticated) {
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