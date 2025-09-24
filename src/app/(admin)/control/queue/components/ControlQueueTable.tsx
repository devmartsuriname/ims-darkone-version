import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Application {
  id: string;
  application_number: string;
  current_state: string | null;
  created_at: string | null;
  sla_deadline: string | null;
  priority_level: number | null;
  applicant: {
    first_name: string;
    last_name: string;
    address: string | null;
    phone: string | null;
  };
  property_address: string | null;
  service_type: string | null;
}

export const ControlQueueTable = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueuedApplications();
  }, []);

  const fetchQueuedApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          current_state,
          created_at,
          sla_deadline,
          priority_level,
          property_address,
          service_type,
          applicants!inner (
            first_name,
            last_name,
            address,
            phone
          )
        `)
        .in('current_state', ['INTAKE_REVIEW', 'CONTROL_ASSIGN'])
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setApplications(data?.map(app => ({
        ...app,
        applicant: Array.isArray(app.applicants) ? app.applicants[0] : app.applicants || {
          first_name: '',
          last_name: '',
          address: null,
          phone: null
        }
      })) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const assignToSelf = async (applicationId: string) => {
    setAssigningTo(applicationId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition_state',
          application_id: applicationId,
          target_state: 'CONTROL_ASSIGN',
          assigned_to: user.id
        }
      });

      if (error) throw error;

      toast.success('Application assigned successfully');
      fetchQueuedApplications();
    } catch (error) {
      console.error('Error assigning application:', error);
      toast.error('Failed to assign application');
    } finally {
      setAssigningTo(null);
    }
  };

  const scheduleVisit = (applicationId: string) => {
    navigate(`/control/schedule/${applicationId}`);
  };

  const getPriorityBadge = (level: number) => {
    const badges = {
      1: 'badge bg-danger',
      2: 'badge bg-warning', 
      3: 'badge bg-info',
      4: 'badge bg-secondary',
      5: 'badge bg-light text-dark'
    };
    const labels = {
      1: 'Urgent',
      2: 'High',
      3: 'Normal', 
      4: 'Low',
      5: 'Lowest'
    };
    return (
      <span className={badges[level as keyof typeof badges] || badges[3]}>
        {labels[level as keyof typeof labels] || 'Normal'}
      </span>
    );
  };

  const getStateBadge = (state: string) => {
    const badges = {
      'INTAKE_REVIEW': 'badge bg-primary',
      'CONTROL_ASSIGN': 'badge bg-warning'
    };
    return (
      <span className={badges[state as keyof typeof badges] || 'badge bg-secondary'}>
        {state.replace('_', ' ')}
      </span>
    );
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Application #</th>
            <th>Applicant</th>
            <th>Property Address</th>
            <th>State</th>
            <th>Priority</th>
            <th>SLA Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                <div className="text-muted">
                  <i className="bx bx-search-alt me-2"></i>
                  No applications in control queue
                </div>
              </td>
            </tr>
          ) : (
            applications.map((app) => (
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
                <td>{getStateBadge(app.current_state || 'UNKNOWN')}</td>
                <td>{getPriorityBadge(app.priority_level || 3)}</td>
                <td>
                  <div className={app.sla_deadline && isOverdue(app.sla_deadline) ? 'text-danger' : ''}>
                    {app.sla_deadline ? new Date(app.sla_deadline).toLocaleDateString() : 'No deadline'}
                    {app.sla_deadline && isOverdue(app.sla_deadline) && (
                      <div><small><i className="bx bx-time"></i> Overdue</small></div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => assignToSelf(app.id)}
                      disabled={assigningTo === app.id}
                    >
                      {assigningTo === app.id ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="bx bx-user-plus me-1"></i>
                      )}
                      Assign to Me
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => scheduleVisit(app.id)}
                    >
                      <i className="bx bx-calendar me-1"></i>
                      Schedule Visit
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};