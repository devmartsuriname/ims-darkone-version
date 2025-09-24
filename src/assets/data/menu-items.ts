import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'main',
    label: 'MAIN',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Dashboard',
    isTitle: false,
    icon: 'Solar:widget-4-bold',
    url: '/dashboards',
  },

  // ==================== APPLICATIONS ===============
  {
    key: 'applications',
    label: 'APPLICATIONS',
    isTitle: true,
  },
  {
    key: 'application-management',
    label: 'Application Management',
    icon: 'mingcute:file-line',
    children: [
      {
        key: 'application-intake',
        label: 'Application Intake',
        url: '/applications/intake',
        parentKey: 'application-management',
      },
      {
        key: 'application-list',
        label: 'Application List',
        url: '/applications/list',
        parentKey: 'application-management',
      },
    ],
  },
  {
    key: 'control-department',
    label: 'Control Department',
    icon: 'mingcute:search-line',
    children: [
      {
        key: 'control-queue',
        label: 'Control Queue',
        url: '/control/queue',
        parentKey: 'control-department',
      },
      {
        key: 'control-schedule',
        label: 'Schedule Visits',
        url: '/control/schedule',
        parentKey: 'control-department',
      },
      {
        key: 'control-visit',
        label: 'Control Visit',
        url: '/control/visit',
        parentKey: 'control-department',
      },
      {
        key: 'control-visits',
        label: 'Visit History',
        url: '/control/visits',
        parentKey: 'control-department',
      },
    ],
  },
  {
    key: 'reviews',
    label: 'Reviews & Decisions',
    icon: 'mingcute:check-circle-line',
    children: [
      {
        key: 'technical-review',
        label: 'Technical Review',
        url: '/reviews/technical',
        parentKey: 'reviews',
      },
      {
        key: 'social-review',
        label: 'Social Review',
        url: '/reviews/social',
        parentKey: 'reviews',
      },
      {
        key: 'director-review',
        label: 'Director Review',
        url: '/reviews/director',
        parentKey: 'reviews',
      },
      {
        key: 'minister-review',
        label: 'Minister Decision',
        url: '/reviews/minister',
        parentKey: 'reviews',
      },
      {
        key: 'review-archive',
        label: 'Review Archive',
        url: '/reviews/archive',
        parentKey: 'reviews',
      },
    ],
  },

  // ==================== ADMINISTRATION ===============
  {
    key: 'administration',
    label: 'ADMINISTRATION',
    isTitle: true,
  },
  {
    key: 'user-management',
    label: 'User Management',
    icon: 'mingcute:user-4-line',
    children: [
      {
        key: 'users',
        label: 'Users',
        url: '/admin/users',
        parentKey: 'user-management',
      },
      {
        key: 'notification-preferences',
        label: 'Notification Preferences',
        url: '/admin/notification-preferences',
        parentKey: 'user-management',
      },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow Management',
    isTitle: false,
    icon: 'Solar:chart-bold',
    url: '#',
    children: [
      {
        key: 'workflow-validation',
        label: 'Workflow Validation',
        url: '/workflow/validation',
        parentKey: 'workflow',
      },
      {
        key: 'workflow-testing',
        label: 'Workflow Testing',
        url: '/workflow/testing',
        parentKey: 'workflow',
      },
      {
        key: 'workflow-monitoring',
        label: 'Workflow Monitoring',
        url: '/workflow/monitoring',
        parentKey: 'workflow',
      },
    ],
  },

  // ==================== QUALITY ASSURANCE ===============
  {
    key: 'quality-assurance',
    label: 'QUALITY ASSURANCE',
    isTitle: true,
  },
  {
    key: 'testing',
    label: 'Testing & QA',
    icon: 'mingcute:bug-line',
    children: [
      {
        key: 'integration-testing',
        label: 'Integration Testing',
        url: '/testing/integration',
        parentKey: 'testing',
      },
      {
        key: 'end-to-end-testing',
        label: 'End-to-End Testing',
        url: '/testing/end-to-end',
        parentKey: 'testing',
      },
      {
        key: 'qa-dashboard',
        label: 'QA Dashboard',
        url: '/qa/dashboard',
        parentKey: 'testing',
      },
    ],
  },

  // ==================== SECURITY ===============
  {
    key: 'security',
    label: 'SECURITY',
    isTitle: true,
  },
  {
    key: 'security-tools',
    label: 'Security Tools',
    icon: 'mingcute:shield-line',
    children: [
      {
        key: 'security-scanning',
        label: 'Security Scanning',
        url: '/security/scanning',
        parentKey: 'security-tools',
      },
      {
        key: 'security-monitoring',
        label: 'Security Monitoring',
        url: '/security/monitoring',
        parentKey: 'security-tools',
      },
      {
        key: 'security-hardening',
        label: 'Security Hardening',
        url: '/security/hardening',
        parentKey: 'security-tools',
      },
      {
        key: 'penetration-testing',
        label: 'Penetration Testing',
        url: '/security/penetration',
        parentKey: 'security-tools',
      },
    ],
  },

  // ==================== DEPLOYMENT ===============
  {
    key: 'deployment',
    label: 'DEPLOYMENT',
    isTitle: true,
  },
  {
    key: 'deployment-tools',
    label: 'Deployment Tools',
    icon: 'mingcute:rocket-line',
    children: [
      {
        key: 'deployment-guide',
        label: 'Deployment Guide',
        url: '/deployment/guide',
        parentKey: 'deployment-tools',
      },
      {
        key: 'production-readiness',
        label: 'Production Readiness',
        url: '/deployment/readiness',
        parentKey: 'deployment-tools',
      },
    ],
  },

  // ==================== DOCUMENTATION ===============
  {
    key: 'documentation',
    label: 'DOCUMENTATION',
    isTitle: true,
  },
  {
    key: 'documentation-tools',
    label: 'Documentation',
    icon: 'mingcute:book-line',
    children: [
      {
        key: 'technical-documentation',
        label: 'Technical Documentation',
        url: '/documentation/technical',
        parentKey: 'documentation-tools',
      },
      {
        key: 'user-guide-documentation',
        label: 'User Guide',
        url: '/documentation/user-guide',
        parentKey: 'documentation-tools',
      },
    ],
  },

  // ==================== LAYOUTS ===============
  {
    key: 'layouts',
    label: 'LAYOUTS',
    isTitle: true,
  },
  {
    key: 'layout-options',
    label: 'Layout Options',
    icon: 'mingcute:layout-4-line',
    children: [
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/dark-mode',
        parentKey: 'layout-options',
      },
      {
        key: 'dark-sidenav',
        label: 'Dark Sidenav',
        url: '/dark-sidenav',
        parentKey: 'layout-options',
      },
      {
        key: 'dark-topnav',
        label: 'Dark Topnav',
        url: '/dark-topnav',
        parentKey: 'layout-options',
      },
      {
        key: 'small-sidenav',
        label: 'Small Sidenav',
        url: '/small-sidenav',
        parentKey: 'layout-options',
      },
      {
        key: 'hidden-sidenav',
        label: 'Hidden Sidenav',
        url: '/hidden-sidenav',
        parentKey: 'layout-options',
      },
    ],
  },

  // ==================== UI ELEMENTS ===============
  {
    key: 'base-ui',
    label: 'BASE UI',
    isTitle: true,
  },
  {
    key: 'base-ui-components',
    label: 'Base UI Components',
    icon: 'mingcute:grid-line',
    children: [
      {
        key: 'accordion',
        label: 'Accordion',
        url: '/base-ui/accordion',
        parentKey: 'base-ui-components',
      },
      {
        key: 'alerts',
        label: 'Alerts',
        url: '/base-ui/alerts',
        parentKey: 'base-ui-components',
      },
      {
        key: 'avatar',
        label: 'Avatar',
        url: '/base-ui/avatar',
        parentKey: 'base-ui-components',
      },
      {
        key: 'badge',
        label: 'Badge',
        url: '/base-ui/badge',
        parentKey: 'base-ui-components',
      },
      {
        key: 'breadcrumb',
        label: 'Breadcrumb',
        url: '/base-ui/breadcrumb',
        parentKey: 'base-ui-components',
      },
      {
        key: 'buttons',
        label: 'Buttons',
        url: '/base-ui/buttons',
        parentKey: 'base-ui-components',
      },
      {
        key: 'cards',
        label: 'Cards',
        url: '/base-ui/cards',
        parentKey: 'base-ui-components',
      },
      {
        key: 'carousel',
        label: 'Carousel',
        url: '/base-ui/carousel',
        parentKey: 'base-ui-components',
      },
      {
        key: 'collapse',
        label: 'Collapse',
        url: '/base-ui/collapse',
        parentKey: 'base-ui-components',
      },
      {
        key: 'dropdown',
        label: 'Dropdown',
        url: '/base-ui/dropdown',
        parentKey: 'base-ui-components',
      },
      {
        key: 'list-group',
        label: 'List Group',
        url: '/base-ui/list-group',
        parentKey: 'base-ui-components',
      },
      {
        key: 'modals',
        label: 'Modals',
        url: '/base-ui/modals',
        parentKey: 'base-ui-components',
      },
      {
        key: 'offcanvas',
        label: 'Offcanvas',
        url: '/base-ui/offcanvas',
        parentKey: 'base-ui-components',
      },
      {
        key: 'pagination',
        label: 'Pagination',
        url: '/base-ui/pagination',
        parentKey: 'base-ui-components',
      },
      {
        key: 'placeholders',
        label: 'Placeholders',
        url: '/base-ui/placeholders',
        parentKey: 'base-ui-components',
      },
      {
        key: 'popovers',
        label: 'Popovers',
        url: '/base-ui/popovers',
        parentKey: 'base-ui-components',
      },
      {
        key: 'progress',
        label: 'Progress',
        url: '/base-ui/progress',
        parentKey: 'base-ui-components',
      },
      {
        key: 'spinners',
        label: 'Spinners',
        url: '/base-ui/spinners',
        parentKey: 'base-ui-components',
      },
      {
        key: 'tabs',
        label: 'Tabs',
        url: '/base-ui/tabs',
        parentKey: 'base-ui-components',
      },
      {
        key: 'toasts',
        label: 'Toasts',
        url: '/base-ui/toasts',
        parentKey: 'base-ui-components',
      },
      {
        key: 'tooltips',
        label: 'Tooltips',
        url: '/base-ui/tooltips',
        parentKey: 'base-ui-components',
      },
    ],
  },

  // ==================== FORMS ===============
  {
    key: 'forms',
    label: 'FORMS',
    isTitle: true,
  },
  {
    key: 'form-components',
    label: 'Form Components',
    icon: 'mingcute:edit-line',
    children: [
      {
        key: 'basic-forms',
        label: 'Basic Forms',
        url: '/forms/basic',
        parentKey: 'form-components',
      },
      {
        key: 'form-validation',
        label: 'Form Validation',
        url: '/forms/validation',
        parentKey: 'form-components',
      },
      {
        key: 'form-editors',
        label: 'Form Editors',
        url: '/forms/editors',
        parentKey: 'form-components',
      },
      {
        key: 'file-uploads',
        label: 'File Uploads',
        url: '/forms/file-uploads',
        parentKey: 'form-components',
      },
      {
        key: 'flat-picker',
        label: 'Flat Picker',
        url: '/forms/flat-picker',
        parentKey: 'form-components',
      },
    ],
  },

  // ==================== TABLES ===============
  {
    key: 'tables',
    label: 'TABLES',
    isTitle: true,
  },
  {
    key: 'table-components',
    label: 'Table Components',
    icon: 'mingcute:table-line',
    children: [
      {
        key: 'basic-tables',
        label: 'Basic Tables',
        url: '/tables/basic',
        parentKey: 'table-components',
      },
      {
        key: 'gridjs-tables',
        label: 'GridJS Tables',
        url: '/tables/gridjs',
        parentKey: 'table-components',
      },
    ],
  },

  // ==================== CHARTS & MAPS ===============
  {
    key: 'charts-maps',
    label: 'CHARTS & MAPS',
    isTitle: true,
  },
  {
    key: 'apex-charts',
    label: 'Apex Charts',
    icon: 'mingcute:chart-line',
    url: '/apex-chart',
  },
  {
    key: 'maps',
    label: 'Maps',
    icon: 'mingcute:location-line',
    children: [
      {
        key: 'google-maps',
        label: 'Google Maps',
        url: '/maps/google',
        parentKey: 'maps',
      },
      {
        key: 'vector-maps',
        label: 'Vector Maps',
        url: '/maps/vector',
        parentKey: 'maps',
      },
    ],
  },

  // ==================== ICONS ===============
  {
    key: 'icons',
    label: 'ICONS',
    isTitle: true,
  },
  {
    key: 'icon-libraries',
    label: 'Icon Libraries',
    icon: 'mingcute:star-line',
    children: [
      {
        key: 'boxicons',
        label: 'Boxicons',
        url: '/icons/boxicons',
        parentKey: 'icon-libraries',
      },
      {
        key: 'solaricons',
        label: 'Solar Icons',
        url: '/icons/solaricons',
        parentKey: 'icon-libraries',
      },
    ],
  },

  // ==================== PAGES ===============
  {
    key: 'pages',
    label: 'PAGES',
    isTitle: true,
  },
  {
    key: 'extra-pages',
    label: 'Extra Pages',
    icon: 'mingcute:file-line',
    children: [
      {
        key: 'pages-404-alt',
        label: '404 Error (Alt)',
        url: '/pages-404-alt',
        parentKey: 'extra-pages',
      },
    ],
  },

  // ==================== AUTHENTICATION ===============
  {
    key: 'authentication',
    label: 'AUTHENTICATION',
    isTitle: true,
  },
  {
    key: 'auth-pages',
    label: 'Authentication',
    icon: 'mingcute:user-line',
    children: [
      {
        key: 'sign-in',
        label: 'Sign In',
        url: '/auth/sign-in',
        parentKey: 'auth-pages',
      },
      {
        key: 'sign-up',
        label: 'Sign Up',
        url: '/auth/sign-up',
        parentKey: 'auth-pages',
      },
      {
        key: 'reset-password',
        label: 'Reset Password',
        url: '/auth/reset-password',
        parentKey: 'auth-pages',
      },
      {
        key: 'lock-screen',
        label: 'Lock Screen',
        url: '/auth/lock-screen',
        parentKey: 'auth-pages',
      },
    ],
  },
]