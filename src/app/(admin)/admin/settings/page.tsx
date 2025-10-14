import { useState } from 'react'
import { Card, Row, Col, Nav, Tab } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import ReferenceDataManagement from './components/ReferenceDataManagement'
import SystemConfiguration from './components/SystemConfiguration'
import DatabaseMaintenance from './components/DatabaseMaintenance'

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('reference-data')

  return (
    <>
      <PageTitle
        title="System Settings"
        subName="Administration"
      />

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'reference-data')}>
                <Nav variant="tabs" className="nav-bordered mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="reference-data">
                      <i className="mdi mdi-database me-1"></i>
                      Reference Data
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="system-config">
                      <i className="mdi mdi-cog me-1"></i>
                      System Configuration
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="maintenance">
                      <i className="mdi mdi-toolbox me-1"></i>
                      Database Maintenance
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="reference-data">
                    <ReferenceDataManagement />
                  </Tab.Pane>
                  <Tab.Pane eventKey="system-config">
                    <SystemConfiguration />
                  </Tab.Pane>
                  <Tab.Pane eventKey="maintenance">
                    <DatabaseMaintenance />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default SystemSettingsPage
