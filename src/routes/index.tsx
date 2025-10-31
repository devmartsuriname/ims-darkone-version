import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'
import RouteGuard from '@/components/auth/RouteGuard'

// Initial System Setup
const InitialSystemSetup = lazy(() => import('@/components/auth/InitialSystemSetup'))

// Core Pages
const DashboardPage = lazy(() => import('@/app/(admin)/dashboards/page'))

// Applicant Pages
const ApplicantDashboardPage = lazy(() => import('@/app/(admin)/applicant/dashboard/page'))
const ApplicantApplicationsPage = lazy(() => import('@/app/(admin)/applicant/applications/page'))
const ApplicantSubmitPage = lazy(() => import('@/app/(admin)/applicant/submit/page'))

// IMS Application Pages
const ApplicationIntakePage = lazy(() => import('@/app/(admin)/applications/intake/page'))
const ApplicationListPage = lazy(() => import('@/app/(admin)/applications/list/page'))

// IMS Control Pages
const ControlQueuePage = lazy(() => import('@/app/(admin)/control/queue/page'))
const ControlSchedulePage = lazy(() => import('@/app/(admin)/control/schedule/page'))
const ControlVisitPage = lazy(() => import('@/app/(admin)/control/visit/page'))
const ControlVisitsPage = lazy(() => import('@/app/(admin)/control/visits/page'))

// IMS Review Pages
const DirectorReviewPage = lazy(() => import('@/app/(admin)/reviews/director/page'))
const MinisterDecisionPage = lazy(() => import('@/app/(admin)/reviews/minister/page'))
const TechnicalReviewPage = lazy(() => import('@/app/(admin)/reviews/technical/page'))
const SocialReviewPage = lazy(() => import('@/app/(admin)/reviews/social/page'))
const SocialAssessmentPage = lazy(() => import('@/app/(admin)/reviews/social/assessment/page'))
const ReviewArchivePage = lazy(() => import('@/app/(admin)/reviews/archive/page'))

// IMS Admin Pages
const UserManagementPage = lazy(() => import('@/app/(admin)/admin/users/page'))
const SystemSettingsPage = lazy(() => import('@/app/(admin)/admin/settings/page'))

// User Pages
const UserProfilePage = lazy(() => import('@/app/(admin)/profile/page'))
const HelpPage = lazy(() => import('@/app/(admin)/help/page'))

// IMS Deployment Pages
const ProductionReadinessPage = lazy(() => import('@/app/(admin)/deployment/readiness/page'))
const DeploymentGuidePage = lazy(() => import('@/app/(admin)/deployment/guide/page'))

// IMS Workflow Management Pages
const WorkflowValidationPage = lazy(() => import('@/app/(admin)/testing/workflow-validation/page'))
const WorkflowTestingPage = lazy(() => import('@/app/(admin)/workflow/testing/page'))
const WorkflowMonitoringPage = lazy(() => import('@/app/(admin)/workflow/monitoring/page'))

// IMS Monitoring Pages  
const SystemHealthPage = lazy(() => import('@/app/(admin)/monitoring/system-health/page'))


// Polish Pages  
const PolishOverviewPage = lazy(() => import('@/app/(admin)/polish/overview/page'))
const PerformanceOptimizationPage = lazy(() => import('@/app/(admin)/polish/performance/page'))
const UXEnhancementPage = lazy(() => import('@/app/(admin)/polish/ux-enhancement/page'))
const DocumentationPage = lazy(() => import('@/app/(admin)/polish/documentation/page'))
const PolishProductionReadinessPage = lazy(() => import('@/app/(admin)/polish/production-readiness/page'))
const PolishSecurityPage = lazy(() => import('@/app/(admin)/polish/security/page'))
const PolishUATPage = lazy(() => import('@/app/(admin)/polish/uat/page'))

// IMS Security Pages
const SecurityScanningPage = lazy(() => import('@/app/(admin)/security/scanning/page'))
const SecurityMonitoringPage = lazy(() => import('@/app/(admin)/security/monitoring/page'))
const SecurityHardeningPage = lazy(() => import('@/app/(admin)/security/hardening/page'))
const PenetrationTestingPage = lazy(() => import('@/app/(admin)/security/penetration/page'))
const SecurityFinalValidationPage = lazy(() => import('@/app/(admin)/security/final-validation/page'))



// Auth Pages
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))

// Testing Pages
const IntegrationTestingPage = lazy(() => import('@/app/(admin)/testing/integration/page'))
const EndToEndTestPage = lazy(() => import('@/app/(admin)/testing/end-to-end/page'))
const SystemValidationPage = lazy(() => import('@/app/(admin)/testing/system-validation/page'))
const UATPreparationPage = lazy(() => import('@/app/(admin)/testing/uat-preparation/page'))
const QADashboardPage = lazy(() => import('@/app/(admin)/qa/dashboard/page'))
const ValidationDashboardPage = lazy(() => import('@/app/(admin)/testing/validation-dashboard/page'))

// Notification Pages
const NotificationsPage = lazy(() => import('@/app/(admin)/notifications/page'))

