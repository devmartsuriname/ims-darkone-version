import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { NotificationProvider as ToastNotificationProvider } from '@/components/ui/NotificationToasts'
import WorkflowNotificationIntegration from '@/components/notifications/WorkflowNotificationIntegration'
import { ChildrenType } from '@/types/component-props'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <>
      <HelmetProvider>
        <AuthProvider>
          <LayoutProvider>
            <NotificationProvider>
              <ToastNotificationProvider>
                <WorkflowNotificationIntegration />
                {children}
                <ToastContainer theme="colored" />
              </ToastNotificationProvider>
            </NotificationProvider>
          </LayoutProvider>
        </AuthProvider>
      </HelmetProvider>
    </>
  )
}
export default AppProvidersWrapper
