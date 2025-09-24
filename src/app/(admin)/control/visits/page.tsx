import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { ControlGuard } from '@/components/auth/RoleGuards';

interface ControlVisit {
  id: string;
  scheduled_date: string | null;
  actual_date?: string | null;
  visit_type: string;
  visit_status: string;
  location_notes?: string | null;
  weather_conditions?: string | null;
  application: {
    application_number: string;
    property_address: string | null;
    applicant: {
      first_name: string;
      last_name: string;
      phone: string | null;
    };
  };
}

const ControlVisitsPage = () => {
  const [visits, setVisits] = useState<ControlVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisits();
  }, [filter]);

  const fetchVisits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('control_visits')
        .select(`
          id,
          scheduled_date,
          actual_date,
          visit_type,
          visit_status,
          location_notes,
          weather_conditions,
          applications!inner (
            application_number,
            property_address,
            applicants!inner (
              first_name,
              last_name,
              phone
            )
          )
        `)
        .eq('assigned_inspector', user.id)
        .order('scheduled_date', { ascending: true });

      if (filter !== 'ALL') {
        query = query.eq('visit_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVisits(data?.map(visit => ({
        ...visit,
        application: {
          ...visit.applications,
          applicant: visit.applications.applicants?.[0] || {
            first_name: '',
            last_name: '',
            phone: null
          }
        }
      })) || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const startVisit = (visitId: string) => {
    navigate(`/control/visit/${visitId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'SCHEDULED': 'badge bg-warning',
      'IN_PROGRESS': 'badge bg-info',
      'COMPLETED': 'badge bg-success',
      'CANCELLED': 'badge bg-danger',
      'RESCHEDULED': 'badge bg-secondary'
    };
    return (
      <span className={badges[status as keyof typeof badges] || 'badge bg-secondary'}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const isOverdue = (scheduledDate: string, status: string) => {
    return status === 'SCHEDULED' && new Date(scheduledDate) < new Date();
  };

  if (loading) {
    return (
      <ControlGuard>
        <div className="d-flex justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </ControlGuard>
    );
  }

  return (
    <ControlGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">My Control Visits</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Control</a></li>
                  <li className="breadcrumb-item active">My Visits</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Scheduled Visits</h5>
                  
                  <div className="d-flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="form-select"
                      style={{ width: 'auto' }}
                    >
                      <option value="ALL">All Visits</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/control/queue')}
                    >
                      <i className="bx bx-list-ul me-2"></i>
                      Back to Queue
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Application</th>
                        <th>Applicant</th>
                        <th>Property Address</th>
                        <th>Visit Type</th>
                        <th>Scheduled Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            <div className="text-muted">
                              <i className="bx bx-calendar me-2"></i>
                              No visits found for the selected filter
                            </div>
                          </td>
                        </tr>
                      ) : (
                        visits.map((visit) => (
                          <tr key={visit.id}>
                            <td>
                              <strong>{visit.application.application_number}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{visit.application.applicant.first_name} {visit.application.applicant.last_name}</strong>
                                <br />
                                <small className="text-muted">{visit.application.applicant.phone}</small>
                              </div>
                            </td>
                            <td>
                              <small>{visit.application.property_address || 'Not specified'}</small>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {visit.visit_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <div className={isOverdue(visit.scheduled_date, visit.visit_status) ? 'text-danger' : ''}>
                                {new Date(visit.scheduled_date).toLocaleDateString()}
                                <br />
                                <small>{new Date(visit.scheduled_date).toLocaleTimeString()}</small>
                                {isOverdue(visit.scheduled_date, visit.visit_status) && (
                                  <div><small><i className="bx bx-time"></i> Overdue</small></div>
                                )}
                              </div>
                            </td>
                            <td>{getStatusBadge(visit.visit_status)}</td>
                            <td>
                              {visit.visit_status === 'SCHEDULED' && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => startVisit(visit.id)}
                                >
                                  <i className="bx bx-play me-1"></i>
                                  Start Visit
                                </button>
                              )}
                              {visit.visit_status === 'IN_PROGRESS' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => startVisit(visit.id)}
                                >
                                  <i className="bx bx-edit me-1"></i>
                                  Continue
                                </button>
                              )}
                              {visit.visit_status === 'COMPLETED' && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/control/visit/${visit.id}/view`)}
                                >
                                  <i className="bx bx-show me-1"></i>
                                  View Report
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlGuard>
  );
};

export default ControlVisitsPage;