import { AdminGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import IntegrationTestDashboard from './components/IntegrationTestDashboard';

const IntegrationTestingPage = () => {
  return (
    <AdminGuard>
      <PageTitle subName="IMS Testing" title="Integration Testing" />
      <IntegrationTestDashboard />
    </AdminGuard>
  );
};

export default IntegrationTestingPage;