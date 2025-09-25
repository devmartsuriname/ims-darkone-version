import { useState, useCallback } from 'react';
import { Col } from 'react-bootstrap';
import Footer from '@/components/layout/Footer';
import RoleCheck from '@/components/auth/RoleCheck';
import { DashboardLayout, DashboardSection, DashboardGrid } from '@/components/dashboard/DashboardLayout';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import WorkflowChart from './components/WorkflowChart';
import RecentActivities from './components/RecentActivities';
import QuickActions from './components/QuickActions';
import { SystemMetricsDashboard } from './components/SystemMetricsDashboard';
import Chart from './components/Chart';
import IntegrationTestRunner from '@/components/testing/IntegrationTestRunner';

const page = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate refresh process with proper async handling
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
      
      // Dispatch custom event for other components to react to refresh
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="IMS"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      autoRefreshInterval={300000} // 5 minutes
    >
      {/* Enhanced KPI Cards with Real-time Updates */}
      <DashboardSection title="Performance Metrics">
        <DashboardMetrics />
      </DashboardSection>
      
      {/* System Metrics Dashboard */}
      <DashboardSection title="System Health" className="mt-4">
        <SystemMetricsDashboard />
      </DashboardSection>
      
      {/* Main Content Row */}
      <DashboardGrid spacing={4} className="mt-4">
        <Col xxl={8} xl={12} lg={12} md={12} sm={12}>
          <WorkflowChart />
        </Col>
        <Col xxl={4} xl={12} lg={12} md={12} sm={12}>
          <QuickActions />
        </Col>
      </DashboardGrid>
      
      {/* Activities & Analytics Row */}
      <DashboardGrid spacing={4} className="mt-4">
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <RecentActivities />
        </Col>
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <RoleCheck allowedRoles={['admin', 'it', 'director', 'minister']}>
            <Chart />
          </RoleCheck>
        </Col>
      </DashboardGrid>
      
      {/* Integration Testing (Admin/IT Only) */}
      <DashboardSection className="mt-4">
        <RoleCheck allowedRoles={['admin', 'it']}>
          <IntegrationTestRunner />
        </RoleCheck>
      </DashboardSection>
      
      <Footer />
    </DashboardLayout>
  );
};

export default page
