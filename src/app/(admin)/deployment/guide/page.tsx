import { AdminGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import DeploymentGuide from './components/DeploymentGuide';

const DeploymentGuidePage = () => {
  return (
    <AdminGuard>
      <PageTitle subName="IMS Deployment" title="Deployment Guide" />
      <DeploymentGuide />
    </AdminGuard>
  );
};

export default DeploymentGuidePage;