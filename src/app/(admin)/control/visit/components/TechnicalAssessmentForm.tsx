import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

const assessmentSchema = z.object({
  foundation_condition: z.string().min(1, 'Foundation condition is required'),
  walls_condition: z.string().min(1, 'Walls condition is required'),
  roof_condition: z.string().min(1, 'Roof condition is required'),
  floor_condition: z.string().min(1, 'Floor condition is required'),
  windows_doors_condition: z.string().min(1, 'Windows/doors condition is required'),
  electrical_condition: z.string().min(1, 'Electrical condition is required'),
  water_supply_condition: z.string().min(1, 'Water supply condition is required'),
  sanitation_condition: z.string().min(1, 'Sanitation condition is required'),
  sewerage_condition: z.string().min(1, 'Sewerage condition is required'),
  structural_issues: z.string().optional(),
  recommended_repairs: z.string().min(1, 'Recommended repairs are required'),
  estimated_cost: z.number().min(0, 'Cost must be positive').optional(),
  urgency_level: z.number().min(1).max(5),
  technical_conclusion: z.string().min(1, 'Technical conclusion is required'),
  recommendations: z.string().min(1, 'Recommendations are required')
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface TechnicalAssessmentFormProps {
  visitId: string;
  applicationId: string;
}

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'success' },
  { value: 'GOOD', label: 'Good', color: 'info' },
  { value: 'FAIR', label: 'Fair', color: 'warning' },
  { value: 'POOR', label: 'Poor', color: 'danger' },
  { value: 'CRITICAL', label: 'Critical', color: 'dark' }
];

export const TechnicalAssessmentForm = ({ visitId, applicationId }: TechnicalAssessmentFormProps) => {
  const [existingReport, setExistingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      urgency_level: 3
    }
  });

  useEffect(() => {
    fetchExistingReport();
  }, [visitId, applicationId]);

  const fetchExistingReport = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_reports')
        .select('*')
        .eq('control_visit_id', visitId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setExistingReport(data);
        // Populate form with existing data
        const fieldsToMap = [
          'foundation_condition', 'walls_condition', 'roof_condition', 'floor_condition',
          'windows_doors_condition', 'electrical_condition', 'water_supply_condition',
          'sanitation_condition', 'sewerage_condition', 'structural_issues', 'recommended_repairs',
          'estimated_cost', 'urgency_level', 'technical_conclusion', 'recommendations'
        ];
        
        fieldsToMap.forEach((field) => {
          if (data[field as keyof typeof data] !== null && data[field as keyof typeof data] !== undefined) {
            setValue(field as keyof AssessmentFormData, data[field as keyof typeof data] as any);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching technical report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AssessmentFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const reportData = {
        ...data,
        control_visit_id: visitId,
        application_id: applicationId,
        inspector_id: user.id,
        submitted_at: new Date().toISOString()
      };

      let error;

      if (existingReport) {
        // Update existing report
        const result = await supabase
          .from('technical_reports')
          .update(reportData)
          .eq('id', existingReport.id);
        error = result.error;
      } else {
        // Create new report
        const result = await supabase
          .from('technical_reports')
          .insert(reportData);
        error = result.error;
      }

      if (error) throw error;

      toast.success('Technical assessment saved successfully');
      fetchExistingReport(); // Refresh to get the saved data
    } catch (error) {
      console.error('Error saving technical assessment:', error);
      toast.error('Failed to save technical assessment');
    } finally {
      setSubmitting(false);
    }
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-lg-8">
          <h6 className="mb-3">Structural Assessment</h6>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Foundation Condition *</label>
              <select {...register('foundation_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.foundation_condition && (
                <div className="text-danger mt-1">{errors.foundation_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Walls Condition *</label>
              <select {...register('walls_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.walls_condition && (
                <div className="text-danger mt-1">{errors.walls_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Roof Condition *</label>
              <select {...register('roof_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.roof_condition && (
                <div className="text-danger mt-1">{errors.roof_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Floor Condition *</label>
              <select {...register('floor_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.floor_condition && (
                <div className="text-danger mt-1">{errors.floor_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Windows & Doors *</label>
              <select {...register('windows_doors_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.windows_doors_condition && (
                <div className="text-danger mt-1">{errors.windows_doors_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Electrical System *</label>
              <select {...register('electrical_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.electrical_condition && (
                <div className="text-danger mt-1">{errors.electrical_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Water Supply *</label>
              <select {...register('water_supply_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.water_supply_condition && (
                <div className="text-danger mt-1">{errors.water_supply_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Sanitation *</label>
              <select {...register('sanitation_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.sanitation_condition && (
                <div className="text-danger mt-1">{errors.sanitation_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Sewerage System *</label>
              <select {...register('sewerage_condition')} className="form-select">
                <option value="">Select condition</option>
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.sewerage_condition && (
                <div className="text-danger mt-1">{errors.sewerage_condition.message}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Urgency Level *</label>
              <select {...register('urgency_level', { valueAsNumber: true })} className="form-select">
                <option value={1}>1 - Critical (Immediate action required)</option>
                <option value={2}>2 - High (Within 1 month)</option>
                <option value={3}>3 - Medium (Within 3 months)</option>
                <option value={4}>4 - Low (Within 6 months)</option>
                <option value={5}>5 - Minimal (Within 1 year)</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Structural Issues</label>
            <textarea
              {...register('structural_issues')}
              className="form-control"
              rows={3}
              placeholder="Describe any structural issues found..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Recommended Repairs *</label>
            <textarea
              {...register('recommended_repairs')}
              className="form-control"
              rows={4}
              placeholder="List all recommended repairs and improvements..."
            />
            {errors.recommended_repairs && (
              <div className="text-danger mt-1">{errors.recommended_repairs.message}</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Estimated Cost (SRD)</label>
              <input
                type="number"
                {...register('estimated_cost', { valueAsNumber: true })}
                className="form-control"
                placeholder="0.00"
                step="0.01"
              />
              {errors.estimated_cost && (
                <div className="text-danger mt-1">{errors.estimated_cost.message}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Technical Conclusion *</label>
            <textarea
              {...register('technical_conclusion')}
              className="form-control"
              rows={3}
              placeholder="Overall technical assessment conclusion..."
            />
            {errors.technical_conclusion && (
              <div className="text-danger mt-1">{errors.technical_conclusion.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Recommendations *</label>
            <textarea
              {...register('recommendations')}
              className="form-control"
              rows={3}
              placeholder="Final recommendations for this application..."
            />
            {errors.recommendations && (
              <div className="text-danger mt-1">{errors.recommendations.message}</div>
            )}
          </div>

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
        </div>

        <div className="col-lg-4">
          <div className="card border">
            <div className="card-header">
              <h6 className="card-title mb-0">Assessment Status</h6>
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

              <h6 className="mt-3">Condition Legend:</h6>
              <div className="list-group list-group-flush">
                {CONDITIONS.map(condition => (
                  <div key={condition.value} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>{condition.label}</span>
                    <span className={`badge bg-${condition.color}`}>{condition.value}</span>
                  </div>
                ))}
              </div>

              <h6 className="mt-3">Required Fields:</h6>
              <ul className="list-unstyled small">
                <li><i className="bx bx-check text-muted me-1"></i> All structural conditions</li>
                <li><i className="bx bx-check text-muted me-1"></i> Recommended repairs</li>
                <li><i className="bx bx-check text-muted me-1"></i> Technical conclusion</li>
                <li><i className="bx bx-check text-muted me-1"></i> Final recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};