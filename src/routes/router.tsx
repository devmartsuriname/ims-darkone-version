import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { appRoutes, authRoutes } from '@/routes/index'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'

const AppRouter = (props: RouteProps) => {
  return (
    <Routes>
      {/* Public authentication routes */}
      {(authRoutes || []).map((route, idx) => (
        <Route 
          key={idx + route.name} 
          path={route.path} 
          element={
            <PublicRoute>
              <AuthLayout {...props}>{route.element}</AuthLayout>
            </PublicRoute>
          } 
        />
      ))}

      {/* Protected application routes */}
      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            <ProtectedRoute>
              <AdminLayout {...props}>{route.element}</AdminLayout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboards" replace />} />
      <Route path="*" element={<Navigate to="/dashboards" replace />} />
    </Routes>
  )
}

export default AppRouter
