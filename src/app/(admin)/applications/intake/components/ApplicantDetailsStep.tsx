import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import CustomFlatpickr from '@/components/CustomFlatpickr';
import { HelpIcon } from '@/components/ui/EnhancedTooltip';

const ApplicantDetailsStep: React.FC = () => {
  const { control, setValue, watch } = useFormContext();
  const maritalStatus = watch('marital_status');

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'common_law', label: 'Common Law' },
  ];

  const employmentStatusOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' },
    { value: 'disabled', label: 'Disabled' },
  ];

  const districtOptions = [
    { value: 'paramaribo', label: 'Paramaribo' },
    { value: 'wanica', label: 'Wanica' },
    { value: 'nickerie', label: 'Nickerie' },
    { value: 'coronie', label: 'Coronie' },
    { value: 'saramacca', label: 'Saramacca' },
    { value: 'commewijne', label: 'Commewijne' },
    { value: 'marowijne', label: 'Marowijne' },
    { value: 'para', label: 'Para' },
    { value: 'brokopondo', label: 'Brokopondo' },
    { value: 'sipaliwini', label: 'Sipaliwini' },
  ];

  return (
    <div>
      <Card className="border-0 shadow-none">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">Personal Information</h5>
          <p className="text-muted mb-0 small">Please provide accurate personal details</p>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="first_name"
                label="First Name *"
                control={control}
                placeholder="Enter first name"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="last_name"
                label="Last Name *"
                control={control}
                placeholder="Enter last name"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">
                  National ID Number *
                  <HelpIcon 
                    content="Enter the applicant's national identification number as it appears on their ID card"
                    variant="info"
                  />
                </label>
                <TextFormInput
                  name="national_id"
                  control={control}
                  placeholder="Enter national ID"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">Date of Birth *</label>
                <CustomFlatpickr
                  className="form-control"
                  placeholder="Select date of birth"
                  options={{
                    dateFormat: 'Y-m-d',
                    maxDate: new Date(),
                    onChange: (dates: Date[]) => {
                      if (dates.length > 0) {
                        setValue('date_of_birth', dates[0]);
                      }
                    },
                  }}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <TextFormInput
                name="email"
                type="email"
                label="Email Address"
                control={control}
                placeholder="Enter email address"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="phone"
                label="Phone Number *"
                control={control}
                placeholder="Enter phone number"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <SelectFormInput
                name="marital_status"
                label="Marital Status *"
                control={control}
                options={maritalStatusOptions}
                placeholder="Select marital status"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="nationality"
                label="Nationality"
                control={control}
                placeholder="Nationality"
                defaultValue="Surinamese"
              />
            </Col>
          </Row>

          {(maritalStatus === 'married' || maritalStatus === 'common_law') && (
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="spouse_name"
                  label="Spouse/Partner Name"
                  control={control}
                  placeholder="Enter spouse/partner name"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="spouse_income"
                  type="number"
                  label="Spouse/Partner Monthly Income (SRD)"
                  control={control}
                  placeholder="0.00"
                  step="0.01"
                />
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-none mt-4">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">Address & Contact Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <TextFormInput
                name="address"
                label="Full Address *"
                control={control}
                placeholder="Enter complete address"
              />
            </Col>
            <Col md={4}>
              <SelectFormInput
                name="district"
                label="District *"
                control={control}
                options={districtOptions}
                placeholder="Select district"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-none mt-4">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">Household & Income Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <TextFormInput
                name="household_size"
                type="number"
                label="Household Size *"
                control={control}
                placeholder="1"
                min="1"
              />
            </Col>
            <Col md={3}>
              <TextFormInput
                name="children_count"
                type="number"
                label="Number of Children"
                control={control}
                placeholder="0"
                min="0"
              />
            </Col>
            <Col md={6}>
              <SelectFormInput
                name="employment_status"
                label="Employment Status *"
                control={control}
                options={employmentStatusOptions}
                placeholder="Select employment status"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">
                  Monthly Income (SRD) *
                  <HelpIcon 
                    content="Enter the total monthly income in Surinamese Dollars. This is used to assess eligibility for housing subsidy."
                    variant="info"
                  />
                </label>
                <TextFormInput
                  name="monthly_income"
                  type="number"
                  control={control}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </Col>
            <Col md={6}>
              <TextFormInput
                name="employer_name"
                label="Employer Name"
                control={control}
                placeholder="Enter employer name (if employed)"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ApplicantDetailsStep;