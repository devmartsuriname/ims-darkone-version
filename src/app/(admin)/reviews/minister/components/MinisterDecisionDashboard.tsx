import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface Application {
  id: string;
  application_number: string;
  current_state: string | null;
  requested_amount: number | null;
  approved_amount?: number | null;
  property_address: string | null;
  submitted_at: string | null;
  priority_level: number | null;
  applicant: {
    first_name: string;
    last_name: string;
    phone: string | null;
    email?: string | null;
  } | null;
  application_steps: Array<{
    id: string;
    step_name: string;
    status: string | null;
    notes: string | null;
    completed_at: string | null;
  }>;
}

interface DecisionModalProps {
  application: Application | null;
  onClose: () => void;
  onDecision: (applicationId: string, decision: string, notes: string, finalAmount?: number) => void;
}

const DecisionModal: React.FC<DecisionModalProps> = ({ application, onClose, onDecision }) => {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setFinalAmount(application.approved_amount || application.requested_amount || 0);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !notes.trim()) {
      toast.error('Please provide decision and notes');
      return;
    }

    setIsSubmitting(true);
    try {
      await onDecision(application!.id, decision, notes, finalAmount);
      onClose();
      toast.success('Ministerial decision recorded successfully');
    } catch (error) {
      toast.error('Failed to record decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  const directorRecommendation = application.application_steps
    .filter(step => step.step_name === 'DIRECTOR_REVIEW' && step.status === 'COMPLETED')
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return dateB - dateA;
    })[0];

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ministerial Decision - {application.application_number}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Application Summary */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Application Details</h6>
                      <p><strong>Applicant:</strong> {application.applicant?.first_name} {application.applicant?.last_name}</p>
                      <p><strong>Property:</strong> {application.property_address}</p>
                      <p><strong>Requested Amount:</strong> SRD {application.requested_amount?.toLocaleString() || '0'}</p>
                      <p><strong>Priority Level:</strong> {application.priority_level}</p>
                      <p><strong>Submitted:</strong> {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Director Recommendation</h6>
                      {directorRecommendation ? (
                        <>
                          <p><strong>Date:</strong> {directorRecommendation.completed_at ? new Date(directorRecommendation.completed_at).toLocaleDateString() : '-'}</p>
                          <p><strong>Recommended Amount:</strong> SRD {application.approved_amount?.toLocaleString() || '0'}</p>
                          <div className="bg-light p-3 rounded">
                            <strong>Director Notes:</strong>
                            <p className="mb-0 mt-1">{directorRecommendation.notes}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted">No director recommendation found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application History */}
              <div className="mb-4">
                <h6>Application Progress History</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th>Status</th>
                        <th>Completed</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.application_steps
                        .sort((a, b) => new Date(a.completed_at || '').getTime() - new Date(b.completed_at || '').getTime())
                        .map((step) => (
                        <tr key={step.id}>
                          <td>
                            <span className="badge bg-secondary">{step.step_name.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <span className={`badge ${step.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
                              {step.status}
                            </span>
                          </td>
                          <td>
                            {step.completed_at ? new Date(step.completed_at).toLocaleDateString() : '-'}
                          </td>
                          <td>
                            {step.notes ? (
                              <small className="text-truncate d-block" style={{ maxWidth: '300px' }}>
                                {step.notes}
                              </small>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Minister Decision Form */}
              <div className="bg-primary bg-opacity-10 p-4 rounded">
                <h6 className="text-primary">Ministerial Decision</h6>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Final Decision *</label>
                    <select 
                      className="form-select" 
                      value={decision} 
                      onChange={(e) => setDecision(e.target.value)}
                      required
                    >
                      <option value="">Select final decision...</option>
                      <option value="APPROVED">Approve Application</option>
                      <option value="REJECTED">Reject Application</option>
                      <option value="CONDITIONAL_APPROVAL">Conditional Approval</option>
                      <option value="DEFERRED">Defer for Additional Review</option>
                    </select>
                  </div>

                  {(decision === 'APPROVED' || decision === 'CONDITIONAL_APPROVAL') && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Final Approved Amount (SRD)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={finalAmount}
                        onChange={(e) => setFinalAmount(Number(e.target.value))}
                        min="0"
                        step="100"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Ministerial Notes & Justification *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide detailed reasoning for your decision, including any conditions or next steps..."
                    required
                  />
                </div>

                {decision === 'CONDITIONAL_APPROVAL' && (
                  <div className="alert alert-info">
                    <strong>Note:</strong> For conditional approvals, ensure you specify all conditions and requirements in the notes above.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Recording Decision...' : 'Record Final Decision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MinisterDecisionDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('applications')
        .select(`
          id,
          application_number,
          current_state,
          requested_amount,
          approved_amount,
          property_address,
          submitted_at,
          priority_level,
          completed_at,
          applicants:applicant_id (
            first_name,
            last_name,
            phone,
            email
          ),
          application_steps (
            id,
            step_name,
            status,
            notes,
            completed_at
          )
        `)
        .order('priority_level', { ascending: false })
        .order('submitted_at', { ascending: true });

      if (filter === 'PENDING') {
        query = query.eq('current_state', 'MINISTER_DECISION');
      } else if (filter === 'COMPLETED') {
        query = query.in('current_state', ['CLOSURE', 'REJECTED']);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setApplications(data?.map(app => ({
        ...app,
        applicant: Array.isArray(app.applicants) ? app.applicants[0] : app.applicants
      })) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (applicationId: string, decision: string, notes: string, finalAmount?: number) => {
    try {
      // Update application with final decision
      const newState = decision === 'APPROVED' || decision === 'CONDITIONAL_APPROVAL' ? 'CLOSURE' : 'REJECTED';
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          current_state: newState,
          approved_amount: finalAmount,
          completed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create final application step record
      const { error: stepError } = await supabase
        .from('application_steps')
        .insert({
          application_id: applicationId,
          step_name: 'MINISTER_DECISION',
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          notes: `Ministerial Decision: ${decision}\n\nNotes: ${notes}${finalAmount ? `\n\nFinal Approved Amount: SRD ${finalAmount.toLocaleString()}` : ''}`
        });

      if (stepError) throw stepError;

      // Send notification (placeholder for future notification system)
      console.log('Decision notification should be sent to:', {
        applicationId,
        decision,
        finalAmount,
        notes
      });

      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error('Error recording decision:', error);
      throw error;
    }
  };

  const getPriorityBadge = (level: number) => {
    if (level >= 5) return <span className="badge bg-danger">Urgent</span>;
    if (level >= 4) return <span className="badge bg-warning">High</span>;
    if (level >= 3) return <span className="badge bg-info">Medium</span>;
    return <span className="badge bg-secondary">Low</span>;
  };

  const getStateBadge = (state: string) => {
    const stateMap: Record<string, { class: string; text: string }> = {
      'MINISTER_DECISION': { class: 'bg-warning', text: 'Awaiting Decision' },
      'CLOSURE': { class: 'bg-success', text: 'Approved' },
      'REJECTED': { class: 'bg-danger', text: 'Rejected' }
    };
    
    const stateInfo = stateMap[state] || { class: 'bg-secondary', text: state };
    return <span className={`badge ${stateInfo.class}`}>{stateInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Ministerial Decision Dashboard</h4>
            <div className="d-flex gap-2">
              <select 
                className="form-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="PENDING">Pending Decisions</option>
                <option value="COMPLETED">Completed Decisions</option>
                <option value="ALL">All Applications</option>
              </select>
              <button className="btn btn-outline-primary" onClick={fetchApplications}>
                <i className="bx bx-refresh"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {filter === 'PENDING' && applications.length === 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success">
              <i className="bx bx-check-circle me-2"></i>
              <strong>All caught up!</strong> No applications are currently awaiting ministerial decision.
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {applications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bx bx-file-blank display-4 text-muted"></i>
                  <h5 className="mt-3">No Applications Found</h5>
                  <p className="text-muted">
                    {filter === 'PENDING' 
                      ? 'No applications are currently awaiting ministerial decision.'
                      : 'No applications match the selected filter criteria.'
                    }
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Application #</th>
                        <th>Applicant</th>
                        <th>Property Address</th>
                        <th>Requested Amount</th>
                        <th>Director Amount</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td>
                            <strong>{application.application_number}</strong>
                          </td>
                          <td>
                            {application.applicant?.first_name} {application.applicant?.last_name}
                            {application.applicant?.phone && (
                              <small className="d-block text-muted">{application.applicant.phone}</small>
                            )}
                          </td>
                          <td>{application.property_address}</td>
                          <td>SRD {application.requested_amount?.toLocaleString() || '0'}</td>
                          <td>
                            {application.approved_amount 
                              ? `SRD ${application.approved_amount.toLocaleString()}`
                              : '-'
                            }
                          </td>
                          <td>{getPriorityBadge(application.priority_level || 1)}</td>
                          <td>{getStateBadge(application.current_state || 'UNKNOWN')}</td>
                          <td>{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : '-'}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedApplication(application)}
                              disabled={application.current_state !== 'MINISTER_DECISION'}
                            >
                              <i className="bx bx-edit"></i> 
                              {application.current_state === 'MINISTER_DECISION' ? 'Decide' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DecisionModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onDecision={handleDecision}
      />
    </>
  );
};

export default MinisterDecisionDashboard;