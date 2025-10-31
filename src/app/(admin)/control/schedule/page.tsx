import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { ControlGuard } from '@/components/auth/RoleGuards';
import CustomFlatpickr from '@/components/CustomFlatpickr';
import PageTitle from '@/components/PageTitle';

const scheduleSchema = z.object({
  scheduled_date: z.date({
    message: 'Visit date is required'
  }),
  visit_type: z.string().min(1, 'Visit type is required'),
  location_notes: z.string().optional(),
  weather_conditions: z.string().optional()
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const ScheduleVisitPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      visit_type: 'TECHNICAL_INSPECTION'
    }
  });

  const scheduledDate = watch('scheduled_date');

  useEffect(() => {
    if (!applicationId) {
      toast.error('No application selected. Please select an application from the queue.');
      navigate('/control/queue');
      return;
    }
    
    fetchApplication();
  }, [applicationId, navigate]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          property_address,
          applicants!inner (
            first_name,
            last_name,
            address,
            phone
          )
        `)
        .eq('id', applicationId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Application not found');
      }
      
      setApplication({
        ...data,
        applicant: Array.isArray(data.applicants) ? data.applicants[0] : data.applicants || {
          first_name: '',
          last_name: '',
          address: null,
          phone: null
        }
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
      navigate('/control/queue');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create control visit
      const { error: visitError } = await supabase
        .from('control_visits')
        .insert({
          application_id: applicationId,
          scheduled_date: data.scheduled_date.toISOString(),
          visit_type: data.visit_type,
          location_notes: data.location_notes,
          assigned_inspector: user.id,
          visit_status: 'SCHEDULED'
        });

      if (visitError) throw visitError;

      // Update application state
      const { error: stateError } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition',
          application_id: applicationId,
          target_state: 'CONTROL_VISIT_SCHEDULED',
          assigned_to: user.id
        }
      });

      if (stateError) throw stateError;

      toast.success('Control visit scheduled successfully');
      navigate('/control/visits');
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Failed to schedule visit');
    } finally {
      setSubmitting(false);
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

  return (
    <ControlGuard>
      <div className="container-fluid">
        <PageTitle title="Schedule Control Visit" subName="Control" />

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-8">
                    <h5 className="card-title">Visit Details</h5>
                    
                    {application && (
                      <div className="alert alert-info mb-4">
                        <strong>Application:</strong> {application.application_number}
                        <br />
                        <strong>Applicant:</strong> {application.applicant.first_name} {application.applicant.last_name}
                        <br />
                        <strong>Property:</strong> {application.property_address || 'Not specified'}
                        <br />
                        <strong>Contact:</strong> {application.applicant.phone}
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Visit Date & Time *</label>
                            <CustomFlatpickr
                              value={scheduledDate}
                              onChange={(dates: Date[]) => setValue('scheduled_date', dates[0])}
                              options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                                minDate: 'today',
                                time_24hr: true
                              }}
                              className="form-control"
                              placeholder="Select date and time"
                            />
                            {errors.scheduled_date && (
                              <div className="text-danger mt-1">{errors.scheduled_date.message}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Visit Type *</label>
                            <select
                              {...register('visit_type')}
                              className="form-select"
                            >
                              <option value="TECHNICAL_INSPECTION">Technical Inspection</option>
                              <option value="SOCIAL_ASSESSMENT">Social Assessment</option>
                              <option value="COMBINED_VISIT">Combined Visit</option>
                              <option value="FOLLOW_UP">Follow-up Visit</option>
                            </select>
                            {errors.visit_type && (
                              <div className="text-danger mt-1">{errors.visit_type.message}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Location Notes</label>
                        <textarea
                          {...register('location_notes')}
                          className="form-control"
                          rows={3}
                          placeholder="Any specific notes about the location, access, or special instructions..."
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Weather Conditions</label>
                        <select
                          {...register('weather_conditions')}
                          className="form-select"
                        >
                          <option value="">Select weather conditions</option>
                          <option value="SUNNY">Sunny</option>
                          <option value="CLOUDY">Cloudy</option>
                          <option value="RAINY">Rainy</option>
                          <option value="STORMY">Stormy</option>
                        </select>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-calendar-plus me-2"></i>
                              Schedule Visit
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => navigate('/control/queue')}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="col-lg-4">
                    <div className="card border">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Visit Guidelines</h6>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="bx bx-check text-success me-2"></i>
                            Bring inspection checklist
                          </li>
                          <li className="mb-2">
                            <i className="bx bx-check text-success me-2"></i>
                            Take photos of all defects
                          </li>
                          <li className="mb-2">
                            <i className="bx bx-check text-success me-2"></i>
                            Verify applicant identity
                          </li>
                          <li className="mb-2">
                            <i className="bx bx-check text-success me-2"></i>
                            Check property ownership
                          </li>
                          <li className="mb-2">
                            <i className="bx bx-check text-success me-2"></i>
                            Complete technical assessment
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlGuard>
  );
};

export default ScheduleVisitPage;