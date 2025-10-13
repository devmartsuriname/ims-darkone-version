import { DirectorGuard } from '@/components/auth/RoleGuards';
import DirectorReviewDashboard from './components/DirectorReviewDashboard';
import PageTitle from '@/components/PageTitle';

const DirectorReviewPage = () => {
  return (
    <DirectorGuard>
      <div className="container-fluid">
        <PageTitle title="Director Review" subName="Reviews" />
        <DirectorReviewDashboard />
      </div>
    </DirectorGuard>
  );
};

export default DirectorReviewPage;