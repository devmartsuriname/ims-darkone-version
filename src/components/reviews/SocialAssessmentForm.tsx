import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Row, Col, Button, Alert, Form, Badge } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

const socialAssessmentSchema = z.object({
  household_situation: z.string().min(1, 'Household situation description is required'),
  health_conditions: z.string().optional(),
  special_needs: z.string().optional(),
  income_verification: z.string().min(1, 'Income verification details are required'),
  living_conditions_assessment: z.string().min(1, 'Living conditions assessment is required'),
  community_integration: z.string().optional(),
  support_network: z.string().optional(),
  social_conclusion: z.string().min(1, 'Social conclusion is required'),
  recommendations: z.string().min(1, 'Recommendations are required'),
  vulnerability_score: z.number().min(1).max(10),
  social_priority_level: z.number().min(1).max(5),
})

type SocialAssessmentFormData = z.infer<typeof socialAssessmentSchema>

interface SocialAssessmentFormProps {
  applicationId: string
  onSubmit?: () => void
}

const VULNERABILITY_LEVELS = [
  { value: 1, label: 'Very Low', color: 'success', description: 'Minimal vulnerability factors' },
  { value: 2, label: 'Low', color: 'info', description: 'Few vulnerability factors' },
  { value: 3, label: 'Low-Medium', color: 'info', description: 'Some vulnerability factors' },
  { value: 4, label: 'Medium', color: 'warning', description: 'Moderate vulnerability' },
  { value: 5, label: 'Medium-High', color: 'warning', description: 'Several risk factors' },
  { value: 6, label: 'High', color: 'danger', description: 'Significant vulnerability' },
  { value: 7, label: 'High-Critical', color: 'danger', description: 'Major risk factors' },
  { value: 8, label: 'Critical', color: 'danger', description: 'Severe vulnerability' },
  { value: 9, label: 'Very Critical', color: 'danger', description: 'Extreme vulnerability' },
  { value: 10, label: 'Emergency', color: 'dark', description: 'Immediate intervention needed' },
]

const PRIORITY_LEVELS = [
  { value: 1, label: 'Urgent (Immediate)', color: 'danger' },
  { value: 2, label: 'High (Within 1 month)', color: 'warning' },
  { value: 3, label: 'Medium (Within 3 months)', color: 'info' },
  { value: 4, label: 'Low (Within 6 months)', color: 'success' },
  { value: 5, label: 'Standard (As available)', color: 'secondary' },
]

