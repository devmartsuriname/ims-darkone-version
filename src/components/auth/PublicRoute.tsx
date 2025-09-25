import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import Preloader from '@/components/Preloader'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const PublicRoute = ({ children, redirectTo = '/dashboards' }: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect authenticated users away from public auth pages
      navigate(redirectTo)
    }
  }, [isAuthenticated, loading, navigate, redirectTo])

  // Show loading while checking authentication
  if (loading) {
    return <Preloader />
  }

  // If authenticated, don't render the component (will be redirected)
  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default PublicRoute