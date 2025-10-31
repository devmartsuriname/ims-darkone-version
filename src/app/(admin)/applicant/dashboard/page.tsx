import { ApplicantGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Row, Col, Alert } from 'react-bootstrap';
import { useAuthContext } from '@/context/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const ApplicantDashboardPage = () => {
  const { user } = useAuthContext();

  // Fetch applicant's applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applicant-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get applicant record
      const { data: applicant } = await supabase
        .from('applicants')
        .select('id')
        .eq('email', user.email || '')
        .single();

      if (!applicant) return [];

      // Then get applications
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', applicant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!user?.email,
  });

  const totalApplications = applications.length;
  const inProgress = applications.filter(app => 
    !['CLOSURE', 'REJECTED', 'DRAFT'].includes(app.current_state || '')
  ).length;
  const approved = applications.filter(app => app.current_state === 'CLOSURE').length;
  const drafts = applications.filter(app => app.current_state === 'DRAFT').length;

  return (
    <ApplicantGuard>
      <PageTitle subName="Applicant Portal" title="My Dashboard" />
      
      <Row className="mb-4">
        <Col xs={12}>
          <Alert variant="info">
            <IconifyIcon icon="bx:info-circle" className="me-2" />
            Welcome to your applicant dashboard. Here you can view and manage your housing subsidy applications.
          </Alert>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="bx:folder" className="fs-2 text-primary" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Applications</h6>
                  <h3 className="mb-0">{totalApplications}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="bx:time" className="fs-2 text-warning" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">In Progress</h6>
                  <h3 className="mb-0">{inProgress}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="bx:check-circle" className="fs-2 text-success" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Approved</h6>
                  <h3 className="mb-0">{approved}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="bx:edit" className="fs-2 text-secondary" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Drafts</h6>
                  <h3 className="mb-0">{drafts}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h5 className="mb-3">
                <IconifyIcon icon="bx:plus-circle" className="me-2" />
                Quick Actions
              </h5>
              <div className="d-grid gap-2">
                <Link to="/applicant/submit" className="btn btn-primary">
                  <IconifyIcon icon="bx:plus" className="me-2" />
                  Submit New Application
                </Link>
                <Link to="/applicant/applications" className="btn btn-outline-primary">
                  <IconifyIcon icon="bx:list-ul" className="me-2" />
                  View All Applications
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h5 className="mb-3">
                <IconifyIcon icon="bx:time-five" className="me-2" />
                Recent Applications
              </h5>
              {isLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <p className="text-muted mb-0">No applications yet. Submit your first application to get started.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{app.application_number}</h6>
                          <small className="text-muted">{app.service_type}</small>
                        </div>
                        <span className={`badge bg-${
                          app.current_state === 'CLOSURE' ? 'success' :
                          app.current_state === 'REJECTED' ? 'danger' :
                          app.current_state === 'DRAFT' ? 'secondary' :
                          'warning'
                        }`}>
                          {app.current_state || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </ApplicantGuard>
  );
};

export default ApplicantDashboardPage;
