import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface Application {
  id: string;
  application_number: string;
  current_state: string | null;
  requested_amount: number | null;
  property_address: string | null;
  submitted_at: string | null;
  priority_level: number | null;
  applicant: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
  technical_reports: Array<{
    id: string;
    technical_conclusion: string | null;
    urgency_level: number | null;
    estimated_cost: number | null;
    recommendations: string | null;
  }>;
  social_reports: Array<{
    id: string;
    social_conclusion: string | null;
    social_priority_level: number | null;
    vulnerability_score: number | null;
    recommendations: string | null;
  }>;
}

interface DecisionModalProps {
  application: Application | null;
  onClose: () => void;
  onDecision: (applicationId: string, decision: string, notes: string, recommendedAmount?: number) => void;
}

const DecisionModal: React.FC<DecisionModalProps> = ({ application, onClose, onDecision }) => {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendedAmount, setRecommendedAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setRecommendedAmount(application.requested_amount || 0);
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
      await onDecision(application!.id, decision, notes, recommendedAmount);
      onClose();
      toast.success('Director recommendation submitted successfully');
    } catch (error) {
      toast.error('Failed to submit recommendation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Director Recommendation - {application.application_number}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Applicant:</strong> {application.applicant?.first_name} {application.applicant?.last_name}
                </div>
                <div className="col-md-6">
                  <strong>Property:</strong> {application.property_address}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Requested Amount:</strong> SRD {application.requested_amount?.toLocaleString()}
                </div>
                <div className="col-md-6">
                  <strong>Priority Level:</strong> {application.priority_level}
                </div>
              </div>

              {application.technical_reports.length > 0 && (
                <div className="mb-3">
                  <h6>Technical Assessment Summary</h6>
                  {application.technical_reports.map((report) => (
                    <div key={report.id} className="card card-body mb-2">
                      <p><strong>Conclusion:</strong> {report.technical_conclusion}</p>
                      <p><strong>Estimated Cost:</strong> SRD {report.estimated_cost?.toLocaleString()}</p>
                      <p><strong>Urgency Level:</strong> {report.urgency_level}</p>
                      <p><strong>Recommendations:</strong> {report.recommendations}</p>
                    </div>
                  ))}
                </div>
              )}

              {application.social_reports.length > 0 && (
                <div className="mb-3">
                  <h6>Social Assessment Summary</h6>
                  {application.social_reports.map((report) => (
                    <div key={report.id} className="card card-body mb-2">
                      <p><strong>Conclusion:</strong> {report.social_conclusion}</p>
                      <p><strong>Priority Level:</strong> {report.social_priority_level}</p>
                      <p><strong>Vulnerability Score:</strong> {report.vulnerability_score}</p>
                      <p><strong>Recommendations:</strong> {report.recommendations}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Director Recommendation *</label>
                <select 
                  className="form-select" 
                  value={decision} 
                  onChange={(e) => setDecision(e.target.value)}
                  required
                >
                  <option value="">Select recommendation...</option>
                  <option value="RECOMMEND_APPROVE">Recommend for Approval</option>
                  <option value="RECOMMEND_REJECT">Recommend for Rejection</option>
                  <option value="REQUEST_MORE_INFO">Request Additional Information</option>
                  <option value="DEFER">Defer Decision</option>
                </select>
              </div>

              {(decision === 'RECOMMEND_APPROVE' || decision === 'REQUEST_MORE_INFO') && (
                <div className="mb-3">
                  <label className="form-label">Recommended Amount (SRD)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={recommendedAmount}
                    onChange={(e) => setRecommendedAmount(Number(e.target.value))}
                    min="0"
                    step="100"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Director Notes & Justification *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide detailed reasoning for your recommendation..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Recommendation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DirectorReviewDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [filter, setFilter] = useState('ALL');

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
          property_address,
          submitted_at,
          priority_level,
          applicants:applicant_id (
            first_name,
            last_name,
            phone
          ),
          technical_reports (
            id,
            technical_conclusion,
            urgency_level,
            estimated_cost,
            recommendations
          ),
          social_reports (
            id,
            social_conclusion,
            social_priority_level,
            vulnerability_score,
            recommendations
          )
        `)
        .in('current_state', ['DIRECTOR_REVIEW', 'TECHNICAL_REVIEW', 'SOCIAL_REVIEW'])
        .order('priority_level', { ascending: false })
        .order('submitted_at', { ascending: true });

      if (filter === 'HIGH_PRIORITY') {
        query = query.gte('priority_level', 4);
      } else if (filter === 'URGENT') {
        query = query.gte('priority_level', 5);
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

  const handleDecision = async (applicationId: string, decision: string, notes: string, recommendedAmount?: number) => {
    try {
      // Update application state
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          current_state: decision === 'RECOMMEND_APPROVE' ? 'MINISTER_DECISION' : 'DIRECTOR_REVIEW',
          approved_amount: recommendedAmount
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create application step record
      const { error: stepError } = await supabase
        .from('application_steps')
        .insert({
          application_id: applicationId,
          step_name: 'DIRECTOR_REVIEW',
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          notes: `Director Recommendation: ${decision}\n\nNotes: ${notes}${recommendedAmount ? `\n\nRecommended Amount: SRD ${recommendedAmount.toLocaleString()}` : ''}`
        });

      if (stepError) throw stepError;

      // Create next step if approved
      if (decision === 'RECOMMEND_APPROVE') {
        const { error: nextStepError } = await supabase
          .from('application_steps')
          .insert({
            application_id: applicationId,
            step_name: 'MINISTER_DECISION',
            status: 'PENDING',
            started_at: new Date().toISOString()
          });

        if (nextStepError) throw nextStepError;
      }

      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error('Error submitting decision:', error);
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
      'TECHNICAL_REVIEW': { class: 'bg-primary', text: 'Technical Review' },
      'SOCIAL_REVIEW': { class: 'bg-info', text: 'Social Review' },
      'DIRECTOR_REVIEW': { class: 'bg-warning', text: 'Awaiting Director' }
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
            <h4 className="mb-0">Applications Awaiting Director Review</h4>
            <div className="d-flex gap-2">
              <select 
                className="form-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="ALL">All Applications</option>
                <option value="HIGH_PRIORITY">High Priority</option>
                <option value="URGENT">Urgent Only</option>
              </select>
              <button className="btn btn-outline-primary" onClick={fetchApplications}>
                <i className="bx bx-refresh"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {applications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bx bx-check-circle display-4 text-success"></i>
                  <h5 className="mt-3">No Applications Pending</h5>
                  <p className="text-muted">All applications have been reviewed or no applications are ready for director review.</p>
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
                        <th>Priority</th>
                        <th>Current State</th>
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
                          <td>{getPriorityBadge(application.priority_level || 1)}</td>
                          <td>{getStateBadge(application.current_state || 'UNKNOWN')}</td>
                          <td>{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : '-'}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <i className="bx bx-edit"></i> Review
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

export default DirectorReviewDashboard;