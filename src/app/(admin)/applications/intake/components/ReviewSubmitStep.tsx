import React from 'react';
import { Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const ReviewSubmitStep: React.FC = () => {
  const { watch } = useFormContext();
  const formData = watch();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SR', {
      style: 'currency',
      currency: 'SRD',
    }).format(amount || 0);
  };

  const formatDate = (date: Date) => {
    if (!date) return 'Not provided';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getMaritalStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
      widowed: 'Widowed',
      common_law: 'Common Law',
    };
    return labels[status] || status;
  };

  const getEmploymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      employed: 'Employed',
      self_employed: 'Self-Employed',
      unemployed: 'Unemployed',
      retired: 'Retired',
      student: 'Student',
      disabled: 'Disabled',
    };
    return labels[status] || status;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single_family: 'Single Family House',
      apartment: 'Apartment',
      duplex: 'Duplex',
      townhouse: 'Townhouse',
      traditional: 'Traditional House',
      wooden: 'Wooden House',
      concrete: 'Concrete House',
    };
    return labels[type] || type;
  };

  const requiredDocuments = [
    'nationale_verklaring',
    'gezinsuittreksel',
    'id_copies',
    'perceelkaart',
    'eigendom_documents',
    'aov_verklaring',
    'recente_loonstrook',
    'werkgeversverklaring',
    'dorpsverklaring',
  ];

  const uploadedDocuments = formData.uploaded_documents || [];
  const uploadedTypes = uploadedDocuments.map((doc: any) => doc.document_type);
  const missingRequired = requiredDocuments.filter(req => !uploadedTypes.includes(req));

  return (
    <div>
      <Alert variant="primary">
        <h6 className="alert-heading">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          Review Your Application
        </h6>
        <p className="mb-0">
          Please review all information below before submitting your housing subsidy application.
          Once submitted, some information cannot be changed.
        </p>
      </Alert>

      {missingRequired.length > 0 && (
        <Alert variant="warning">
          <h6 className="alert-heading">Missing Required Documents</h6>
          <p className="mb-2">The following required documents are missing:</p>
          <ul className="mb-0">
            {missingRequired.map((doc) => (
              <li key={doc}>{doc.replace(/_/g, ' ').toUpperCase()}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Row>
        <Col lg={6}>
          <Card className="border-0 shadow-none">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0">
                <IconifyIcon icon="bx:user" className="me-2" />
                Applicant Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted">Full Name:</td>
                    <td className="fw-medium">
                      {formData.first_name} {formData.last_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">National ID:</td>
                    <td>{formData.national_id}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Date of Birth:</td>
                    <td>{formatDate(formData.date_of_birth)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Email:</td>
                    <td>{formData.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Phone:</td>
                    <td>{formData.phone}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Marital Status:</td>
                    <td>{getMaritalStatusLabel(formData.marital_status)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Nationality:</td>
                    <td>{formData.nationality}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Address:</td>
                    <td>{formData.address}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">District:</td>
                    <td className="text-capitalize">{formData.district}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-none mt-4">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0">
                <IconifyIcon icon="bx:group" className="me-2" />
                Household & Income
              </h6>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted">Household Size:</td>
                    <td>{formData.household_size} members</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Children:</td>
                    <td>{formData.children_count}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Employment Status:</td>
                    <td>{getEmploymentStatusLabel(formData.employment_status)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Monthly Income:</td>
                    <td className="fw-medium">{formatCurrency(formData.monthly_income)}</td>
                  </tr>
                  {formData.employer_name && (
                    <tr>
                      <td className="text-muted">Employer:</td>
                      <td>{formData.employer_name}</td>
                    </tr>
                  )}
                  {formData.spouse_name && (
                    <tr>
                      <td className="text-muted">Spouse/Partner:</td>
                      <td>{formData.spouse_name}</td>
                    </tr>
                  )}
                  {formData.spouse_income > 0 && (
                    <tr>
                      <td className="text-muted">Spouse Income:</td>
                      <td>{formatCurrency(formData.spouse_income)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-none">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0">
                <IconifyIcon icon="bx:home" className="me-2" />
                Property Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted">Property Address:</td>
                    <td>{formData.property_address}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">District:</td>
                    <td className="text-capitalize">{formData.property_district}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Property Type:</td>
                    <td>{getPropertyTypeLabel(formData.property_type)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Surface Area:</td>
                    <td>{formData.property_surface_area} m²</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Title Type:</td>
                    <td className="text-capitalize">{formData.title_type}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Ownership Status:</td>
                    <td className="text-capitalize">{formData.ownership_status?.replace(/_/g, ' ')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Requested Amount:</td>
                    <td className="fw-medium text-primary">
                      {formatCurrency(formData.requested_amount)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-none mt-4">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0">
                <IconifyIcon icon="bx:file" className="me-2" />
                Documents Uploaded
              </h6>
            </Card.Header>
            <Card.Body>
              {uploadedDocuments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {uploadedDocuments.map((doc: any, index: number) => (
                    <div key={index} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="fw-medium">{doc.file_name}</small>
                          <br />
                          <small className="text-muted">
                            Type: {doc.document_type.replace(/_/g, ' ')}
                          </small>
                        </div>
                        <span className="badge bg-success">
                          <IconifyIcon icon="bx:check" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No documents uploaded</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-none mt-4">
        <Card.Header className="bg-light border-0">
          <h6 className="mb-0">
            <IconifyIcon icon="bx:message-detail" className="me-2" />
            Additional Information
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Reason for Request:</h6>
              <p className="text-muted">{formData.reason_for_request || 'Not provided'}</p>
            </Col>
            <Col md={6}>
              <h6>Special Circumstances:</h6>
              <p className="text-muted">{formData.special_circumstances || 'None specified'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Alert variant="success" className="mt-4">
        <h6 className="alert-heading">Ready to Submit?</h6>
        <p className="mb-0">
          By clicking "Submit Application" below, you confirm that all information provided is accurate
          and complete. Your application will be processed according to the Housing Subsidy Program guidelines.
        </p>
      </Alert>
    </div>
  );
};

export default ReviewSubmitStep;