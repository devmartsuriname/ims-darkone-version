import React from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { SystemHealthMonitor } from '@/components/monitoring/SystemHealthMonitor';
import { PerformanceMonitorSuite } from '@/components/performance/PerformanceMonitorSuite';
import { SecurityValidationSuite } from '@/components/security/SecurityValidationSuite';
import RoleCheck from '@/components/auth/RoleCheck';

const SystemHealthPage: React.FC = () => {
  return (
    <Container fluid>
      <PageTitle 
        title="System Health Assessment" 
        subName="Comprehensive system monitoring and health diagnostics"
      />

      <RoleCheck allowedRoles={['admin', 'it']}>
        <Tabs defaultActiveKey="health" className="mb-4">
          <Tab eventKey="health" title="System Health">
            <SystemHealthMonitor />
          </Tab>
          
          <Tab eventKey="performance" title="Performance">
            <PerformanceMonitorSuite />
          </Tab>
          
          <Tab eventKey="security" title="Security">
            <SecurityValidationSuite />
          </Tab>
        </Tabs>
      </RoleCheck>
    </Container>
  );
};

export default SystemHealthPage;