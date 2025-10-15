import { Container } from 'react-bootstrap'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import SocialAssessmentForm from '@/components/reviews/SocialAssessmentForm'
import { useSearchParams } from 'react-router-dom'
import { StaffGuard } from '@/components/auth/RoleGuards'

const SocialAssessmentPage = () => {
  const [searchParams] = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  if (!applicationId) {
    return (
      <StaffGuard>
        <ComponentContainerCard
          id="social-assessment-error"
          title="Social Assessment"
          description="No application selected for social assessment"
        >
          <div className="text-center py-5">
            <i className="bx bx-error-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
            <h5>No Application Selected</h5>
            <p className="text-muted">Please select an application to conduct social assessment.</p>
          </div>
        </ComponentContainerCard>
      </StaffGuard>
    )
  }

  return (
    <StaffGuard>
      <ComponentContainerCard
        id="social-assessment"
        title="Social Assessment"
        description="Conduct comprehensive social assessment for housing subsidy application"
      >
        <Container fluid>
          <SocialAssessmentForm 
            applicationId={applicationId}
            onSubmit={() => {
              // Social assessment completed
            }}
          />
        </Container>
      </ComponentContainerCard>
    </StaffGuard>
  )
}

export default SocialAssessmentPage