const AuthenticationSetupPage = lazy(() => import('@/app/(admin)/admin/auth-setup/page'))
const AuthenticationGuidePage = lazy(() => import('@/app/(admin)/admin/auth-guide/page'))
const NotificationPreferencesPage = lazy(() => import('@/app/(admin)/admin/notification-preferences/page'))

// Documentation Pages
const TechnicalDocumentationPage = lazy(() => import('@/app/(admin)/documentation/technical/page'))
const UserGuidePage = lazy(() => import('@/app/(admin)/documentation/user-guide/page'))

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
  // Applicant Routes
  {
    path: '/applicant/dashboard',
    name: 'Applicant Dashboard',
    element: <ApplicantDashboardPage />,
    exact: true,
  },
  {
    path: '/applicant/applications',
    name: 'My Applications',
    element: <ApplicantApplicationsPage />,
    exact: true,
  },
  {
    path: '/applicant/submit',
    name: 'Submit Application',
    element: <ApplicantSubmitPage />,
    exact: true,
  },
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
  {
    path: '/control/schedule/:applicationId',
    name: 'Schedule Control Visit',
    element: (
      <RouteGuard allowedRoles={['control', 'admin', 'it']}>
        <ControlSchedulePage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/control/visit/:visitId',
    name: 'Control Visit',
    element: (
      <RouteGuard allowedRoles={['control', 'admin', 'it']}>
        <ControlVisitPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/control/visit/:visitId/view',
    name: 'Control Visit View',
    element: (
      <RouteGuard allowedRoles={['control', 'admin', 'it', 'staff', 'director', 'minister']}>
        <ControlVisitPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/control/visits',
    name: 'Control Visits',
    element: (
      <RouteGuard allowedRoles={['control', 'admin', 'it', 'staff']}>
        <ControlVisitsPage />
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
    path: '/reviews/technical',
    name: 'Technical Review',
    element: (
      <RouteGuard allowedRoles={['admin', 'it', 'staff']}>
        <TechnicalReviewPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/reviews/social',
    name: 'Social Review',
    element: (
      <RouteGuard allowedRoles={['staff', 'admin', 'it']}>
        <SocialReviewPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/reviews/social/assessment',
    name: 'Social Assessment',
    element: (
      <RouteGuard allowedRoles={['staff', 'admin', 'it']}>
        <SocialAssessmentPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/reviews/archive',
    name: 'Review Archive',
    element: (
      <RouteGuard allowedRoles={['admin', 'it', 'staff', 'director', 'minister']}>
        <ReviewArchivePage />
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
  {
    path: '/admin/notification-preferences',
    name: 'Notification Preferences',
    element: <NotificationPreferencesPage />,
    exact: true,
  },
  {
    path: '/admin/settings',
    name: 'System Settings',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemSettingsPage />
      </RouteGuard>
    ),
    exact: true,
  },
  // User Profile & Help
  {
    path: '/profile',
    name: 'User Profile',
    element: <UserProfilePage />,
    exact: true,
  },
  {
    path: '/help',
    name: 'Help & Support',
    element: <HelpPage />,
    exact: true,
  },
  // Testing
  {
    path: '/testing/integration',
    name: 'Integration Testing',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <IntegrationTestingPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/testing/end-to-end',
    name: 'End-to-End Testing',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <EndToEndTestPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/testing/system-validation',
    name: 'System Validation',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemValidationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/testing/uat-preparation',
    name: 'UAT Preparation',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <UATPreparationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/testing/validation-dashboard',
    name: 'Validation Dashboard',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <ValidationDashboardPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/qa/dashboard',
    name: 'QA Dashboard',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <QADashboardPage />
      </RouteGuard>
    ),
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
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <WorkflowTestingPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/workflow/monitoring',
    name: 'Workflow Monitoring',
    element: (
      <RouteGuard allowedRoles={['admin', 'it', 'staff']}>
        <WorkflowMonitoringPage />
      </RouteGuard>
    ),
    exact: true,
  },
  // Monitoring Routes (Consolidated)
  {
    path: '/monitoring/system-health',
    name: 'System Health',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemHealthPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/monitoring/health',
    name: 'System Health Redirect',
    element: <Navigate to="/monitoring/system-health" replace />,
    exact: true,
  },
  {
    path: '/monitoring/performance',
    name: 'Performance Monitoring',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemHealthPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/monitoring/security',
    name: 'Security Health Scanner',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemHealthPage />
      </RouteGuard>
    ),
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
    path: '/polish/security',
    name: 'Security Polish',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PolishSecurityPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/polish/uat',
    name: 'UAT Polish',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <PolishUATPage />
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
  {
    path: '/deployment/guide',
    name: 'Deployment Guide',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <DeploymentGuidePage />
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
  {
    path: '/security/final-validation',
    name: 'Security Final Validation',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SecurityFinalValidationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  // Documentation
  {
    path: '/documentation/technical',
    name: 'Technical Documentation',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <TechnicalDocumentationPage />
      </RouteGuard>
    ),
    exact: true,
  },
  {
    path: '/documentation/user-guide',
    name: 'User Guide',
    element: <UserGuidePage />,
    exact: true,
  },
  {
    path: '/monitoring/system-health',
    name: 'System Health Monitoring',
    element: (
      <RouteGuard allowedRoles={['admin', 'it']}>
        <SystemHealthPage />
      </RouteGuard>
    ),
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