export const SocialAssessmentForm: React.FC<SocialAssessmentFormProps> = ({
  applicationId,
  onSubmit
}) => {
  const [existingReport, setExistingReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [applicantData, setApplicantData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SocialAssessmentFormData>({
    resolver: zodResolver(socialAssessmentSchema),
    defaultValues: {
      vulnerability_score: 5,
      social_priority_level: 3
    }
  })

  const vulnerabilityScore = watch('vulnerability_score')
  const priorityLevel = watch('social_priority_level')

  useEffect(() => {
    fetchData()
  }, [applicationId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch existing social report
      const { data: report, error: reportError } = await supabase
        .from('social_reports')
        .select('*')
        .eq('application_id', applicationId)
        .single()

      if (reportError && reportError.code !== 'PGRST116') {
        throw reportError
      }

      if (report) {
        setExistingReport(report)
        // Populate form with existing data
        const fieldsToMap = [
          'household_situation', 'health_conditions', 'special_needs',
          'income_verification', 'living_conditions_assessment', 'community_integration',
          'support_network', 'social_conclusion', 'recommendations',
          'vulnerability_score', 'social_priority_level'
        ]
        
        fieldsToMap.forEach((field) => {
          if (report[field as keyof typeof report] !== null && report[field as keyof typeof report] !== undefined) {
            setValue(field as keyof SocialAssessmentFormData, report[field as keyof typeof report] as any)
          }
        })
      }

      // Fetch applicant data for context
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          applicants (*)
        `)
        .eq('id', applicationId)
        .single()

      if (appError) throw appError
      setApplicantData(application.applicants)

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load assessment data')
    } finally {
      setLoading(false)
    }
  }

  const onFormSubmit = async (data: SocialAssessmentFormData) => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const reportData = {
        ...data,
        application_id: applicationId,
        social_worker_id: user.id,
        submitted_at: new Date().toISOString()
      }

      let error;

      if (existingReport) {
        // Update existing report
        const result = await supabase
          .from('social_reports')
          .update(reportData)
          .eq('id', existingReport.id)
        error = result.error
      } else {
        // Create new report
        const result = await supabase
          .from('social_reports')
          .insert(reportData)
        error = result.error
      }

      if (error) throw error

      toast.success('Social assessment saved successfully')
      onSubmit?.()
      fetchData() // Refresh to get the saved data
    } catch (error) {
      console.error('Error saving social assessment:', error)
      toast.error('Failed to save social assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const getVulnerabilityLevel = (score: number) => {
    return VULNERABILITY_LEVELS.find(level => level.value === score) || VULNERABILITY_LEVELS[4]
  }

  const getPriorityLevel = (level: number) => {
    return PRIORITY_LEVELS.find(p => p.value === level) || PRIORITY_LEVELS[2]
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <IconifyIcon icon="bx:group" className="me-2" />
                Social Assessment Report
              </h6>
            </Card.Header>
            <Card.Body>
              {applicantData && (
                <Alert variant="info" className="mb-3">
                  <strong>Applicant:</strong> {applicantData.first_name} {applicantData.last_name}<br />
                  <strong>Household Size:</strong> {applicantData.household_size}<br />
                  <strong>Monthly Income:</strong> SRD {applicantData.monthly_income?.toLocaleString() || 'Not specified'}
                </Alert>
              )}

              <Row>
                <Col md={12} className="mb-3">
                  <Form.Label>Household Situation *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register('household_situation')}
                    placeholder="Describe the household composition, relationships, dependencies, and overall family dynamics..."
                  />
                  {errors.household_situation && (
                    <div className="text-danger mt-1">{errors.household_situation.message}</div>
                  )}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Health Conditions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('health_conditions')}
                    placeholder="Any health issues, disabilities, or medical conditions affecting the household..."
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Special Needs</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('special_needs')}
                    placeholder="Special accommodations, accessibility requirements, or specific needs..."
                  />
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Label>Income Verification Details *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('income_verification')}
                    placeholder="Verification of income sources, employment status, and financial situation..."
                  />
                  {errors.income_verification && (
                    <div className="text-danger mt-1">{errors.income_verification.message}</div>
                  )}
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Label>Living Conditions Assessment *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register('living_conditions_assessment')}
                    placeholder="Current living conditions, safety, hygiene, overcrowding, and immediate needs..."
                  />
                  {errors.living_conditions_assessment && (
                    <div className="text-danger mt-1">{errors.living_conditions_assessment.message}</div>
                  )}
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Community Integration</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('community_integration')}
                    placeholder="Community involvement, social connections, and local support..."
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Support Network</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('support_network')}
                    placeholder="Family support, friends, community organizations, government assistance..."
                  />
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Label>Social Conclusion *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register('social_conclusion')}
                    placeholder="Overall social assessment conclusion and key findings..."
                  />
                  {errors.social_conclusion && (
                    <div className="text-danger mt-1">{errors.social_conclusion.message}</div>
                  )}
                </Col>

                <Col md={12} className="mb-4">
                  <Form.Label>Recommendations *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register('recommendations')}
                    placeholder="Specific recommendations for assistance, priority level, and proposed interventions..."
                  />
                  {errors.recommendations && (
                    <div className="text-danger mt-1">{errors.recommendations.message}</div>
                  )}
                </Col>
              </Row>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="me-2"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="bx:save" className="me-2" />
                    {existingReport ? 'Update Assessment' : 'Save Assessment'}
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Assessment Scoring</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label>Vulnerability Score (1-10) *</Form.Label>
                <Form.Range
                  {...register('vulnerability_score', { valueAsNumber: true })}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg={getVulnerabilityLevel(vulnerabilityScore).color}>
                    {vulnerabilityScore}/10 - {getVulnerabilityLevel(vulnerabilityScore).label}
                  </Badge>
                </div>
                <small className="text-muted">
                  {getVulnerabilityLevel(vulnerabilityScore).description}
                </small>
              </div>

              <div className="mb-3">
                <Form.Label>Social Priority Level *</Form.Label>
                <Form.Select {...register('social_priority_level', { valueAsNumber: true })}>
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Form.Select>
                <Badge bg={getPriorityLevel(priorityLevel).color} className="mt-2">
                  {getPriorityLevel(priorityLevel).label}
                </Badge>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">Assessment Status</h6>
            </Card.Header>
            <Card.Body>
              {existingReport ? (
                <Alert variant="success">
                  <IconifyIcon icon="bx:check" className="me-2" />
                  Assessment completed on {new Date(existingReport.submitted_at).toLocaleDateString()}
                </Alert>
              ) : (
                <Alert variant="warning">
                  <IconifyIcon icon="bx:info-circle" className="me-2" />
                  Assessment not yet completed
                </Alert>
              )}

              <h6 className="mt-3">Required Fields:</h6>
              <ul className="list-unstyled small">
                <li><IconifyIcon icon="bx:check" className="text-muted me-1" /> Household situation</li>
                <li><IconifyIcon icon="bx:check" className="text-muted me-1" /> Income verification</li>
                <li><IconifyIcon icon="bx:check" className="text-muted me-1" /> Living conditions</li>
                <li><IconifyIcon icon="bx:check" className="text-muted me-1" /> Social conclusion</li>
                <li><IconifyIcon icon="bx:check" className="text-muted me-1" /> Recommendations</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </form>
  )
}

export default SocialAssessmentForm