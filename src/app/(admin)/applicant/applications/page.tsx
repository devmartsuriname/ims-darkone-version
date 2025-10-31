import { ApplicantGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useAuthContext } from '@/context/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { useState } from 'react';

const ApplicantApplicationsPage = () => {
  const { user } = useAuthContext();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch applicant's applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applicant-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get applicant record
      const { data: applicant } = await supabase
        .from('applicants')
        .select('id, first_name, last_name')
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

  // Filter applications by status
  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.current_state === filterStatus);

  const getStatusBadgeVariant = (status: string | null) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'CLOSURE': return 'success';
      case 'REJECTED': return 'danger';
      case 'DRAFT': return 'secondary';
      case 'INTAKE_REVIEW': return 'info';
      case 'CONTROL_VISIT_SCHEDULED': return 'warning';
      case 'TECHNICAL_REVIEW': return 'primary';
      case 'DIRECTOR_REVIEW': return 'warning';
      case 'MINISTER_DECISION': return 'warning';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string | null) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  return (
    <ApplicantGuard>
      <PageTitle subName="Applicant Portal" title="My Applications" />
      
      <Row className="mb-3">
        <Col xs={12}>
          <Alert variant="info">
            <IconifyIcon icon="bx:info-circle" className="me-2" />
            Track the status of all your housing subsidy applications here.
          </Alert>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <div className="btn-group" role="group">
            <button 
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({applications.length})
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'DRAFT' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('DRAFT')}
            >
              Drafts ({applications.filter(a => a.current_state === 'DRAFT').length})
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'INTAKE_REVIEW' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('INTAKE_REVIEW')}
            >
              In Review ({applications.filter(a => !['DRAFT', 'CLOSURE', 'REJECTED'].includes(a.current_state || '')).length})
            </button>
            <button 
              className={`btn btn-sm ${filterStatus === 'CLOSURE' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('CLOSURE')}
            >
              Approved ({applications.filter(a => a.current_state === 'CLOSURE').length})
            </button>
          </div>
        </Col>
        <Col md={4} className="text-end">
          <Link to="/applicant/submit" className="btn btn-primary btn-sm">
            <IconifyIcon icon="bx:plus" className="me-1" />
            New Application
          </Link>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:folder-open" className="fs-1 text-muted mb-3" />
                  <p className="text-muted mb-3">
                    {filterStatus === 'all' 
                      ? 'No applications found. Start by submitting your first application.' 
                      : `No applications with status: ${formatStatus(filterStatus)}`}
                  </p>
                  {filterStatus === 'all' && (
                    <Link to="/applicant/submit" className="btn btn-primary">
                      <IconifyIcon icon="bx:plus" className="me-2" />
                      Submit New Application
                    </Link>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Application #</th>
                        <th>Service Type</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Property Address</th>
                        <th>Requested Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.application_number}</strong>
                          </td>
                          <td>{app.service_type || '-'}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(app.current_state)}>
                              {formatStatus(app.current_state)}
                            </Badge>
                          </td>
                          <td>
                            {app.submitted_at 
                              ? new Date(app.submitted_at).toLocaleDateString()
                              : '-'}
                          </td>
                          <td>{app.property_address || '-'}</td>
                          <td>
                            {app.requested_amount 
                              ? `SRD ${Number(app.requested_amount).toLocaleString()}`
                              : '-'}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              title="View Details"
                            >
                              <IconifyIcon icon="bx:show" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </ApplicantGuard>
  );
};

export default ApplicantApplicationsPage;
