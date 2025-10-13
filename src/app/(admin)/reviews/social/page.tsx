import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { StaffGuard } from '@/components/auth/RoleGuards';
import { useNavigate } from 'react-router-dom';
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
  social_reports?: {
    id: string;
    social_conclusion: string | null;
    social_priority_level: number | null;
    vulnerability_score: number | null;
    submitted_at: string | null;
    approved_at: string | null;
  }[];
}

const SocialReviewPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const navigate = useNavigate();

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
          social_reports (
            id,
            social_conclusion,
            social_priority_level,
            vulnerability_score,
            submitted_at,
            approved_at
          )
        `)
        .in('current_state', ['TECHNICAL_REVIEW', 'SOCIAL_REVIEW', 'DIRECTOR_REVIEW'])
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

      // Filter based on social report needs
      const filteredApplications = processedApplications.filter(app => {
        if (filter === 'NEEDS_ASSESSMENT') {
          return !app.social_reports || app.social_reports.length === 0;
        } else if (filter === 'PENDING') {
          const hasReport = app.social_reports && app.social_reports.length > 0;
          return hasReport && !app.social_reports?.[0]?.approved_at;
        } else if (filter === 'APPROVED') {
          const hasReport = app.social_reports && app.social_reports.length > 0;
          return hasReport && app.social_reports?.[0]?.approved_at;
        }
        return true;
      });

      setApplications(filteredApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications for social review');
    } finally {
      setLoading(false);
    }
  };

  const approveReport = async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Approve the social report
      const { error: reportError } = await supabase
        .from('social_reports')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      toast.success('Social report approved successfully');
      fetchApplicationsForReview();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Failed to approve social report');
    }
  };

  const getPriorityBadge = (level: number | null) => {
    if (!level) return <span className="badge bg-secondary">Unknown</span>;
    
    const badges = {
      1: 'badge bg-danger',
      2: 'badge bg-warning',
      3: 'badge bg-info',
      4: 'badge bg-success',
      5: 'badge bg-light text-dark'
    };
    const labels = {
      1: 'Urgent',
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

  const getVulnerabilityBadge = (score: number | null) => {
    if (!score) return <span className="badge bg-secondary">Unknown</span>;
    
    if (score <= 3) return <span className="badge bg-success">Low ({score})</span>;
    if (score <= 6) return <span className="badge bg-warning">Medium ({score})</span>;
    return <span className="badge bg-danger">High ({score})</span>;
  };

  if (loading) {
    return (
      <StaffGuard>
        <div className="d-flex justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </StaffGuard>
    );
  }

  return (
    <StaffGuard>
      <div className="container-fluid">
        <PageTitle title="Social Review" subName="Reviews" />

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">Social Assessments Review</h5>
                    <p className="card-text mb-0">Manage social assessments and household evaluations</p>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="form-select"
                      style={{ width: 'auto' }}
                    >
                      <option value="NEEDS_ASSESSMENT">Needs Assessment</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="ALL">All Applications</option>
                    </select>

                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/reviews/social/assessment')}
                    >
                      <i className="bx bx-plus me-2"></i>
                      New Assessment
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Application</th>
                        <th>Applicant</th>
                        <th>Property</th>
                        <th>Social Priority</th>
                        <th>Vulnerability</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            <div className="text-muted">
                              <i className="bx bx-search-alt me-2"></i>
                              No applications found for {filter.toLowerCase().replace('_', ' ')} review
                            </div>
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => {
                          const report = app.social_reports?.[0];
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
                              <td>{getPriorityBadge(report?.social_priority_level || null)}</td>
                              <td>{getVulnerabilityBadge(report?.vulnerability_score || null)}</td>
                              <td>
                                {!report ? (
                                  <span className="badge bg-secondary">No Assessment</span>
                                ) : report.approved_at ? (
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
                                  {!report ? (
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() => navigate(`/reviews/social/assessment?applicationId=${app.id}`)}
                                    >
                                      <i className="bx bx-plus me-1"></i>
                                      Create Assessment
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/reviews/social/assessment?applicationId=${app.id}`)}
                                      >
                                        <i className="bx bx-edit me-1"></i>
                                        Edit
                                      </button>
                                      
                                      {!report.approved_at && (
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() => approveReport(report.id)}
                                        >
                                          <i className="bx bx-check me-1"></i>
                                          Approve
                                        </button>
                                      )}
                                    </>
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
    </StaffGuard>
  );
};

export default SocialReviewPage;