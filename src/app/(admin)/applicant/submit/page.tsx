import { ApplicantGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Alert, Row, Col } from 'react-bootstrap';
import ApplicationIntakeForm from '@/app/(admin)/applications/intake/components/ApplicationIntakeForm';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const ApplicantSubmitPage = () => {
  return (
    <ApplicantGuard>
      <PageTitle subName="Applicant Portal" title="Submit New Application" />
      
      <Row className="mb-3">
        <Col xs={12}>
          <Alert variant="info">
            <IconifyIcon icon="bx:info-circle" className="me-2" />
            Complete all required fields to submit your housing subsidy application. You can save your progress as a draft and continue later.
          </Alert>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <CardBody>
          <ApplicationIntakeForm />
        </CardBody>
      </Card>
    </ApplicantGuard>
  );
};

export default ApplicantSubmitPage;
