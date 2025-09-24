import { AdminGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import ProductionReadinessChecker from './components/ProductionReadinessChecker';

const DeploymentReadinessPage = () => {
  return (
    <AdminGuard>
      <PageTitle subName="IMS Deployment" title="Production Readiness" />
      <ProductionReadinessChecker />
    </AdminGuard>
  );
};

export default DeploymentReadinessPage;