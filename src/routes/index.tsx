import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

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

// Base UI Routes
const Accordions = lazy(() => import('@/app/(admin)/base-ui/accordion/page'))
const Alerts = lazy(() => import('@/app/(admin)/base-ui/alerts/page'))
const Avatars = lazy(() => import('@/app/(admin)/base-ui/avatar/page'))
const Badges = lazy(() => import('@/app/(admin)/base-ui/badge/page'))
const Breadcrumbs = lazy(() => import('@/app/(admin)/base-ui/breadcrumb/page'))
const Buttons = lazy(() => import('@/app/(admin)/base-ui/buttons/page'))
const Cards = lazy(() => import('@/app/(admin)/base-ui/cards/page'))
const Carousels = lazy(() => import('@/app/(admin)/base-ui/carousel/page'))
const Collapse = lazy(() => import('@/app/(admin)/base-ui/collapse/page'))
const DropDowns = lazy(() => import('@/app/(admin)/base-ui/dropdown/page'))
const ListGroups = lazy(() => import('@/app/(admin)/base-ui/list-group/page'))
const Modals = lazy(() => import('@/app/(admin)/base-ui/modals/page'))
const Offcanvas = lazy(() => import('@/app/(admin)/base-ui/offcanvas/page'))
const Pagination = lazy(() => import('@/app/(admin)/base-ui/pagination/page'))
const Placeholders = lazy(() => import('@/app/(admin)/base-ui/placeholders/page'))
const Popovers = lazy(() => import('@/app/(admin)/base-ui/popovers/page'))
const Progress = lazy(() => import('@/app/(admin)/base-ui/progress/page'))
const Spinners = lazy(() => import('@/app/(admin)/base-ui/spinners/page'))
const Tabs = lazy(() => import('@/app/(admin)/base-ui/tabs/page'))
const Toasts = lazy(() => import('@/app/(admin)/base-ui/toasts/page'))
const Tooltips = lazy(() => import('@/app/(admin)/base-ui/tooltips/page'))

// Forms Routes
const BasicForms = lazy(() => import('@/app/(admin)/forms/basic/page'))
const FormValidation = lazy(() => import('@/app/(admin)/forms/validation/page'))
const FormFileUpload = lazy(() => import('@/app/(admin)/forms/file-uploads/page'))
const FormEditors = lazy(() => import('@/app/(admin)/forms/editors/page'))
const FormFlatPickr = lazy(() => import('@/app/(admin)/forms/flat-picker/page'))

// Tables
const BasicTables = lazy(() => import('@/app/(admin)/tables/basic/page'))
const GridJSTables = lazy(() => import('@/app/(admin)/tables/gridjs/page'))

// Charts
const ApexChart = lazy(() => import('@/app/(admin)/apex-chart/page'))

// Maps
const GoogleMaps = lazy(() => import('@/app/(admin)/maps/google/page'))
const VectorMaps = lazy(() => import('@/app/(admin)/maps/vector/page'))

// Icon Pages
const BoxIcons = lazy(() => import('@/app/(admin)/icons/boxicons/page'))
const SolarIcons = lazy(() => import('@/app/(admin)/icons/solaricons/page'))

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
const Error404Alt = lazy(() => import('@/app/(admin)/pages-404-alt/page'))

