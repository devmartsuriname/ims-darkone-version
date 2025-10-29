import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import Preloader from '@/components/Preloader'
import FallbackLoading from '@/components/FallbackLoading'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const PublicRoute = ({ children, redirectTo = '/dashboards' }: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  console.info('🚦 [ROUTE][Public] Check -', {
    path: location.pathname,
    loading,
    isAuthenticated,
    redirectTo
  })

  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.info('🔀 [ROUTE][Public] Redirecting authenticated user to:', redirectTo)
      // Redirect authenticated users away from public auth pages
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  // Show loading while checking authentication
  if (loading) {
    return <Preloader />
  }

  // If authenticated, show visible loader while redirecting (instead of null)
  if (isAuthenticated) {
    return <FallbackLoading />
  }

  return <>{children}</>
}

export default PublicRoute