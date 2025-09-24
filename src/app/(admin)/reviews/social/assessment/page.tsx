import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { StaffGuard } from '@/components/auth/RoleGuards';

const socialAssessmentSchema = z.object({
  household_situation: z.string().min(1, 'Household situation assessment is required'),
  living_conditions_assessment: z.string().min(1, 'Living conditions assessment is required'),
  health_conditions: z.string().optional(),
  special_needs: z.string().optional(),
  support_network: z.string().optional(),
  community_integration: z.string().optional(),
  income_verification: z.string().min(1, 'Income verification is required'),
  vulnerability_score: z.number().min(1).max(10),
  social_priority_level: z.number().min(1).max(5),
  social_conclusion: z.string().min(1, 'Social conclusion is required'),
  recommendations: z.string().min(1, 'Recommendations are required')
});

type SocialAssessmentFormData = z.infer<typeof socialAssessmentSchema>;

const SocialAssessmentPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SocialAssessmentFormData>({
    resolver: zodResolver(socialAssessmentSchema),
    defaultValues: {
      vulnerability_score: 5,
      social_priority_level: 3
    }
  });

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
      fetchExistingReport();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          property_address,
          service_type,
          applicants!inner (
            first_name,
            last_name,
            phone,
            address,
            household_size,
            children_count,
            monthly_income,
            spouse_income
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
        applicant: Array.isArray(data.applicants) ? data.applicants[0] : data.applicants
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
      navigate('/reviews/social');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReport = async () => {
    try {
      const { data, error } = await supabase
        .from('social_reports')
        .select('*')
        .eq('application_id', applicationId!)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setExistingReport(data);
        // Populate form with existing data
        const fieldsToMap = [
          'household_situation', 'living_conditions_assessment', 'health_conditions',
          'special_needs', 'support_network', 'community_integration', 'income_verification',
          'vulnerability_score', 'social_priority_level', 'social_conclusion', 'recommendations'
        ];
        
        fieldsToMap.forEach((field) => {
          if (data[field as keyof typeof data] !== null && data[field as keyof typeof data] !== undefined) {
            setValue(field as keyof SocialAssessmentFormData, data[field as keyof typeof data] as any);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching existing report:', error);
    }
  };

  const onSubmit = async (data: SocialAssessmentFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const reportData = {
        ...data,
        application_id: applicationId!,
        social_worker_id: user.id,
        submitted_at: new Date().toISOString()
      };

      let error;

      if (existingReport) {
        // Update existing report
        const result = await supabase
          .from('social_reports')
          .update(reportData)
          .eq('id', existingReport.id);
        error = result.error;
      } else {
        // Create new report
        const result = await supabase
          .from('social_reports')
          .insert(reportData);
        error = result.error;
      }

      if (error) throw error;

      toast.success('Social assessment saved successfully');
      
      // Transition application state if this is a new report
      if (!existingReport) {
        await supabase.functions.invoke('workflow-service', {
          body: {
            action: 'transition_state',
            application_id: applicationId,
            target_state: 'SOCIAL_REVIEW'
          }
        });
      }

      navigate('/reviews/social');
    } catch (error) {
      console.error('Error saving social assessment:', error);
      toast.error('Failed to save social assessment');
    } finally {
      setSubmitting(false);
    }
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
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Social Assessment</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">IMS</a></li>
                  <li className="breadcrumb-item"><a href="#">Reviews</a></li>
                  <li className="breadcrumb-item active">Social Assessment</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-8">
                    <h5 className="card-title">Social Assessment Form</h5>
                    
                    {application && (
                      <div className="alert alert-info mb-4">
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Application:</strong> {application.application_number}<br />
                            <strong>Applicant:</strong> {application.applicant.first_name} {application.applicant.last_name}<br />
                            <strong>Phone:</strong> {application.applicant.phone}
                          </div>
                          <div className="col-md-6">
                            <strong>Property:</strong> {application.property_address}<br />
                            <strong>Household Size:</strong> {application.applicant.household_size}<br />
                            <strong>Children:</strong> {application.applicant.children_count}
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label className="form-label">Household Situation Assessment *</label>
                          <textarea
                            {...register('household_situation')}
                            className="form-control"
                            rows={4}
                            placeholder="Describe the current household situation, family dynamics, living arrangements..."
                          />
                          {errors.household_situation && (
                            <div className="text-danger mt-1">{errors.household_situation.message}</div>
                          )}
                        </div>

                        <div className="col-12 mb-3">
                          <label className="form-label">Living Conditions Assessment *</label>
                          <textarea
                            {...register('living_conditions_assessment')}
                            className="form-control"
                            rows={4}
                            placeholder="Assess current living conditions, space adequacy, privacy, safety..."
                          />
                          {errors.living_conditions_assessment && (
                            <div className="text-danger mt-1">{errors.living_conditions_assessment.message}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Health Conditions</label>
                          <textarea
                            {...register('health_conditions')}
                            className="form-control"
                            rows={3}
                            placeholder="Any health issues affecting household members..."
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Special Needs</label>
                          <textarea
                            {...register('special_needs')}
                            className="form-control"
                            rows={3}
                            placeholder="Special accommodations or needs required..."
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Support Network</label>
                          <textarea
                            {...register('support_network')}
                            className="form-control"
                            rows={3}
                            placeholder="Family support, community connections, social services..."
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Community Integration</label>
                          <textarea
                            {...register('community_integration')}
                            className="form-control"
                            rows={3}
                            placeholder="Level of community involvement and integration..."
                          />
                        </div>

                        <div className="col-12 mb-3">
                          <label className="form-label">Income Verification *</label>
                          <textarea
                            {...register('income_verification')}
                            className="form-control"
                            rows={3}
                            placeholder="Verify income sources, stability, documentation provided..."
                          />
                          {errors.income_verification && (
                            <div className="text-danger mt-1">{errors.income_verification.message}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Vulnerability Score (1-10) *</label>
                          <select
                            {...register('vulnerability_score', { valueAsNumber: true })}
                            className="form-select"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} - {i + 1 <= 3 ? 'Low' : i + 1 <= 6 ? 'Medium' : 'High'} Vulnerability
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Social Priority Level *</label>
                          <select
                            {...register('social_priority_level', { valueAsNumber: true })}
                            className="form-select"
                          >
                            <option value={1}>1 - Urgent (Immediate intervention needed)</option>
                            <option value={2}>2 - High (Significant social need)</option>
                            <option value={3}>3 - Medium (Moderate social need)</option>
                            <option value={4}>4 - Low (Minor social considerations)</option>
                            <option value={5}>5 - Minimal (No significant social concerns)</option>
                          </select>
                        </div>

                        <div className="col-12 mb-3">
                          <label className="form-label">Social Conclusion *</label>
                          <textarea
                            {...register('social_conclusion')}
                            className="form-control"
                            rows={4}
                            placeholder="Overall social assessment conclusion and key findings..."
                          />
                          {errors.social_conclusion && (
                            <div className="text-danger mt-1">{errors.social_conclusion.message}</div>
                          )}
                        </div>

                        <div className="col-12 mb-4">
                          <label className="form-label">Recommendations *</label>
                          <textarea
                            {...register('recommendations')}
                            className="form-control"
                            rows={4}
                            placeholder="Social recommendations for this application..."
                          />
                          {errors.recommendations && (
                            <div className="text-danger mt-1">{errors.recommendations.message}</div>
                          )}
                        </div>
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
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save me-2"></i>
                              {existingReport ? 'Update Assessment' : 'Save Assessment'}
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => navigate('/reviews/social')}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="col-lg-4">
                    <div className="card border">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Assessment Guidelines</h6>
                      </div>
                      <div className="card-body">
                        {existingReport ? (
                          <div className="alert alert-success">
                            <i className="bx bx-check me-2"></i>
                            Assessment completed on {new Date(existingReport.submitted_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            <i className="bx bx-info-circle me-2"></i>
                            Assessment not yet completed
                          </div>
                        )}

                        <h6 className="mt-3">Key Assessment Areas:</h6>
                        <ul className="list-unstyled small">
                          <li><i className="bx bx-check text-muted me-1"></i> Household composition and dynamics</li>
                          <li><i className="bx bx-check text-muted me-1"></i> Living space adequacy</li>
                          <li><i className="bx bx-check text-muted me-1"></i> Health and special needs</li>
                          <li><i className="bx bx-check text-muted me-1"></i> Financial stability</li>
                          <li><i className="bx bx-check text-muted me-1"></i> Community support systems</li>
                          <li><i className="bx bx-check text-muted me-1"></i> Vulnerability factors</li>
                        </ul>

                        <h6 className="mt-3">Priority Guidelines:</h6>
                        <div className="small">
                          <div><strong>Level 1-2:</strong> Urgent social intervention needed</div>
                          <div><strong>Level 3:</strong> Standard housing assistance</div>
                          <div><strong>Level 4-5:</strong> Low social priority</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default SocialAssessmentPage;