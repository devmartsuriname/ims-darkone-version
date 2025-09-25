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
  {
    key: 'final-polish',
    label: 'Final Polish',
    isTitle: false,
    icon: 'mingcute:sparkles-line',
    url: '#',
    children: [
      {
        key: 'polish-overview',
        label: 'Overview',
        url: '/polish/overview',
        parentKey: 'final-polish',
      },
      {
        key: 'performance-optimization',
        label: 'Performance Optimization',
        url: '/polish/performance',
        parentKey: 'final-polish',
      },
      {
        key: 'ux-enhancement',
        label: 'UX Enhancement',
        url: '/polish/ux-enhancement',
        parentKey: 'final-polish',
      },
      {
        key: 'production-readiness',
        label: 'Production Readiness',
        url: '/polish/production-readiness',
        parentKey: 'final-polish',
      },
      {
        key: 'documentation-training',
        label: 'Documentation & Training',
        url: '/polish/documentation',
        parentKey: 'final-polish',
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

]