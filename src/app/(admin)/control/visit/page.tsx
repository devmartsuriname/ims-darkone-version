import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { ControlGuard } from '@/components/auth/RoleGuards';
import { PhotoCaptureSystem } from './components/PhotoCaptureSystem';
import { TechnicalAssessmentForm } from './components/TechnicalAssessmentForm';
import PageTitle from '@/components/PageTitle';

interface ControlVisit {
  id: string;
  scheduled_date: string | null;
  visit_type: string | null;
  visit_status: string | null;
  location_notes?: string | null;
  application: {
    id: string;
    application_number: string;
    property_address: string | null;
    applicant: {
      first_name: string;
      last_name: string;
      phone: string | null;
      address: string | null;
    };
  };
}

const ControlVisitPage = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<ControlVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);

  useEffect(() => {
    if (visitId) {
      fetchVisit();
      markVisitAsStarted();
    }
  }, [visitId]);

  const fetchVisit = async () => {
    try {
      const { data, error } = await supabase
        .from('control_visits')
        .select(`
          id,
          scheduled_date,
          visit_type,
          visit_status,
          location_notes,
          access_granted,
          applications!inner (
            id,
            application_number,
            property_address,
            applicants!inner (
              first_name,
              last_name,
              phone,
              address
            )
          )
        `)
        .eq('id', visitId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Visit not found');
      }

      setVisit({
        ...data,
        application: {
          ...data.applications,
          applicant: Array.isArray(data.applications.applicants) ? 
            data.applications.applicants[0] : 
            data.applications.applicants || {
              first_name: '',
              last_name: '',
              phone: null,
              address: null
            }
        }
      });
      
      setAccessGranted(data.access_granted);
    } catch (error) {
      console.error('Error fetching visit:', error);
      toast.error('Failed to load visit details');
      navigate('/control/visits');
    } finally {
      setLoading(false);
    }
  };

  const markVisitAsStarted = async () => {
    try {
      const { error } = await supabase
        .from('control_visits')
        .update({
          visit_status: 'IN_PROGRESS',
          actual_date: new Date().toISOString()
        })
        .eq('id', visitId!);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const updateAccessGranted = async (granted: boolean) => {
    try {
      const { error } = await supabase
        .from('control_visits')
        .update({ access_granted: granted })
        .eq('id', visitId!);

      if (error) throw error;
      
      setAccessGranted(granted);
      toast.success(`Access ${granted ? 'granted' : 'denied'} recorded`);
    } catch (error) {
      console.error('Error updating access status:', error);
      toast.error('Failed to update access status');
    }
  };

  const completeVisit = async () => {
    try {
      // Check if minimum requirements are met
      const { data: photos } = await supabase
        .from('control_photos')
        .select('id')
        .eq('control_visit_id', visitId!);

      if (!photos || photos.length < 5) {
        toast.error('At least 5 photos are required to complete the visit');
        return;
      }

      // Update visit status
      const { error } = await supabase
        .from('control_visits')
        .update({ visit_status: 'COMPLETED' })
        .eq('id', visitId!);

      if (error) throw error;

      // Transition application state
      const { error: workflowError } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition_state',
          application_id: visit?.application.id,
          target_state: 'CONTROL_IN_PROGRESS'
        }
      });

      if (workflowError) throw workflowError;

      toast.success('Visit completed successfully');
      navigate('/control/visits');
    } catch (error) {
      console.error('Error completing visit:', error);
      toast.error('Failed to complete visit');
    }
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

  if (!visit) {
    return (
      <ControlGuard>
        <div className="alert alert-danger">Visit not found</div>
      </ControlGuard>
    );
  }

  return (
    <ControlGuard>
      <div className="container-fluid">
        <PageTitle title="Control Visit" subName="Control" />

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h5 className="card-title">Visit Information</h5>
                    <div className="row">
                      <div className="col-sm-6">
                        <p><strong>Application:</strong> {visit.application.application_number}</p>
                        <p><strong>Applicant:</strong> {visit.application.applicant.first_name} {visit.application.applicant.last_name}</p>
                        <p><strong>Phone:</strong> {visit.application.applicant.phone}</p>
                      </div>
                      <div className="col-sm-6">
                        <p><strong>Property:</strong> {visit.application.property_address}</p>
                        <p><strong>Visit Type:</strong> {visit.visit_type?.replace('_', ' ') || 'Unknown'}</p>
                        <p><strong>Scheduled:</strong> {visit.scheduled_date ? new Date(visit.scheduled_date).toLocaleString() : 'Not scheduled'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card border">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Property Access</h6>
                      </div>
                      <div className="card-body">
                        {accessGranted === null ? (
                          <div>
                            <p className="mb-3">Was access to the property granted?</p>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => updateAccessGranted(true)}
                              >
                                <i className="bx bx-check me-1"></i>
                                Yes
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => updateAccessGranted(false)}
                              >
                                <i className="bx bx-x me-1"></i>
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className={`mb-2 ${accessGranted ? 'text-success' : 'text-danger'}`}>
                              <i className={`bx ${accessGranted ? 'bx-check' : 'bx-x'} me-2`}></i>
                              Access {accessGranted ? 'Granted' : 'Denied'}
                            </p>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setAccessGranted(null)}
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {accessGranted && (
                  <>
                    <ul className="nav nav-tabs mb-4">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'photos' ? 'active' : ''}`}
                          onClick={() => setActiveTab('photos')}
                        >
                          <i className="bx bx-camera me-2"></i>
                          Photo Documentation
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'assessment' ? 'active' : ''}`}
                          onClick={() => setActiveTab('assessment')}
                        >
                          <i className="bx bx-clipboard me-2"></i>
                          Technical Assessment
                        </button>
                      </li>
                    </ul>

                    <div className="tab-content">
                      {activeTab === 'photos' && (
                        <PhotoCaptureSystem 
                          visitId={visit.id} 
                          applicationId={visit.application.id} 
                        />
                      )}
                      
                      {activeTab === 'assessment' && (
                        <TechnicalAssessmentForm 
                          visitId={visit.id} 
                          applicationId={visit.application.id} 
                        />
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-top">
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate('/control/visits')}
                        >
                          <i className="bx bx-arrow-back me-2"></i>
                          Back to Visits
                        </button>
                        
                        <button
                          className="btn btn-success"
                          onClick={completeVisit}
                        >
                          <i className="bx bx-check me-2"></i>
                          Complete Visit
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {accessGranted === false && (
                  <div className="alert alert-warning">
                    <h6>Access Denied</h6>
                    <p>Property access was not granted. Please document the reason and reschedule the visit if necessary.</p>
                    <button
                      className="btn btn-warning"
                      onClick={() => navigate('/control/visits')}
                    >
                      Return to Visits
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlGuard>
  );
};

export default ControlVisitPage;