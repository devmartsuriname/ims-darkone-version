import React, { useState } from 'react';
import { Card, Alert, Button, Tab, Tabs, Table, Badge, ProgressBar } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import RoleCheck from '@/components/auth/RoleCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface UATChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  details?: string;
}

const UATPreparationPage: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [checklistItems, setChecklistItems] = useState<UATChecklistItem[]>([
    { id: '1', category: 'Test Data', item: 'Test applicants created', status: 'pending' },
    { id: '2', category: 'Test Data', item: 'Applications in various states', status: 'pending' },
    { id: '3', category: 'Test Data', item: 'Control visits scheduled', status: 'pending' },
    { id: '4', category: 'Test Data', item: 'Technical reports submitted', status: 'pending' },
    { id: '5', category: 'Test Data', item: 'Social reports submitted', status: 'pending' },
    { id: '6', category: 'Workflows', item: 'Application intake → submission', status: 'pending' },
    { id: '7', category: 'Workflows', item: 'Control assignment → scheduling', status: 'pending' },
    { id: '8', category: 'Workflows', item: 'Technical assessment → approval', status: 'pending' },
    { id: '9', category: 'Workflows', item: 'Social assessment → approval', status: 'pending' },
    { id: '10', category: 'Workflows', item: 'Director review → decision', status: 'pending' },
    { id: '11', category: 'Workflows', item: 'Minister decision → closure', status: 'pending' },
    { id: '12', category: 'Security', item: 'RLS policies enforced', status: 'pending' },
    { id: '13', category: 'Security', item: 'Role-based access working', status: 'pending' },
    { id: '14', category: 'Security', item: 'No unauthorized data access', status: 'pending' },
    { id: '15', category: 'Performance', item: 'Page load times < 2s', status: 'pending' },
    { id: '16', category: 'Performance', item: 'No console errors', status: 'pending' },
    { id: '17', category: 'Performance', item: 'File uploads working', status: 'pending' },
  ]);

  const seedTestData = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-data-seeding', {
        body: { action: 'seed' }
      });

      if (error) throw error;

      toast.success(`Test data seeded: ${data.data.applicants} applicants, ${data.data.applications} applications`);
      
      // Update checklist
      setChecklistItems(prev => prev.map(item => {
        if (item.category === 'Test Data') {
          return { ...item, status: 'pass' as const };
        }
        return item;
      }));

    } catch (error: any) {
      toast.error(`Failed to seed test data: ${error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const cleanupTestData = async () => {
    setCleaning(true);
    try {
      const { error } = await supabase.functions.invoke('test-data-seeding', {
        body: { action: 'cleanup' }
      });

      if (error) throw error;

      toast.success('Test data cleaned up successfully');
      
      // Reset checklist
      setChecklistItems(prev => prev.map(item => ({ ...item, status: 'pending' as const })));

    } catch (error: any) {
      toast.error(`Failed to cleanup test data: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  const updateChecklistItem = (id: string, status: 'pass' | 'fail' | 'warning', details?: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, details } : item
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge bg="success">Pass</Badge>;
      case 'fail': return <Badge bg="danger">Fail</Badge>;
      case 'warning': return <Badge bg="warning">Warning</Badge>;
      default: return <Badge bg="secondary">Pending</Badge>;
    }
  };

  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, UATChecklistItem[]>);

  const stats = {
    total: checklistItems.length,
    passed: checklistItems.filter(i => i.status === 'pass').length,
    failed: checklistItems.filter(i => i.status === 'fail').length,
    warnings: checklistItems.filter(i => i.status === 'warning').length,
    pending: checklistItems.filter(i => i.status === 'pending').length,
  };

  const completionPercentage = Math.round((stats.passed / stats.total) * 100);

  return (
    <>
      <PageTitle title="UAT Preparation" subName="Testing" />

      <RoleCheck allowedRoles={['admin', 'it']}>
        <Alert variant="info" className="mb-4">
          <h6 className="alert-heading">PHASE 4: UAT Preparation</h6>
          <p className="mb-0">
            Prepare the system for User Acceptance Testing by seeding test data, validating workflows, 
            and ensuring all security and performance requirements are met.
          </p>
        </Alert>

        {/* Progress Overview */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">UAT Readiness Progress</h5>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Overall Completion</span>
                <span><strong>{completionPercentage}%</strong></span>
              </div>
              <ProgressBar 
                now={completionPercentage} 
                variant={completionPercentage >= 95 ? 'success' : completionPercentage >= 70 ? 'warning' : 'danger'}
              />
            </div>

            <div className="row mt-4">
              <div className="col-md-3">
                <Card className="bg-success text-white">
                  <Card.Body>
                    <h3 className="mb-0">{stats.passed}</h3>
                    <p className="mb-0">Passed</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="bg-danger text-white">
                  <Card.Body>
                    <h3 className="mb-0">{stats.failed}</h3>
                    <p className="mb-0">Failed</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="bg-warning text-white">
                  <Card.Body>
                    <h3 className="mb-0">{stats.warnings}</h3>
                    <p className="mb-0">Warnings</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="bg-secondary text-white">
                  <Card.Body>
                    <h3 className="mb-0">{stats.pending}</h3>
                    <p className="mb-0">Pending</p>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Main Content */}
        <Tabs defaultActiveKey="seeding" className="mb-4">
          <Tab eventKey="seeding" title="Test Data Seeding">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Step 11 — Test Data Seeding</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning">
                  <strong>⚠️ Important:</strong> Test data will be created with prefix "TEST-" for easy identification and cleanup.
                </Alert>

                <h6 className="mt-3">What will be created:</h6>
                <ul>
                  <li>3 test applicants (Jan de Vries, Maria Santos, Ravi Sharma)</li>
                  <li>3 test applications in different states (Intake Review, Control Assign, Technical Review)</li>
                  <li>1 scheduled control visit</li>
                  <li>1 completed technical report</li>
                  <li>1 completed social report</li>
                </ul>

                <h6 className="mt-3">Test User Roles Needed:</h6>
                <Table striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Purpose</th>
                      <th>Test Scenarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><Badge bg="primary">Admin</Badge></td>
                      <td>Full system access</td>
                      <td>All workflows, user management, system settings</td>
                    </tr>
                    <tr>
                      <td><Badge bg="info">IT</Badge></td>
                      <td>Technical support</td>
                      <td>System monitoring, security, performance</td>
                    </tr>
                    <tr>
                      <td><Badge bg="success">Staff</Badge></td>
                      <td>Application processing</td>
                      <td>Intake, document verification, reports</td>
                    </tr>
                    <tr>
                      <td><Badge bg="warning">Control</Badge></td>
                      <td>Inspections</td>
                      <td>Schedule visits, technical assessments, photo uploads</td>
                    </tr>
                    <tr>
                      <td><Badge bg="secondary">Director</Badge></td>
                      <td>Reviews & recommendations</td>
                      <td>Director review, approval recommendations</td>
                    </tr>
                    <tr>
                      <td><Badge bg="danger">Minister</Badge></td>
                      <td>Final decisions</td>
                      <td>Ministerial decisions, approvals/rejections</td>
                    </tr>
                  </tbody>
                </Table>

                <div className="d-flex gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    onClick={seedTestData}
                    disabled={seeding || cleaning}
                  >
                    {seeding ? 'Seeding Test Data...' : 'Seed Test Data'}
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={cleanupTestData}
                    disabled={seeding || cleaning}
                  >
                    {cleaning ? 'Cleaning Up...' : 'Cleanup Test Data'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="checklist" title="UAT Checklist">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Step 12 — UAT Validation Checklist</h5>
              </Card.Header>
              <Card.Body>
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h6 className="mb-3">{category}</h6>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: '60%' }}>Validation Item</th>
                          <th style={{ width: '20%' }}>Status</th>
                          <th style={{ width: '20%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id}>
                            <td>
                              {item.item}
                              {item.details && (
                                <div className="text-muted small mt-1">{item.details}</div>
                              )}
                            </td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => updateChecklistItem(item.id, 'pass')}
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => updateChecklistItem(item.id, 'fail')}
                                >
                                  ✗
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => updateChecklistItem(item.id, 'warning')}
                                >
                                  ⚠
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="workflows" title="Workflow Testing">
            <Card>
              <Card.Header>
                <h5 className="mb-0">End-to-End Workflow Validation</h5>
              </Card.Header>
              <Card.Body>
                <h6>Complete Application Lifecycle Test</h6>
                <ol className="mt-3">
                  <li className="mb-2">
                    <strong>Application Intake → Draft</strong>
                    <div className="text-muted small">Navigate to Applications → Intake, fill form with test data</div>
                  </li>
                  <li className="mb-2">
                    <strong>Staff Review → Intake Review</strong>
                    <div className="text-muted small">Review application, verify all required documents</div>
                  </li>
                  <li className="mb-2">
                    <strong>Control Assignment → Control Assign</strong>
                    <div className="text-muted small">Assign to control inspector from queue</div>
                  </li>
                  <li className="mb-2">
                    <strong>Visit Scheduling → Visit Scheduled</strong>
                    <div className="text-muted small">Schedule control visit with date/time</div>
                  </li>
                  <li className="mb-2">
                    <strong>Control Visit → Control In Progress</strong>
                    <div className="text-muted small">Upload minimum 6 photos, capture EXIF data</div>
                  </li>
                  <li className="mb-2">
                    <strong>Technical Report → Technical Review</strong>
                    <div className="text-muted small">Complete technical assessment form</div>
                  </li>
                  <li className="mb-2">
                    <strong>Social Report → Social Review</strong>
                    <div className="text-muted small">Complete social assessment form</div>
                  </li>
                  <li className="mb-2">
                    <strong>Director Review → Director Review</strong>
                    <div className="text-muted small">Verify gate control (docs + photos + reports), add recommendation</div>
                  </li>
                  <li className="mb-2">
                    <strong>Minister Decision → Final Decision</strong>
                    <div className="text-muted small">Approve/reject with justification</div>
                  </li>
                  <li className="mb-2">
                    <strong>Closure/Rejection → Completed</strong>
                    <div className="text-muted small">Verify final state and audit trail</div>
                  </li>
                </ol>

                <Alert variant="success" className="mt-4">
                  <strong>Success Criteria:</strong>
                  <ul className="mb-0 mt-2">
                    <li>All workflow transitions execute without errors</li>
                    <li>Gate controls prevent invalid progressions</li>
                    <li>SLA timers track correctly</li>
                    <li>Audit logs capture all state changes</li>
                    <li>Notifications sent at appropriate stages</li>
                  </ul>
                </Alert>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="security" title="Security Validation">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Security & Access Control Testing</h5>
              </Card.Header>
              <Card.Body>
                <h6>RLS Policy Validation</h6>
                <Table striped bordered className="mt-3">
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Test</th>
                      <th>Expected Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>applications</td>
                      <td>Applicant tries to view all applications</td>
                      <td>❌ Access denied - RLS blocks unauthorized access</td>
                    </tr>
                    <tr>
                      <td>applications</td>
                      <td>Staff views application list</td>
                      <td>✅ All applications visible</td>
                    </tr>
                    <tr>
                      <td>control_visits</td>
                      <td>Staff tries to create control visit</td>
                      <td>❌ Access denied - only control role allowed</td>
                    </tr>
                    <tr>
                      <td>documents</td>
                      <td>Director views application documents</td>
                      <td>✅ Read access granted for review</td>
                    </tr>
                    <tr>
                      <td>user_roles</td>
                      <td>Staff tries to modify user roles</td>
                      <td>❌ Access denied - only admin/IT allowed</td>
                    </tr>
                  </tbody>
                </Table>

                <h6 className="mt-4">Role-Based Access Matrix</h6>
                <div className="text-muted small mb-2">
                  Test that each role can ONLY access their permitted routes and actions
                </div>

                <Alert variant="warning" className="mt-3">
                  <strong>⚠️ Critical Security Tests:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Verify no data leaks between applications</li>
                    <li>Confirm file uploads are scoped to user/application</li>
                    <li>Test signed URLs expire correctly</li>
                    <li>Validate EXIF data in uploaded photos</li>
                    <li>Ensure audit logs are immutable</li>
                  </ul>
                </Alert>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* UAT Readiness Status */}
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">UAT Readiness Status</h5>
          </Card.Header>
          <Card.Body>
            {completionPercentage >= 95 ? (
              <Alert variant="success">
                <h6 className="alert-heading">✅ System Ready for UAT</h6>
                <p className="mb-0">
                  All critical validation checks have passed. The system is ready for User Acceptance Testing.
                  Ensure all stakeholders have been notified and test credentials are distributed.
                </p>
              </Alert>
            ) : completionPercentage >= 70 ? (
              <Alert variant="warning">
                <h6 className="alert-heading">⚠️ UAT Preparation In Progress</h6>
                <p className="mb-0">
                  {stats.pending} items pending, {stats.failed} failures. 
                  Complete remaining validation steps before proceeding to UAT.
                </p>
              </Alert>
            ) : (
              <Alert variant="danger">
                <h6 className="alert-heading">❌ Not Ready for UAT</h6>
                <p className="mb-0">
                  Multiple validation items incomplete or failed. 
                  Address critical issues before UAT can begin.
                </p>
              </Alert>
            )}
          </Card.Body>
        </Card>
      </RoleCheck>
    </>
  );
};

export default UATPreparationPage;
