import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Row, Col } from 'react-bootstrap'
// IMS Dashboard Components
import IMSCards from './components/IMSCards'
import WorkflowChart from './components/WorkflowChart'
import RecentActivities from './components/RecentActivities'
import QuickActions from './components/QuickActions'
import { SystemMetricsDashboard } from './components/SystemMetricsDashboard'
import Chart from './components/Chart'
import RoleCheck from '@/components/auth/RoleCheck'
import IntegrationTestRunner from '@/components/testing/IntegrationTestRunner'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { useState } from 'react'

const page = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Force refresh by updating the timestamp
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
        <PageTitle subName="IMS" title="Dashboard" />
        <RefreshButton 
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
          lastUpdated={lastUpdated}
          autoRefreshInterval={300} // Auto-refresh every 5 minutes
        />
      </div>
      
      {/* KPI Cards */}
      <IMSCards />
      
      {/* System Metrics Dashboard */}
      <Row className="mt-4">
        <Col xs={12}>
          <SystemMetricsDashboard />
        </Col>
      </Row>
      
      {/* Main Content Row */}
      <Row className="mt-4 g-3">
        <Col xxl={8} xl={12} lg={12} md={12} sm={12}>
          <WorkflowChart />
        </Col>
        <Col xxl={4} xl={12} lg={12} md={12} sm={12}>
          <QuickActions />
        </Col>
      </Row>
      
      {/* Activities & Analytics Row */}
      <Row className="mt-4 g-3">
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <RecentActivities />
        </Col>
        <Col xxl={6} xl={12} lg={6} md={12} sm={12}>
          <RoleCheck allowedRoles={['admin', 'it', 'director', 'minister']}>
            <Chart />
          </RoleCheck>
        </Col>
      </Row>
      
      {/* Integration Testing (Admin/IT Only) */}
      <Row className="mt-4">
        <Col xs={12}>
          <RoleCheck allowedRoles={['admin', 'it']}>
            <IntegrationTestRunner />
          </RoleCheck>
        </Col>
      </Row>
      
      <Footer />
    </>
  )
}

export default page
