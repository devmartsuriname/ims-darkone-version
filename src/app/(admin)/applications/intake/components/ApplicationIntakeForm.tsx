import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Col, Row, ProgressBar, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { z } from 'zod';

import ApplicantDetailsStep from './ApplicantDetailsStep';
import PropertyDetailsStep from './PropertyDetailsStep';
import DocumentUploadStep from './DocumentUploadStep';
import ReviewSubmitStep from './ReviewSubmitStep';
import { applicationService } from '@/services/edgeFunctionServices';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { groupErrorsByStep } from '@/utils/form-helpers';

// Validation schemas for each step
const applicantSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  national_id: z.string().min(6, 'National ID is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone number is required'),
  date_of_birth: z.date({
    message: 'Date of birth is required',
  })
    .refine((date) => date < new Date(), {
      message: 'Date of birth must be in the past',
    })
    .refine((date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const dayDiff = today.getDate() - date.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 18;
    }, {
      message: 'Applicant must be at least 18 years old',
    }),
  marital_status: z.string().min(1, 'Please select marital status'),
  nationality: z.string().default('Surinamese'),
  address: z.string().min(10, 'Complete address is required'),
  district: z.string().min(1, 'Please select district'),
  household_size: z.number().min(1, 'Household size must be at least 1'),
  children_count: z.number().min(0, 'Children count cannot be negative'),
  monthly_income: z.number().min(0, 'Monthly income must be positive'),
  employment_status: z.string().min(1, 'Please select employment status'),
  employer_name: z.string().optional(),
  spouse_name: z.string().optional(),
  spouse_income: z.number().optional(),
});

const propertySchema = z.object({
  property_address: z.string().min(10, 'Property address is required'),
  property_district: z.string().min(1, 'Please select property district'),
  property_type: z.string().min(1, 'Please select property type'),
  property_surface_area: z.number().min(1, 'Surface area must be positive'),
  title_type: z.string().min(1, 'Please select title type'),
  ownership_status: z.string().min(1, 'Please select ownership status'),
  requested_amount: z.number().min(100, 'Requested amount must be at least 100'),
  reason_for_request: z.string().min(20, 'Please provide detailed reason (minimum 20 characters)'),
  special_circumstances: z.string().optional(),
});

const documentsSchema = z.object({
  uploaded_documents: z.array(z.object({
    document_type: z.string(),
    file_name: z.string(),
    file_path: z.string(),
    verification_status: z.string().default('PENDING'),
  })).min(1, 'At least one document must be uploaded'),
});

const fullApplicationSchema = applicantSchema.merge(propertySchema).merge(documentsSchema);

type ApplicationFormData = z.infer<typeof fullApplicationSchema>;

const ApplicationIntakeForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(fullApplicationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      // ========== Step 1: Applicant Details ==========
      // Personal Information
      first_name: '',
      last_name: '',
      national_id: '',
      date_of_birth: undefined,
      phone: '',
      email: '',
      marital_status: '',
      nationality: 'Surinamese',
      spouse_name: '',
      
      // Address & Contact
      address: '',
      district: '',
      
      // Household & Income
      household_size: 1,
      children_count: 0,
      employment_status: '',
      monthly_income: 0,
      spouse_income: 0,
      employer_name: '',
      
      // ========== Step 2: Property Details ==========
      property_address: '',
      property_district: '',
      property_type: '',
      property_surface_area: 0,
      title_type: '',
      ownership_status: '',
      reason_for_request: '',
      requested_amount: 0,
      special_circumstances: '',
      
      // ========== Step 3: Documents ==========
      uploaded_documents: [],
    },
  });

  const { trigger, reset } = methods;

  const steps = [
    { id: 1, title: 'Applicant Details', icon: 'bx:user' },
    { id: 2, title: 'Property Details', icon: 'bx:home' },
    { id: 3, title: 'Document Upload', icon: 'bx:upload' },
    { id: 4, title: 'Review & Submit', icon: 'bx:check-circle' },
  ];

  const validateCurrentStep = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await trigger([
          'first_name', 'last_name', 'national_id', 'email', 'phone',
          'date_of_birth', 'marital_status', 'nationality',
          'address', 'district', 'household_size', 'children_count', 
          'monthly_income', 'employment_status'
        ]);
        break;
      case 2:
        isValid = await trigger([
          'property_address', 'property_district', 'property_type',
          'property_surface_area', 'title_type', 'ownership_status',
          'requested_amount', 'reason_for_request'
        ]);
        break;
      case 3:
        isValid = await trigger(['uploaded_documents']);
        break;
      case 4:
        isValid = await trigger();
        break;
    }
    return isValid;
  };

  const nextStep = async () => {
    console.log('🔍 [VALIDATION] Starting Step', currentStep, 'validation');
    const formValues = methods.getValues();
    console.log('📋 [VALIDATION] Current form values:', formValues);
    
    // Log field types for Step 1 debugging
    if (currentStep === 1) {
      console.log('🔍 [FIELD TYPES]', {
        first_name: `"${formValues.first_name}" (${typeof formValues.first_name})`,
        last_name: `"${formValues.last_name}" (${typeof formValues.last_name})`,
        national_id: `"${formValues.national_id}" (${typeof formValues.national_id})`,
        phone: `"${formValues.phone}" (${typeof formValues.phone})`,
        email: `"${formValues.email}" (${typeof formValues.email})`,
        nationality: `"${formValues.nationality}" (${typeof formValues.nationality})`,
        address: `"${formValues.address}" (${typeof formValues.address})`,
        date_of_birth: `${formValues.date_of_birth} (${typeof formValues.date_of_birth})`,
      });
    }
    
    const isValid = await validateCurrentStep();
    
    console.log('✅ [VALIDATION] Step', currentStep, 'valid?', isValid);
    
    if (!isValid) {
      // Collect and display validation errors grouped by step
      const errors = methods.formState.errors;
      console.error('❌ [VALIDATION] Errors detected:', errors);
      
      const groupedErrors = groupErrorsByStep(errors);
      const errorMessages: string[] = [];
      
      Object.entries(groupedErrors).forEach(([step, messages]) => {
        console.log(`📌 [VALIDATION] ${step}:`, messages);
        if (messages.length > 0) {
          errorMessages.push(...messages);
        }
      });
      
      setValidationErrors(errorMessages);
      
      // Scroll to first error field
      const firstErrorField = document.querySelector('.is-invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      toast.error(`Please correct ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''} before proceeding`, {
        autoClose: 5000,
      });
      return;
    }
    
    setValidationErrors([]);
    if (currentStep < 4) {
      await autoSave();
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const autoSave = async () => {
    try {
      // Auto-save functionality would be implemented here
      // For now, we'll skip this to focus on main submission
    } catch (error) {
      // Auto-save failed - silent fail for now
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    try {
      // Transform form data to match service interface
      const applicationData = {
        applicant: {
          first_name: data.first_name,
          last_name: data.last_name,
          national_id: data.national_id,
          email: data.email,
          phone: data.phone,
          address: data.address,
          district: data.district,
          marital_status: data.marital_status,
          nationality: data.nationality,
          date_of_birth: data.date_of_birth?.toISOString(),
          household_size: data.household_size,
          children_count: data.children_count,
          monthly_income: data.monthly_income,
          spouse_income: data.spouse_income,
          employment_status: data.employment_status,
          employer_name: data.employer_name,
        },
        application: {
          service_type: 'SUBSIDY',
          property_address: data.property_address,
          property_district: data.property_district,
          property_type: data.property_type,
          title_type: data.title_type,
          ownership_status: data.ownership_status,
          property_surface_area: data.property_surface_area,
          requested_amount: data.requested_amount,
          reason_for_request: data.reason_for_request,
          special_circumstances: data.special_circumstances,
        }
      }

      await applicationService.createApplication(applicationData)

      toast.success('Application submitted successfully!')
      reset()
      setCurrentStep(1)
      setApplicationId(null)
    } catch (error) {
      console.error('Submit failed:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ApplicantDetailsStep />;
      case 2:
        return <PropertyDetailsStep />;
      case 3:
        return <DocumentUploadStep applicationId={applicationId} />;
      case 4:
        return <ReviewSubmitStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="container-fluid">
        <Row>
          <Col lg={12}>
            <Card>
              <Card.Header className="border-bottom">
                <Row className="align-items-center">
                  <Col>
                    <h4 className="card-title mb-0">New Housing Subsidy Application</h4>
                    <p className="text-muted mb-0">Complete all steps to submit your application</p>
                  </Col>
                  <Col xs="auto">
                    {applicationId && (
                      <span className="badge bg-info">
                        Draft Saved
                      </span>
                    )}
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body>
                {/* Progress Steps */}
                <Row className="mb-4">
                  <Col lg={12}>
                    <div className="d-flex justify-content-between mb-3">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`d-flex align-items-center ${
                            currentStep >= step.id ? 'text-primary' : 'text-muted'
                          }`}
                        >
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                              currentStep >= step.id
                                ? 'bg-primary text-white'
                                : 'bg-light text-muted'
                            }`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            <IconifyIcon icon={step.icon} />
                          </div>
                          <div className="d-none d-md-block">
                            <div className="fw-medium">{step.title}</div>
                            <div className="small">Step {step.id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ProgressBar
                      now={(currentStep / steps.length) * 100}
                      className="mb-3"
                      style={{ height: '6px' }}
                    />
                  </Col>
                </Row>

                {/* Validation Errors Display */}
                {validationErrors.length > 0 && (
                  <Alert variant="danger" className="mb-3" dismissible onClose={() => setValidationErrors([])}>
                    <Alert.Heading>
                      <i className="bx bx-error-circle me-2"></i>
                      ⚠️ Cannot proceed - {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''} found
                    </Alert.Heading>
                    <p className="mb-2">Please correct the following fields before continuing to the next step:</p>
                    <ul className="mb-0">
                      {validationErrors.map((error, index) => (
                        <li key={index}><strong>{error}</strong></li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {/* Form Content */}
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <Row className="mt-4">
                    <Col>
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="outline-secondary"
                          onClick={prevStep}
                          disabled={currentStep === 1}
                        >
                          <IconifyIcon icon="bx:chevron-left" className="me-1" />
                          Previous
                        </Button>

                        {currentStep < 4 ? (
                          <Button variant="primary" onClick={nextStep}>
                            Next
                            <IconifyIcon icon="bx:chevron-right" className="ms-1" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            variant="success"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <IconifyIcon icon="bx:check" className="me-1" />
                                Submit Application
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </FormProvider>
  );
};

export default ApplicationIntakeForm;