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
    icon: 'mingcute:home-3-line',
    url: '/dashboards',
  },
  
  // ==================== IMS CORE ===============
  {
    key: 'ims',
    label: 'IMS CORE',
    isTitle: true,
  },
  {
    key: 'applications',
    label: 'Applications',
    icon: 'mingcute:folder-2-line',
    children: [
      {
        key: 'application-intake',
        label: 'New Application',
        url: '/applications/intake',
        parentKey: 'applications',
      },
      {
        key: 'application-list',
        label: 'All Applications',
        url: '/applications/list',
        parentKey: 'applications',
      },
      {
        key: 'my-applications',
        label: 'My Applications',
        url: '/applications/my-applications',
        parentKey: 'applications',
      },
    ],
  },
  {
    key: 'control',
    label: 'Control Department',
    icon: 'mingcute:clipboard-line',
    children: [
      {
        key: 'control-queue',
        label: 'Control Queue',
        url: '/control/queue',
        parentKey: 'control',
      },
      {
        key: 'scheduled-visits',
        label: 'Scheduled Visits',
        url: '/control/visits',
        parentKey: 'control',
      },
      {
        key: 'control-reports',
        label: 'Control Reports',
        url: '/control/reports',
        parentKey: 'control',
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
        key: 'minister-decision',
        label: 'Minister Decision',
        url: '/reviews/minister',
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
        key: 'roles',
        label: 'Roles & Permissions',
        url: '/admin/roles',
        parentKey: 'user-management',
      },
      {
        key: 'auth-setup',
        label: 'Authentication Setup',
        url: '/admin/auth-setup',
        parentKey: 'user-management',
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
  {
    key: 'reference-data',
    label: 'Reference Data',
    icon: 'mingcute:settings-3-line',
    children: [
      {
        key: 'document-types',
        label: 'Document Types',
        url: '/admin/document-types',
        parentKey: 'reference-data',
      },
      {
        key: 'sla-config',
        label: 'SLA Configuration',
        url: '/admin/sla-config',
        parentKey: 'reference-data',
      },
      {
        key: 'workflow-config',
        label: 'Workflow Config',
        url: '/admin/workflow-config',
        parentKey: 'reference-data',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'mingcute:chart-bar-line',
    children: [
      {
        key: 'performance-reports',
        label: 'Performance Reports',
        url: '/reports/performance',
        parentKey: 'reports',
      },
      {
        key: 'audit-logs',
        label: 'Audit Logs',
        url: '/reports/audit',
        parentKey: 'reports',
      },
      {
        key: 'statistics',
        label: 'Statistics',
        url: '/reports/statistics',
        parentKey: 'reports',
      },
    ],
  },
  {
    key: "testing",
    label: "Testing",
    isTitle: false,
    icon: "bx bx-test-tube",
    children: [
      {
        key: "testing-integration",
        label: "Integration Tests",
        url: "/admin/testing/integration",
        parentKey: "testing",
      },
      {
        key: "testing-end-to-end",
        label: "End-to-End Tests",
        url: "/admin/testing/end-to-end",
        parentKey: "testing",
      },
    ],
  },
  {
    key: "notifications",
    label: "Notifications",
    isTitle: false,
    icon: "solar:bell-bing-outline",
    children: [
      {
        key: "admin-notifications",
        label: "All Notifications",
        url: "/admin/notifications",
        parentKey: "notifications",
      },
      {
        key: "admin-notification-preferences",
        label: "Notification Preferences",
        url: "/admin/notification-preferences",
        parentKey: "notifications",
      },
    ],
  },
  {
    key: "deployment",
    label: "Deployment",
    isTitle: false,
    icon: "bx bx-rocket",
    children: [
      {
        key: "deployment-readiness",
        label: "Production Readiness",
        url: "/deployment/readiness",
        parentKey: "deployment",
      },
      {
        key: "deployment-guide",
        label: "Deployment Guide",
        url: "/deployment/guide",
        parentKey: "deployment",
      },
    ],
  },

  // ====================Authentication===============
  {
    key: 'system',
    label: 'SYSTEM',
    isTitle: true,
  },
  {
    key: 'auth',
    label: 'Authentication',
    icon: 'mingcute:user-3-line',
    children: [
      {
        key: 'sign-in',
        label: 'Sign In',
        url: '/auth/sign-in',
        parentKey: 'auth',
      },
      {
        key: 'sign-up',
        label: 'Sign Up',
        url: '/auth/sign-up',
        parentKey: 'auth',
      },
      {
        key: 'reset-password',
        label: 'Reset Password',
        url: '/auth/reset-password',
        parentKey: 'auth',
      },
      {
        key: 'lock-screen',
        label: 'Lock Screen',
        url: '/auth/lock-screen',
        parentKey: 'auth',
      },
    ],
  },
  {
    key: 'error-pages',
    label: 'Error Pages',
    icon: 'mingcute:bug-line',
    children: [
      {
        key: '404-error',
        label: '404 Error',
        url: '/error-pages/pages-404',
        parentKey: 'error',
      },
      {
        key: '404-error(alt)',
        label: '404 Error (alt)',
        url: '/pages-404-alt',
        parentKey: 'error',
      },
    ],
  },
  
  // ==================== DEVELOPMENT ===============
  {
    key: 'development',
    label: 'DEVELOPMENT',
    isTitle: true,
  },
  {
    key: 'base-ui',
    label: 'UI Components',
    icon: 'mingcute:leaf-line',
    children: [
      {
        key: 'accordion',
        label: 'Accordion',
        url: '/base-ui/accordion',
        parentKey: 'base-ui',
      },
      {
        key: 'alerts',
        label: 'Alerts',
        url: '/base-ui/alerts',
        parentKey: 'base-ui',
      },
      {
        key: 'buttons',
        label: 'Buttons',
        url: '/base-ui/buttons',
        parentKey: 'base-ui',
      },
      {
        key: 'cards',
        label: 'Cards',
        url: '/base-ui/cards',
        parentKey: 'base-ui',
      },
      {
        key: 'modals',
        label: 'Modals',
        url: '/base-ui/modals',
        parentKey: 'base-ui',
      },
      {
        key: 'tabs',
        label: 'Tabs',
        url: '/base-ui/tabs',
        parentKey: 'base-ui',
      },
      {
        key: 'forms',
        label: 'Forms',
        url: '/forms/basic',
        parentKey: 'base-ui',
  },
  {
    key: 'documentation',
    label: 'Documentation',
    isTitle: false,
    icon: 'solar:document-bold',
    children: [
      {
        key: 'documentation-user-guide',
        label: 'User Guide',
        url: '/documentation/user-guide',
        parentKey: 'documentation',
      },
      {
        key: 'documentation-technical',
        label: 'Technical Docs',
        url: '/documentation/technical',
        parentKey: 'documentation',
      },
    ],
  },
      {
        key: 'tables',
        label: 'Tables',
        url: '/tables/gridjs',
        parentKey: 'base-ui',
      },
    ],
  },
  {
    key: 'layouts',
    label: 'Theme Layouts',
    icon: 'mingcute:layout-line',
    children: [
      {
        key: 'dark-sidenav',
        label: 'Dark Sidenav',
        url: '/dark-sidenav',
        parentKey: 'layouts',
      },
      {
        key: 'dark-topnav',
        label: 'Dark Topnav',
        url: '/dark-topnav',
        parentKey: 'layouts',
      },
      {
        key: 'small-sidenav',
        label: 'Small Sidenav',
        url: '/small-sidenav',
        parentKey: 'layouts',
      },
      {
        key: 'hidden-sidenav',
        label: 'Hidden Sidenav',
        url: '/hidden-sidenav',
        parentKey: 'layouts',
      },
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/dark-mode',
        parentKey: 'layouts',
        badge: {
          text: 'Hot',
          variant: 'badge badge-soft-danger ',
        },
       },
     ],
   },
   {
     key: 'deployment',
     label: 'Deployment',
     isTitle: false,
     icon: 'solar:rocket-bold',
     children: [
       {
         key: 'deployment-guide',
         label: 'Deployment Guide',
         url: '/deployment/guide',
         icon: 'solar:rocket-bold'
       },
       {
         key: 'production-readiness',
         label: 'Production Readiness',
         url: '/deployment/readiness',
         icon: 'solar:shield-check-bold'
       },
     ],
   },
   {
     key: 'security',
     label: 'Security',
     isTitle: false,
     icon: 'solar:shield-bold',
     children: [
       {
         key: 'security-scanning',
         label: 'Security Scanning',
         url: '/security/scanning',
         icon: 'solar:shield-search-bold'
       },
       {
         key: 'security-monitoring',
         label: 'Security Monitoring',
         url: '/security/monitoring',
         icon: 'solar:shield-warning-bold'
       },
       {
         key: 'security-hardening',
         label: 'Security Hardening',
         url: '/security/hardening',
         icon: 'solar:shield-plus-bold'
       },
       {
         key: 'penetration-testing',
         label: 'Penetration Testing',
         url: '/security/penetration',
         icon: 'solar:bug-bold'
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
  ]
}
