import Footer from '@/components/layout/Footer'
import PageTitle from '@/components/PageTitle'
import { Row, Col } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'

// IMS Dashboard Components
import IMSCards from './components/IMSCards'
import WorkflowChart from './components/WorkflowChart'
import RecentActivities from './components/RecentActivities'
import QuickActions from './components/QuickActions'
import RoleCheck from '@/components/auth/RoleCheck'
import IntegrationTestRunner from '@/components/testing/IntegrationTestRunner'

// Fallback components for demo purposes
import Cards from './components/Cards'
import Chart from './components/Chart'
import User from './components/User'

const page = () => {
  const { profile, isAuthenticated } = useAuthContext()

  return (
    <>
      <PageTitle subName="IMS" title="Dashboard" />
      
      {/* IMS-specific dashboard content for authenticated users */}
      {isAuthenticated && profile ? (
        <>
          {/* KPI Cards */}
          <IMSCards />
          
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
        </>
      ) : (
        /* Fallback dashboard for non-authenticated users */
        <>
          <Cards />
          <Chart />
          <User />
        </>
      )}
      
      <Footer />
    </>
  )
}

export default page
