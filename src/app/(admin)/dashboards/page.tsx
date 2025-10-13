import { useState, useCallback, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import Footer from '@/components/layout/Footer';
import RoleCheck from '@/components/auth/RoleCheck';
import { DashboardLayout, DashboardSection, DashboardGrid } from '@/components/dashboard/DashboardLayout';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';
import { DashboardDebugger } from './components/DashboardDebugger';
import WorkflowChart from './components/WorkflowChart';
import RecentActivities from './components/RecentActivities';
import QuickActions from './components/QuickActions';
import { SystemMetricsDashboard } from './components/SystemMetricsDashboard';
import Chart from './components/Chart';
import IntegrationTestRunner from '@/components/testing/IntegrationTestRunner';

const ComponentErrorFallback = ({ error, componentName }: { error: Error; componentName: string }) => {
  console.error(`❌ Component Error [${componentName}]:`, error);
  return (
    <div className="alert alert-danger">
      <h6 className="alert-heading">⚠️ Component Error: {componentName}</h6>
      <p className="mb-1"><strong>Error:</strong> {error.message}</p>
      <details>
        <summary className="btn btn-sm btn-outline-danger mt-2">View Stack Trace</summary>
        <pre className="mt-2 mb-0" style={{ fontSize: '0.7rem', maxHeight: '200px', overflow: 'auto' }}>
          {error.stack}
        </pre>
      </details>
    </div>
  );
};

const page = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebugger, setShowDebugger] = useState(true);

  useEffect(() => {
    console.log('✅ Dashboard Page Mounted');
    console.log('📊 Components Loading:', {
      DashboardMetrics: 'ready',
      SystemMetricsDashboard: 'ready',
      WorkflowChart: 'ready',
      QuickActions: 'ready',
      RecentActivities: 'ready',
      Chart: 'ready',
      IntegrationTestRunner: 'ready'
    });
    
    return () => {
      console.log('👋 Dashboard Page Unmounted');
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Dashboard Refresh Started');
    setIsRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      console.log('✅ Dashboard Refresh Complete');
    } catch (error) {
      console.error('❌ Dashboard Refresh Error:', error);
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
      {/* Debug Info */}
      {showDebugger && (
        <div className="mb-3">
          <DashboardDebugger />
          <button 
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={() => setShowDebugger(false)}
          >
            Hide Debug Info
          </button>
        </div>
      )}

      {/* Enhanced KPI Cards with Real-time Updates */}
      <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="DashboardMetrics" />}>
        <DashboardSection title="Performance Metrics">
          <DashboardMetrics />
        </DashboardSection>
      </ErrorBoundary>
      
      {/* System Metrics Dashboard */}
      <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="SystemMetricsDashboard" />}>
        <DashboardSection title="System Health" className="mt-4">
          <SystemMetricsDashboard />
        </DashboardSection>
      </ErrorBoundary>
      
      {/* Main Content Row */}
      <DashboardGrid spacing={4} className="mt-4">
        <Col xxl={8} xl={12} lg={12} md={12} sm={12}>
          <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="WorkflowChart" />}>
            <WorkflowChart />
          </ErrorBoundary>
        </Col>
        <Col xxl={4} xl={12} lg={12} md={12} sm={12}>
          <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="QuickActions" />}>
            <QuickActions />
          </ErrorBoundary>
        </Col>
      </DashboardGrid>
      
      {/* Activities & Analytics Row */}
      <DashboardGrid spacing={4} className="mt-4">
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="RecentActivities" />}>
            <RecentActivities />
          </ErrorBoundary>
        </Col>
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <RoleCheck allowedRoles={['admin', 'it', 'director', 'minister']}>
            <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="Chart" />}>
              <Chart />
            </ErrorBoundary>
          </RoleCheck>
        </Col>
      </DashboardGrid>
      
      {/* Integration Testing (Admin/IT Only) */}
      <DashboardSection className="mt-4">
        <RoleCheck allowedRoles={['admin', 'it']}>
          <ErrorBoundary fallback={<ComponentErrorFallback error={new Error('Failed to load')} componentName="IntegrationTestRunner" />}>
            <IntegrationTestRunner />
          </ErrorBoundary>
        </RoleCheck>
      </DashboardSection>
      
      <Footer />
    </DashboardLayout>
  );
};

export default page;
