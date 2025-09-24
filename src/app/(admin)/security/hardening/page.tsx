import React from 'react';
import PageTitle from '@/components/PageTitle';
import { SecurityHardeningTools } from '@/components/security/SecurityHardeningTools';

const SecurityHardeningPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Security Hardening" subName="Security configuration and vulnerability remediation tools" />
      
      <div className="row">
        <div className="col-12">
          <SecurityHardeningTools />
        </div>
      </div>
    </>
  );
};

export default SecurityHardeningPage;