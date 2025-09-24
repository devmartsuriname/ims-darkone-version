import React from 'react';
import PageTitle from '@/components/PageTitle';
import { SecurityMonitoringDashboard } from '@/components/security/SecurityMonitoringDashboard';

const SecurityMonitoringPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Security Monitoring" subName="Real-time threat detection and security event tracking" />
      
      <div className="row">
        <div className="col-12">
          <SecurityMonitoringDashboard />
        </div>
      </div>
    </>
  );
};

export default SecurityMonitoringPage;