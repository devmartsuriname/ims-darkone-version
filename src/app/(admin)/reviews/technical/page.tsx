import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import RouteGuard from '@/components/auth/RouteGuard';
import PageTitle from '@/components/PageTitle';

interface Application {
  id: string;
  application_number: string;
  current_state: string | null;
  created_at: string | null;
  applicant: {
    first_name: string;
    last_name: string;
    phone: string | null;
  };
  property_address: string | null;
  service_type: string | null;
  technical_reports?: {
    id: string;
    technical_conclusion: string | null;
    urgency_level: number | null;
    submitted_at: string | null;
    approved_at: string | null;
  }[];
  control_visits?: {
    id: string;
    visit_status: string | null;
    actual_date: string | null;
  }[];
}

const TechnicalReviewPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchApplicationsForReview();
  }, [filter]);

  const fetchApplicationsForReview = async () => {
    try {
      let query = supabase
        .from('applications')
        .select(`
          id,
          application_number,
          current_state,
          created_at,
          property_address,
          service_type,
          applicants!inner (
            first_name,
            last_name,
            phone
          ),
          technical_reports (
            id,
            technical_conclusion,
            urgency_level,
            submitted_at,
            approved_at
          ),
          control_visits (
            id,
            visit_status,
            actual_date
          )
        `)
        .in('current_state', ['CONTROL_IN_PROGRESS', 'TECHNICAL_REVIEW'])
        .order('created_at', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      const processedApplications = data?.map(app => ({
        ...app,
        applicant: Array.isArray(app.applicants) ? app.applicants[0] : app.applicants || {
          first_name: '',
          last_name: '',
          phone: null
        }
      })) || [];

      // Filter based on technical report status
      const filteredApplications = processedApplications.filter(app => {
        const hasReport = app.technical_reports && app.technical_reports.length > 0;
        
        if (filter === 'PENDING') {
          return hasReport && !app.technical_reports?.[0]?.approved_at;
        } else if (filter === 'APPROVED') {
          return hasReport && app.technical_reports?.[0]?.approved_at;
        }
        return true;
      });

      setApplications(filteredApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications for review');
    } finally {
      setLoading(false);
    }
  };

  const approveReport = async (applicationId: string, reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Approve the technical report
      const { error: reportError } = await supabase
        .from('technical_reports')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      // Transition application state
      const { error: stateError } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition',
          application_id: applicationId,
          target_state: 'TECHNICAL_REVIEW'
        }
      });

      if (stateError) throw stateError;

      toast.success('Technical report approved successfully');
      fetchApplicationsForReview();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Failed to approve technical report');
    }
  };

  const getUrgencyBadge = (level: number | null) => {
    if (!level) return <span className="badge bg-secondary">Unknown</span>;
    
    const badges = {
      1: 'badge bg-danger',
      2: 'badge bg-warning',
      3: 'badge bg-info',
      4: 'badge bg-success',
      5: 'badge bg-light text-dark'
    };
    const labels = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Minimal'
    };
    
    return (
      <span className={badges[level as keyof typeof badges] || badges[3]}>
        {labels[level as keyof typeof labels] || 'Medium'}
      </span>
    );
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['admin', 'it', 'staff', 'control']}>
        <div className="d-flex justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['admin', 'it', 'staff', 'control']}>
      <div className="container-fluid">
        <PageTitle title="Technical Review" subName="Reviews" />

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">Technical Reports Review</h5>
                    <p className="card-text mb-0">Review and approve technical assessments from control visits</p>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="form-select"
                      style={{ width: 'auto' }}
                    >
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="ALL">All Reports</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Application</th>
                        <th>Applicant</th>
                        <th>Property</th>
                        <th>Urgency</th>
                        <th>Report Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            <div className="text-muted">
                              <i className="bx bx-search-alt me-2"></i>
                              No applications found for {filter.toLowerCase()} review
                            </div>
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => {
                          const report = app.technical_reports?.[0];
                          return (
                            <tr key={app.id}>
                              <td>
                                <strong>{app.application_number}</strong>
                                <br />
                                <small className="text-muted">{app.service_type}</small>
                              </td>
                              <td>
                                <div>
                                  <strong>{app.applicant.first_name} {app.applicant.last_name}</strong>
                                  <br />
                                  <small className="text-muted">{app.applicant.phone}</small>
                                </div>
                              </td>
                              <td>
                                <small>{app.property_address || 'Not specified'}</small>
                              </td>
                              <td>{getUrgencyBadge(report?.urgency_level || null)}</td>
                              <td>
                                {report?.approved_at ? (
                                  <span className="badge bg-success">Approved</span>
                                ) : (
                                  <span className="badge bg-warning">Pending</span>
                                )}
                              </td>
                              <td>
                                {report?.submitted_at ? (
                                  <div>
                                    {new Date(report.submitted_at).toLocaleDateString()}
                                    <br />
                                    <small>{new Date(report.submitted_at).toLocaleTimeString()}</small>
                                  </div>
                                ) : (
                                  <small className="text-muted">Not submitted</small>
                                )}
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => window.open(`/control/visit/${app.control_visits?.[0]?.id}/view`, '_blank')}
                                  >
                                    <i className="bx bx-show me-1"></i>
                                    View Report
                                  </button>
                                  
                                  {report && !report.approved_at && (
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => approveReport(app.id, report.id)}
                                    >
                                      <i className="bx bx-check me-1"></i>
                                      Approve
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default TechnicalReviewPage;