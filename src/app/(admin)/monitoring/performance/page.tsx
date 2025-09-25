import { PerformanceProfiler } from '@/components/monitoring/PerformanceProfiler';
import PageTitle from '@/components/PageTitle';

export default function PerformanceMonitoringPage() {
  return (
    <>
      <PageTitle 
        title="Performance Monitoring"
        subName="Advanced performance profiling and metrics collection"
      />
      <PerformanceProfiler />
    </>
  );
}