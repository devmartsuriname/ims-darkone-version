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
    allowedRoles: ['control', 'admin', 'it'],
    children: [
      {
        key: 'control-queue',
        label: 'Control Queue',
        url: '/control/queue',
        parentKey: 'control-department',
        allowedRoles: ['control', 'admin', 'it'],
      },
      {
        key: 'control-schedule',
        label: 'Schedule Visits',
        url: '/control/schedule',
        parentKey: 'control-department',
        allowedRoles: ['control', 'admin', 'it'],
      },
      {
        key: 'control-visit',
        label: 'Control Visit',
        url: '/control/visit',
        parentKey: 'control-department',
        allowedRoles: ['control', 'admin', 'it'],
      },
      {
        key: 'control-visits',
        label: 'Visit History',
        url: '/control/visits',
        parentKey: 'control-department',
        allowedRoles: ['control', 'admin', 'it'],
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
        allowedRoles: ['director', 'admin', 'it'],
      },
      {
        key: 'minister-review',
        label: 'Minister Decision',
        url: '/reviews/minister',
        parentKey: 'reviews',
        allowedRoles: ['minister', 'admin', 'it'],
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
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: 'users',
        label: 'Users',
        url: '/admin/users',
        parentKey: 'user-management',
        allowedRoles: ['admin', 'it'],
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
    allowedRoles: ['admin', 'it', 'staff'],
    children: [
      {
        key: 'workflow-validation',
        label: 'Workflow Validation',
        url: '/workflow/validation',
        parentKey: 'workflow',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'workflow-testing',
        label: 'Workflow Testing',
        url: '/workflow/testing',
        parentKey: 'workflow',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'workflow-monitoring',
        label: 'Workflow Monitoring',
        url: '/workflow/monitoring',
        parentKey: 'workflow',
        allowedRoles: ['admin', 'it', 'staff'],
      },
    ],
  },
  {
    key: 'final-polish',
    label: 'Final Polish',
    isTitle: false,
    icon: 'mingcute:sparkles-line',
    url: '#',
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: 'polish-overview',
        label: 'Overview',
        url: '/polish/overview',
        parentKey: 'final-polish',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'performance-optimization',
        label: 'Performance Optimization',
        url: '/polish/performance',
        parentKey: 'final-polish',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'ux-enhancement',
        label: 'UX Enhancement',
        url: '/polish/ux-enhancement',
        parentKey: 'final-polish',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'production-readiness',
        label: 'Production Readiness',
        url: '/polish/production-readiness',
        parentKey: 'final-polish',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'documentation-training',
        label: 'Documentation & Training',
        url: '/polish/documentation',
        parentKey: 'final-polish',
        allowedRoles: ['admin', 'it'],
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
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: 'integration-testing',
        label: 'Integration Testing',
        url: '/testing/integration',
        parentKey: 'testing',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'end-to-end-testing',
        label: 'End-to-End Testing',
        url: '/testing/end-to-end',
        parentKey: 'testing',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'qa-dashboard',
        label: 'QA Dashboard',
        url: '/qa/dashboard',
        parentKey: 'testing',
        allowedRoles: ['admin', 'it'],
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
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: 'security-scanning',
        label: 'Security Scanning',
        url: '/security/scanning',
        parentKey: 'security-tools',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'security-monitoring',
        label: 'Security Monitoring',
        url: '/security/monitoring',
        parentKey: 'security-tools',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'security-hardening',
        label: 'Security Hardening',
        url: '/security/hardening',
        parentKey: 'security-tools',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'penetration-testing',
        label: 'Penetration Testing',
        url: '/security/penetration',
        parentKey: 'security-tools',
        allowedRoles: ['admin', 'it'],
      },
    ],
  },
  {
    key: "monitoring",
    label: "System Monitoring",
    isTitle: false,
    icon: "solar:monitor-bold",
    url: "/monitoring",
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: "system-health",
        label: "System Health",
        url: "/monitoring/health",
        parentKey: "monitoring",
        allowedRoles: ['admin', 'it'],
      },
      {
        key: "performance-monitoring", 
        label: "Performance",
        url: "/monitoring/performance",
        parentKey: "monitoring",
        allowedRoles: ['admin', 'it'],
      },
      {
        key: "security-monitoring",
        label: "Security Scanner", 
        url: "/monitoring/security",
        parentKey: "monitoring",
        allowedRoles: ['admin', 'it'],
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
    allowedRoles: ['admin', 'it'],
    children: [
      {
        key: 'deployment-guide',
        label: 'Deployment Guide',
        url: '/deployment/guide',
        parentKey: 'deployment-tools',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'production-readiness',
        label: 'Production Readiness',
        url: '/deployment/readiness',
        parentKey: 'deployment-tools',
        allowedRoles: ['admin', 'it'],
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
    allowedRoles: ['admin', 'it', 'staff'],
    children: [
      {
        key: 'technical-documentation',
        label: 'Technical Documentation',
        url: '/documentation/technical',
        parentKey: 'documentation-tools',
        allowedRoles: ['admin', 'it'],
      },
      {
        key: 'user-guide-documentation',
        label: 'User Guide',
        url: '/documentation/user-guide',
        parentKey: 'documentation-tools',
        allowedRoles: ['admin', 'it', 'staff'],
      },
    ],
  },

]