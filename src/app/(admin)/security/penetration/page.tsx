import React from 'react';
import PageTitle from '@/components/PageTitle';
import { PenetrationTestingTools } from '@/components/security/PenetrationTestingTools';

const PenetrationTestingPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Penetration Testing" subName="Automated security testing and vulnerability assessment" />
      
      <div className="row">
        <div className="col-12">
          <PenetrationTestingTools />
        </div>
      </div>
    </>
  );
};

export default PenetrationTestingPage;