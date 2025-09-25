import { SecurityHealthScanner } from '@/components/monitoring/SecurityHealthScanner';
import PageTitle from '@/components/PageTitle';

export default function SecurityMonitoringPage() {
  return (
    <>
      <PageTitle 
        title="Security Health Scanner"
        subName="Comprehensive security assessment and vulnerability detection"
      />
      <SecurityHealthScanner />
    </>
  );
}