import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';

const PropertyDetailsStep: React.FC = () => {
  const { control, setValue } = useFormContext();

  const propertyTypeOptions = [
    { value: 'single_family', label: 'Single Family House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'traditional', label: 'Traditional House' },
    { value: 'wooden', label: 'Wooden House' },
    { value: 'concrete', label: 'Concrete House' },
  ];

  const titleTypeOptions = [
    { value: 'eigendom', label: 'Eigendom (Ownership)' },
    { value: 'erfpacht', label: 'Erfpacht (Leasehold)' },
    { value: 'huur', label: 'Huur (Rental)' },
    { value: 'vruchtgebruik', label: 'Vruchtgebruik (Usufruct)' },
    { value: 'ander', label: 'Other' },
  ];

  const ownershipStatusOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'co_owner', label: 'Co-Owner' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'family_member', label: 'Family Member' },
    { value: 'caretaker', label: 'Caretaker' },
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
          <h5 className="mb-0">Property Information</h5>
          <p className="text-muted mb-0 small">Provide details about the property for subsidy</p>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <TextFormInput
                name="property_address"
                label="Property Address *"
                control={control}
                placeholder="Enter complete property address"
              />
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <label className="form-label">Property District *</label>
                <ChoicesFormInput
                  className="form-control"
                  onChange={(value) => setValue('property_district', value)}
                >
                  <option value="">Select district</option>
                  {districtOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">Property Type *</label>
                <ChoicesFormInput
                  className="form-control"
                  onChange={(value) => setValue('property_type', value)}
                >
                  <option value="">Select property type</option>
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              </div>
            </Col>
            <Col md={6}>
              <TextFormInput
                name="property_surface_area"
                type="number"
                label="Surface Area (m²) *"
                control={control}
                placeholder="0"
                min="1"
                step="0.01"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">Title Type *</label>
                <ChoicesFormInput
                  className="form-control"
                  onChange={(value) => setValue('title_type', value)}
                >
                  <option value="">Select title type</option>
                  {titleTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">Ownership Status *</label>
                <ChoicesFormInput
                  className="form-control"
                  onChange={(value) => setValue('ownership_status', value)}
                >
                  <option value="">Select ownership status</option>
                  {ownershipStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ChoicesFormInput>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-none mt-4">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">Subsidy Request Details</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="requested_amount"
                type="number"
                label="Requested Subsidy Amount (SRD) *"
                control={control}
                placeholder="0.00"
                min="100"
                step="0.01"
              />
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-control"
                  onChange={(e) => setValue('priority_level', parseInt(e.target.value))}
                  defaultValue="3"
                >
                  <option value="1">1 - Urgent</option>
                  <option value="2">2 - High</option>
                  <option value="3">3 - Normal</option>
                  <option value="4">4 - Low</option>
                </select>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <TextAreaFormInput
                name="reason_for_request"
                label="Reason for Subsidy Request *"
                control={control}
                rows={4}
                placeholder="Please provide a detailed explanation of why you need housing subsidy assistance (minimum 20 characters)"
              />
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <TextAreaFormInput
                name="special_circumstances"
                label="Special Circumstances"
                control={control}
                rows={3}
                placeholder="Any special circumstances, medical conditions, or urgent housing needs (optional)"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-none mt-4">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">Important Notes</h5>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info">
            <h6 className="alert-heading">Required Documentation</h6>
            <p className="mb-0">
              In the next step, you will need to upload the following documents:
            </p>
            <ul className="mb-0 mt-2">
              <li>Nationale verklaring + uittreksel</li>
              <li>Gezinsuittreksel</li>
              <li>ID copies (all household members)</li>
              <li>Perceelkaart (plot map)</li>
              <li>Ownership documents (eigendom/koopakte/beschikking)</li>
              <li>Permission letter (if applicable)</li>
              <li>Income verification documents</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PropertyDetailsStep;