import { MinisterGuard } from '@/components/auth/RoleGuards';
import MinisterDecisionDashboard from './components/MinisterDecisionDashboard';
import PageTitle from '@/components/PageTitle';

const MinisterDecisionPage = () => {
  return (
    <MinisterGuard>
      <div className="container-fluid">
        <PageTitle title="Minister Decision" subName="Reviews" />
        <MinisterDecisionDashboard />
      </div>
    </MinisterGuard>
  );
};

export default MinisterDecisionPage;