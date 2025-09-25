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

const page = () => {

  return (
    <>
      <PageTitle subName="IMS" title="Dashboard" />
      
      {/* KPI Cards */}
      <IMSCards />
      
      {/* System Metrics Dashboard */}
      <Row className="mt-4">
        <Col xl={12}>
          <SystemMetricsDashboard />
        </Col>
      </Row>
      
      {/* Main Content Row */}
      <Row className="mt-4">
        <Col xl={8}>
          <WorkflowChart />
        </Col>
        <Col xl={4}>
          <QuickActions />
        </Col>
      </Row>
      
      {/* Activities & Analytics Row */}
      <Row className="mt-4">
        <Col xl={6}>
          <RecentActivities />
        </Col>
        <Col xl={6}>
          <RoleCheck allowedRoles={['admin', 'it', 'director', 'minister']}>
            <Chart />
          </RoleCheck>
        </Col>
      </Row>
      
      {/* Integration Testing (Admin/IT Only) */}
      <Row className="mt-4">
        <Col xl={12}>
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
