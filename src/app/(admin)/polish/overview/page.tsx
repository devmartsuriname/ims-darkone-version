import React from 'react';
import PageTitle from '@/components/PageTitle';
import ProductionPolishDashboard from '@/components/polish/ProductionPolishDashboard';

const PolishOverviewPage: React.FC = () => {
  return (
    <div className="container-fluid">
      <PageTitle 
        title="Production Polish Overview" 
        subName="Complete system polish for production deployment"
      />
      <ProductionPolishDashboard />
    </div>
  );
};

export default PolishOverviewPage;