// Layout Pages
const DarkSideNav = lazy(() => import('@/app/(admin)/(layouts)/dark-sidenav/page'))
const DarkTopNav = lazy(() => import('@/app/(admin)/(layouts)/dark-topnav/page'))
const SmallSideNav = lazy(() => import('@/app/(admin)/(layouts)/small-sidenav/page'))
const HiddenSideNav = lazy(() => import('@/app/(admin)/(layouts)/hidden-sidenav/page'))
const DarkMode = lazy(() => import('@/app/(admin)/(layouts)/dark-mode/page'))

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
    element: <ControlQueuePage />,
    exact: true,
  },
  // Reviews & Decisions
  {
    path: '/reviews/director',
    name: 'Director Review',
    element: <DirectorReviewPage />,
    exact: true,
  },
  {
    path: '/reviews/minister',
    name: 'Minister Decision',
    element: <MinisterDecisionPage />,
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
    element: <UserManagementPage />,
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
    path: '/polish/performance',
    name: 'Performance Optimization',
    element: <PerformanceOptimizationPage />,
    exact: true,
  },
  {
    path: '/polish/overview',
    name: 'Polish Overview',
    element: <PolishOverviewPage />,
    exact: true,
  },
  {
    path: '/polish/performance',
    name: 'Performance Optimization',
    element: <PerformanceOptimizationPage />,
    exact: true,
  },
  {
    path: '/polish/ux-enhancement',
    name: 'UX Enhancement',
    element: <UXEnhancementPage />,
    exact: true,
  },
  {
    path: '/polish/production-readiness',
    name: 'Production Readiness',
    element: <PolishProductionReadinessPage />,
    exact: true,
  },
  {
    path: '/polish/documentation',
    name: 'Documentation & Training',
    element: <DocumentationPage />,
    exact: true,
  },
  {
    path: '/deployment/readiness',
    name: 'Production Readiness',
    element: <ProductionReadinessPage />,
    exact: true,
  },
  // Security
  {
    path: '/security/scanning',
    name: 'Security Scanning',
    element: <SecurityScanningPage />,
    exact: true,
  },
  {
    path: '/security/monitoring',
    name: 'Security Monitoring',
    element: <SecurityMonitoringPage />,
    exact: true,
  },
  {
    path: '/security/hardening',
    name: 'Security Hardening',
    element: <SecurityHardeningPage />,
    exact: true,
  },
  {
    path: '/security/penetration',
    name: 'Penetration Testing',
    element: <PenetrationTestingPage />,
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

const baseUIRoutes: RoutesProps[] = [
  {
    name: 'Accordion',
    path: '/base-ui/accordion',
    element: <Accordions />,
  },
  {
    name: 'Alerts',
    path: '/base-ui/alerts',
    element: <Alerts />,
  },
  {
    name: 'Avatar',
    path: '/base-ui/avatar',
    element: <Avatars />,
  },
  {
    name: 'Badge',
    path: '/base-ui/badge',
    element: <Badges />,
  },
  {
    name: 'Breadcrumb',
    path: '/base-ui/breadcrumb',
    element: <Breadcrumbs />,
  },
  {
    name: 'Buttons',
    path: '/base-ui/buttons',
    element: <Buttons />,
  },
  {
    name: 'Cards',
    path: '/base-ui/cards',
    element: <Cards />,
  },
  {
    name: 'Carousel',
    path: '/base-ui/carousel',
    element: <Carousels />,
  },
  {
    name: 'Collapse',
    path: '/base-ui/collapse',
    element: <Collapse />,
  },
  {
    name: 'Dropdown',
    path: '/base-ui/dropdown',
    element: <DropDowns />,
  },
  {
    name: 'List Group',
    path: '/base-ui/list-group',
    element: <ListGroups />,
  },
  {
    name: 'Modals',
    path: '/base-ui/modals',
    element: <Modals />,
  },
  {
    name: 'Offcanvas',
    path: '/base-ui/offcanvas',
    element: <Offcanvas />,
  },
  {
    name: 'Pagination',
    path: '/base-ui/pagination',
    element: <Pagination />,
  },
  {
    name: 'Placeholders',
    path: '/base-ui/placeholders',
    element: <Placeholders />,
  },
  {
    name: 'Popovers',
    path: '/base-ui/popovers',
    element: <Popovers />,
  },
  {
    name: 'Progress',
    path: '/base-ui/progress',
    element: <Progress />,
  },
  {
    name: 'Spinners',
    path: '/base-ui/spinners',
    element: <Spinners />,
  },
  {
    name: 'Tabs',
    path: '/base-ui/tabs',
    element: <Tabs />,
  },
  {
    name: 'Toasts',
    path: '/base-ui/toasts',
    element: <Toasts />,
  },
  {
    name: 'Tooltips',
    path: '/base-ui/tooltips',
    element: <Tooltips />,
  },
]

const formsRoutes: RoutesProps[] = [
  {
    name: 'Basic Forms',
    path: '/forms/basic',
    element: <BasicForms />,
  },
  {
    name: 'Form Validation',
    path: '/forms/validation',
    element: <FormValidation />,
  },
  {
    name: 'File Upload',
    path: '/forms/file-uploads',
    element: <FormFileUpload />,
  },
  {
    name: 'Form Editors',
    path: '/forms/editors',
    element: <FormEditors />,
  },
  {
    name: 'Flatpickr',
    path: '/forms/flat-picker',
    element: <FormFlatPickr />,
  },
]

const tableRoutes: RoutesProps[] = [
  {
    name: 'Basic Tables',
    path: '/tables/basic',
    element: <BasicTables />,
  },
  {
    name: 'Grid Js',
    path: '/tables/gridjs',
    element: <GridJSTables />,
  },
]

const chartsMapsRoutes: RoutesProps[] = [
  {
    name: 'Apex charts',
    path: '/apex-chart',
    element: <ApexChart />,
  },
  {
    name: 'Google Maps',
    path: '/maps/google',
    element: <GoogleMaps />,
  },
  {
    name: 'Vector Maps',
    path: '/maps/vector',
    element: <VectorMaps />,
  },
]

const iconRoutes: RoutesProps[] = [
  {
    name: 'Boxicons',
    path: '/icons/boxicons',
    element: <BoxIcons />,
  },
  {
    name: 'SolarIcon',
    path: '/icons/solaricons',
    element: <SolarIcons />,
  },
]

const layoutsRoutes: RoutesProps[] = [
  {
    name: 'Dark Sidenav',
    path: '/dark-sidenav',
    element: <DarkSideNav />,
  },
  {
    name: 'Dark Topnav',
    path: '/dark-topnav',
    element: <DarkTopNav />,
  },
  {
    name: 'Small Sidenav',
    path: '/small-sidenav',
    element: <SmallSideNav />,
  },
  {
    name: 'Hidden Sidenav',
    path: '/hidden-sidenav',
    element: <HiddenSideNav />,
  },
  {
    name: 'Dark Mode',
    path: '/dark-mode',
    element: <DarkMode />,
  },
  {
    name: '404 Alt',
    path: '/pages-404-alt',
    element: <Error404Alt />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...imsRoutes,
  ...baseUIRoutes,
  ...formsRoutes,
  ...tableRoutes,
  ...chartsMapsRoutes,
  ...iconRoutes,
  ...layoutsRoutes,
]