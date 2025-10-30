import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { appRoutes, authRoutes } from '@/routes/index'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'
import InitialSystemSetup from '@/components/auth/InitialSystemSetup'
import SetupRouteGuard from '@/components/auth/SetupRouteGuard'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { AuthLoadingBoundary } from '@/components/auth/AuthLoadingBoundary'

const AppRouter = (props: RouteProps) => {
  return (
    <AuthLoadingBoundary>
      <Routes>
        {/* System setup route - no layout wrapper */}
        <Route path="/setup" element={
          <SetupRouteGuard>
            <InitialSystemSetup />
          </SetupRouteGuard>
        } />

        {/* Public authentication routes */}
        {(authRoutes || []).map((route, idx) => (
          <Route 
            key={idx + route.name} 
            path={route.path} 
            element={
              <ErrorBoundary>
                <PublicRoute>
                  <AuthLayout {...props}>{route.element}</AuthLayout>
                </PublicRoute>
              </ErrorBoundary>
            } 
          />
        ))}

        {/* Protected application routes */}
        {(appRoutes || []).map((route, idx) => (
          <Route
            key={idx + route.name}
            path={route.path}
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AdminLayout {...props}>{route.element}</AdminLayout>
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
        ))}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboards" replace />} />
        <Route path="/auth/login" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="*" element={<Navigate to="/dashboards" replace />} />
      </Routes>
    </AuthLoadingBoundary>
  )
}

export default AppRouter
