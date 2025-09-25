import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'
import RouteGuard from '@/components/auth/RouteGuard'

// Initial System Setup
const InitialSystemSetup = lazy(() => import('@/components/auth/InitialSystemSetup'))

// Core Pages
const DashboardPage = lazy(() => import('@/app/(admin)/dashboards/page'))

// IMS Application Pages
const ApplicationIntakePage = lazy(() => import('@/app/(admin)/applications/intake/page'))
const ApplicationListPage = lazy(() => import('@/app/(admin)/applications/list/page'))

// IMS Control Pages
const ControlQueuePage = lazy(() => import('@/app/(admin)/control/queue/page'))

// IMS Review Pages
const DirectorReviewPage = lazy(() => import('@/app/(admin)/reviews/director/page'))
const MinisterDecisionPage = lazy(() => import('@/app/(admin)/reviews/minister/page'))

// IMS Admin Pages
const UserManagementPage = lazy(() => import('@/app/(admin)/admin/users/page'))

// IMS Deployment Pages
const ProductionReadinessPage = lazy(() => import('@/app/(admin)/deployment/readiness/page'))

// IMS Workflow Management Pages
const WorkflowValidationPage = lazy(() => import('@/app/(admin)/testing/workflow-validation/page'))
const WorkflowTestingPage = lazy(() => import('@/app/(admin)/workflow/testing/page'))


// Polish Pages  
const PolishOverviewPage = lazy(() => import('@/app/(admin)/polish/overview/page'))
const PerformanceOptimizationPage = lazy(() => import('@/app/(admin)/polish/performance/page'))
const UXEnhancementPage = lazy(() => import('@/app/(admin)/polish/ux-enhancement/page'))
const DocumentationPage = lazy(() => import('@/app/(admin)/polish/documentation/page'))
const PolishProductionReadinessPage = lazy(() => import('@/app/(admin)/polish/production-readiness/page'))

// IMS Security Pages
const SecurityScanningPage = lazy(() => import('@/app/(admin)/security/scanning/page'))
const SecurityMonitoringPage = lazy(() => import('@/app/(admin)/security/monitoring/page'))
const SecurityHardeningPage = lazy(() => import('@/app/(admin)/security/hardening/page'))
const PenetrationTestingPage = lazy(() => import('@/app/(admin)/security/penetration/page'))


// Temporary Logo Tools
const LogoReplacer = lazy(() => import('@/components/admin/LogoReplacer'))

// Auth Pages
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))

// Testing Pages
const IntegrationTestingPage = lazy(() => import('@/app/(admin)/testing/integration/page'))
const EndToEndTestPage = lazy(() => import('@/app/(admin)/testing/end-to-end/page'))

// Notification Pages
const NotificationsPage = lazy(() => import('@/app/(admin)/notifications/page'))

const AuthenticationSetupPage = lazy(() => import('@/app/(admin)/admin/auth-setup/page'))
const AuthenticationGuidePage = lazy(() => import('@/app/(admin)/admin/auth-guide/page'))

// Error Pages
const Error404 = lazy(() => import('@/app/(other)/error-pages/pages-404/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboards" />,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: <Navigate to="/dashboards" />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboards',
    name: 'Dashboards',
    element: <DashboardPage />,
  },
]

// IMS Core Routes
const imsRoutes: RoutesProps[] = [
  // Application Management
  {
    path: '/applications/intake',
    name: 'Application Intake',
    element: <ApplicationIntakePage />,
    exact: true,
  },
  {
    path: '/applications/list',
    name: 'Application List',
    element: <ApplicationListPage />,
    exact: true,
  },
  // Control Department
  {
    path: '/control/queue',
    name: 'Control Queue',
    element: (
      <RouteGuard allowedRoles={['control', 'admin', 'it']}>
        <ControlQueuePage />
      </RouteGuard>
    ),
    exact: true,
  },
  // Reviews & Decisions
  {
    path: '/reviews/director',
    name: 'Director Review',
    element: (
      <RouteGuard allowedRoles={['director', 'admin', 'it']}>
        <DirectorReviewPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/reviews/minister',
    name: 'Minister Decision',
    element: (
      <RouteGuard allowedRoles={['minister', 'admin', 'it']}>
        <MinisterDecisionPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/admin/auth-setup',
    name: 'Authentication Setup',
    element: <AuthenticationSetupPage />,
    exact: true,
  },
  // Administration
  {
    path: '/admin/users',
    name: 'User Management',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <UserManagementPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/admin/auth-guide',
    name: 'Authentication Guide',
    element: <AuthenticationGuidePage />,
    exact: true,
  },
  // Testing
  {
    path: '/admin/testing/integration',
    name: 'Integration Testing',
    element: <IntegrationTestingPage />,
    exact: true,
  },
  {
    path: '/admin/testing/end-to-end',
    name: 'End-to-End Testing',
    element: <EndToEndTestPage />,
    exact: true,
  },
  // Notifications
  {
    path: '/admin/notifications',
    name: 'Notifications',
    element: <NotificationsPage />,
    exact: true,
  },
  // Workflow Management Routes
  {
    path: '/workflow/validation',
    name: 'Workflow Validation',
    element: <WorkflowValidationPage />,
    exact: true,
  },
  {
    path: '/workflow/testing',
    name: 'Workflow Testing', 
    element: <WorkflowTestingPage />,
    exact: true,
  },
  // Final Polish Routes
  {
    path: '/polish/overview',
    name: 'Polish Overview',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PolishOverviewPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/polish/performance',
    name: 'Performance Optimization',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PerformanceOptimizationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/polish/ux-enhancement',
    name: 'UX Enhancement',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <UXEnhancementPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/polish/production-readiness',
    name: 'Production Readiness',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PolishProductionReadinessPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/polish/documentation',
    name: 'Documentation & Training',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <DocumentationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/deployment/readiness',
    name: 'Production Readiness',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <ProductionReadinessPage />
      </RouteGuard>
    ),
    exact: true,
  },
  // Security
  {
    path: '/security/scanning',
    name: 'Security Scanning',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SecurityScanningPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/security/monitoring',
    name: 'Security Monitoring',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SecurityMonitoringPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/security/hardening',
    name: 'Security Hardening',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SecurityHardeningPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/security/penetration',
    name: 'Penetration Testing',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PenetrationTestingPage />
      </RouteGuard>
    ),
    exact: true,
  },
  // Temporary Logo Replacement Tool
  {
    path: '/logo-replacer',
    name: 'Logo Replacer',
    element: <LogoReplacer />,
    exact: true,
  },
 ]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Initial Setup',
    path: '/setup',
    element: <InitialSystemSetup />,
  },
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn />,
  },
  {
    name: 'Sign Up',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
  },
  {
    name: 'Reset Password',
    path: '/auth/reset-password',
    element: <ResetPassword />,
  },
  {
    name: 'Lock Screen',
    path: '/auth/lock-screen',
    element: <LockScreen />,
  },
  {
    name: '404 Error',
    path: '/error-pages/pages-404',
    element: <Error404 />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...imsRoutes,
]