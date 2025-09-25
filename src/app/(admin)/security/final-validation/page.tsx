import React from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { SecurityValidationSuite } from '@/components/security/SecurityValidationSuite';
import { PerformanceMonitorSuite } from '@/components/performance/PerformanceMonitorSuite';
import { ProductionReadinessChecker } from '@/components/production/ProductionReadinessChecker';
import RoleCheck from '@/components/auth/RoleCheck';

const SecurityHardeningPage: React.FC = () => {
  return (
    <Container fluid>
      <PageTitle 
        title="Final Security & Performance Validation" 
        subName="Production Readiness Assessment"
      />

      <RoleCheck allowedRoles={['admin', 'it']}>
        <Tabs defaultActiveKey="security" className="mb-4">
          <Tab eventKey="security" title="Security Validation">
            <SecurityValidationSuite />
          </Tab>
          
          <Tab eventKey="performance" title="Performance Monitor">
            <PerformanceMonitorSuite />
          </Tab>
          
          <Tab eventKey="readiness" title="Production Readiness">
            <ProductionReadinessChecker />
          </Tab>
        </Tabs>
      </RoleCheck>
    </Container>
  );
};

export default SecurityHardeningPage;