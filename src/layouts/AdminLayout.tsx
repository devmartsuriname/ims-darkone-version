import AnimationStar from '@/components/AnimationStar'
import Footer from '@/components/layout/Footer'
import WorkflowNotificationIntegration from '@/components/notifications/WorkflowNotificationIntegration'
import { ChildrenType } from '@/types/component-props'
import { lazy, Suspense } from 'react'
import { Container } from 'react-bootstrap'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar/page'))
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar/page'))

const AdminLayout = ({ children }: ChildrenType) => {
  console.info('🎨 [LAYOUT][Admin] Rendering AdminLayout')
  
  return (
    <div className="wrapper">
      {/* Global notification integration */}
      <WorkflowNotificationIntegration />
      
      <Suspense fallback={
        <div className="position-fixed top-0 start-0 w-100 p-2 bg-primary text-white text-center" style={{ zIndex: 9999 }}>
          <small>Loading navigation...</small>
        </div>
      }>
        <TopNavigationBar />
        <VerticalNavigationBar />
      </Suspense>
      
      <AnimationStar />
      <div className="page-content">
        <Container fluid>{children}</Container>
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
