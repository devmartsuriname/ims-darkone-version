import React from 'react';
import PageTitle from '@/components/PageTitle';
import { SecurityScanner } from '@/components/security/SecurityScanner';

const SecurityScanningPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Security Scanning" subName="Comprehensive vulnerability assessment and security analysis" />
      
      <div className="row">
        <div className="col-12">
          <SecurityScanner />
        </div>
      </div>
    </>
  );
};

export default SecurityScanningPage;