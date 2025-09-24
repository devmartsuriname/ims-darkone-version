import PageTitle from '@/components/PageTitle';
import { QualityAssuranceDashboard } from '@/components/qa/QualityAssuranceDashboard';

export default function QADashboardPage() {
  return (
    <>
      <PageTitle title="Quality Assurance" subName="Comprehensive QA Dashboard" />
      <QualityAssuranceDashboard />
    </>
  );
}