import { Card, CardBody, CardTitle, Row, Col, Accordion } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { Link } from 'react-router-dom'

const HelpPage = () => {
  const faqs = [
    {
      question: 'How do I create a new application?',
      answer: 'Navigate to Applications > New Application from the sidebar menu. Fill in the applicant details, property information, and upload required documents. The system will guide you through each step of the intake process.'
    },
    {
      question: 'What documents are required for a subsidy application?',
      answer: 'The following 12 documents are required: National verification, Family certificate, ID copies (all household members), Plot map (Perceelkaart), Ownership documents, Permission letter, AOV declaration, Pension statement, Mortgage statement, Recent pay slip, Employer declaration, and Village/DC declaration.'
    },
    {
      question: 'How do I schedule a control visit?',
      answer: 'Go to Control > Schedule Visit. Select the application from the queue, choose a date and time, and assign an inspector. The system will automatically notify the assigned inspector and create the necessary tasks.'
    },
    {
      question: 'What are the different application states?',
      answer: 'Applications move through these states: Draft → Intake Review → Control Assign → Control Visit Scheduled → Control In Progress → Technical Review → Social Review → Director Review → Minister Decision → Closure or Rejected.'
    },
    {
      question: 'How do I verify documents?',
      answer: 'Open the application detail page, navigate to the Documents tab, and click on each document to review. Mark them as Verified, Rejected, or Pending with appropriate notes. All required documents must be verified before the application can proceed to Director Review.'
    },
    {
      question: 'Can I change my notification preferences?',
      answer: 'Yes, go to Admin > Notification Preferences to customize your notification settings. You can control email, SMS, and in-app notifications, set quiet hours, and adjust reminder frequencies.'
    }
  ]

  const resources = [
    {
      icon: 'solar:document-text-outline',
      title: 'User Documentation',
      description: 'Comprehensive guides for all system features',
      link: '/documentation/user-guide'
    },
    {
      icon: 'solar:code-outline',
      title: 'Technical Documentation',
      description: 'API documentation and technical specifications',
      link: '/documentation/technical'
    },
    {
      icon: 'solar:bug-outline',
      title: 'Report an Issue',
      description: 'Submit bug reports or feature requests',
      link: '/qa/dashboard'
    },
    {
      icon: 'solar:shield-check-outline',
      title: 'Security Guidelines',
      description: 'Security best practices and compliance',
      link: '/security/scanning'
    }
  ]

  return (
    <>
      <PageTitle title="Help & Support" subName="Resources" />

      <Row className="mb-4">
        <Col>
          <Card className="bg-primary text-white">
            <CardBody className="text-center py-4">
              <IconifyIcon icon="solar:question-circle-bold" className="fs-1 mb-3" />
              <h3 className="mb-2">How can we help you?</h3>
              <p className="mb-0">Find answers to common questions or explore our documentation</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-4">
                <IconifyIcon icon="solar:book-outline" className="me-2" />
                Quick Resources
              </CardTitle>
              <Row>
                {resources.map((resource, idx) => (
                  <Col md={6} lg={3} key={idx} className="mb-3">
                    <Link to={resource.link} className="text-decoration-none">
                      <Card className="h-100 border hover-shadow" style={{ transition: 'all 0.3s' }}>
                        <CardBody className="text-center">
                          <IconifyIcon icon={resource.icon} className="fs-1 text-primary mb-2" />
                          <h6 className="mb-2">{resource.title}</h6>
                          <p className="text-muted small mb-0">{resource.description}</p>
                        </CardBody>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-4">
                <IconifyIcon icon="solar:help-outline" className="me-2" />
                Frequently Asked Questions
              </CardTitle>
              <Accordion defaultActiveKey="0">
                {faqs.map((faq, idx) => (
                  <Accordion.Item eventKey={idx.toString()} key={idx}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-3">
                <IconifyIcon icon="solar:chat-round-dots-outline" className="me-2" />
                Need More Help?
              </CardTitle>
              <p className="text-muted mb-3">
                Can't find what you're looking for? Contact your system administrator or IT support team.
              </p>
              <div className="d-flex align-items-center">
                <IconifyIcon icon="solar:letter-outline" className="fs-4 text-primary me-3" />
                <div>
                  <small className="text-muted d-block">Email Support</small>
                  <span>support@dvh.gov.sr</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-3">
                <IconifyIcon icon="solar:clock-circle-outline" className="me-2" />
                System Status
              </CardTitle>
              <div className="d-flex align-items-center mb-3">
                <div className="avatar avatar-sm bg-success rounded-circle me-3">
                  <IconifyIcon icon="solar:check-circle-bold" className="text-white" />
                </div>
                <div>
                  <h6 className="mb-0">All Systems Operational</h6>
                  <small className="text-muted">Last updated: Just now</small>
                </div>
              </div>
              <Link to="/monitoring/system-health" className="btn btn-sm btn-outline-primary">
                View System Health
                <IconifyIcon icon="solar:arrow-right-outline" className="ms-2" />
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default HelpPage
