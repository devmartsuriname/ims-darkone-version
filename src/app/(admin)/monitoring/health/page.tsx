import { SystemHealthMonitor } from '@/components/monitoring/SystemHealthMonitor';
import PageTitle from '@/components/PageTitle';

export default function SystemHealthPage() {
  return (
    <>
      <PageTitle 
        title="System Health Monitoring"
        subName="Real-time monitoring of system components and performance"
      />
      <SystemHealthMonitor />
    </>
  );
}