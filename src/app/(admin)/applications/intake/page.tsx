import { StaffGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import ApplicationIntakeForm from './components/ApplicationIntakeForm';

const ApplicationIntakePage = () => {
  return (
    <StaffGuard>
      <PageTitle subName="IMS" title="New Application" />
      <ApplicationIntakeForm />
    </StaffGuard>
  );
};

export default ApplicationIntakePage;