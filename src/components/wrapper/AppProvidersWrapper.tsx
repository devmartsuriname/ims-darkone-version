import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
// Toast notifications are now managed per component
import WorkflowNotificationIntegration from '@/components/notifications/WorkflowNotificationIntegration'
import SystemSetupChecker from '@/components/auth/SystemSetupChecker'
import { ChildrenType } from '@/types/component-props'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import toastifyStyles from '../../../node_modules/react-toastify/dist/ReactToastify.css'
void toastifyStyles

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <>
      <HelmetProvider>
        <AuthProvider>
          <LayoutProvider>
            <NotificationProvider>
              <WorkflowNotificationIntegration />
              <SystemSetupChecker>
                {children}
              </SystemSetupChecker>
              <ToastContainer theme="colored" />
            </NotificationProvider>
          </LayoutProvider>
        </AuthProvider>
      </HelmetProvider>
    </>
  )
}
export default AppProvidersWrapper
