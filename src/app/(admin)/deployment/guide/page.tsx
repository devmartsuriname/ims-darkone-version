import React from 'react';
import PageTitle from '@/components/PageTitle';
import { DeploymentGuide } from './components/DeploymentGuide';

const DeploymentGuidePage: React.FC = () => {
  return (
    <>
      <PageTitle title="Deployment Guide" subTitle="Step-by-step production deployment process" />
      <DeploymentGuide />
    </>
  );
};

export default DeploymentGuidePage;