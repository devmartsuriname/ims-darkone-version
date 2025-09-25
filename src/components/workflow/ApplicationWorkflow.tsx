import React, { useState, useCallback } from 'react'
import { Card, Col, Row, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { workflowService, notificationService } from '@/services/edgeFunctionServices'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface ApplicationWorkflowProps {
  applicationId: string
  currentState: string
  assignedTo?: string
  onStateChange?: () => void
}

interface AvailableTransition {
  state: string
  label: string
  requirements: string[]
}

const ApplicationWorkflow: React.FC<ApplicationWorkflowProps> = ({
  applicationId,
  currentState,
  assignedTo,
  onStateChange
}) => {
  const [availableTransitions, setAvailableTransitions] = useState<AvailableTransition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransition, setSelectedTransition] = useState<string>('')
  const [transitionNotes, setTransitionNotes] = useState('')
  const [assignToUser, setAssignToUser] = useState('')

  const loadAvailableTransitions = useCallback(async () => {
    try {
      const result = await workflowService.getAvailableTransitions(applicationId)
      setAvailableTransitions(result.available_transitions || [])
    } catch (error) {
      console.error('Failed to load available transitions:', error)
      toast.error('Failed to load workflow options')
    }
  }, [applicationId])

  const handleStateTransition = async () => {
    if (!selectedTransition) {
      toast.error('Please select a state to transition to')
      return
    }

    setIsLoading(true)
    try {
      // First validate the transition
      const validation = await workflowService.validateTransition(applicationId, selectedTransition)
      
      if (!validation.valid) {
        toast.error(`Transition not allowed: ${validation.reasons?.join(', ')}`)
        return
      }

      // Perform the transition
      await workflowService.transitionState({
        application_id: applicationId,
        target_state: selectedTransition,
        notes: transitionNotes,
        assigned_to: assignToUser || undefined
      })

      // Send notification about state change
      await notificationService.createApplicationNotification({
        application_id: applicationId,
        type: 'status_change',
        message: `Application transitioned to ${selectedTransition}${transitionNotes ? `: ${transitionNotes}` : ''}`
      })

      toast.success('Application state updated successfully')
      
      // Reset form
      setSelectedTransition('')
      setTransitionNotes('')
      setAssignToUser('')
      
      // Reload transitions and notify parent
      await loadAvailableTransitions()
      onStateChange?.()

    } catch (error) {
      console.error('State transition failed:', error)
      toast.error('Failed to update application state')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadAvailableTransitions()
  }, [loadAvailableTransitions])

  const getStateColor = (state: string) => {
    const stateColors: Record<string, string> = {
      DRAFT: 'secondary',
      INTAKE_REVIEW: 'info',
      CONTROL_ASSIGN: 'warning',
      CONTROL_VISIT_SCHEDULED: 'warning',
      CONTROL_IN_PROGRESS: 'primary',
      TECHNICAL_REVIEW: 'primary',
      SOCIAL_REVIEW: 'primary',
      DIRECTOR_REVIEW: 'warning',
      MINISTER_DECISION: 'warning',
      CLOSURE: 'success',
      REJECTED: 'danger',
      ON_HOLD: 'dark'
    }
    return stateColors[state] || 'secondary'
  }

  const formatStateName = (state: string) => {
    return state.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <IconifyIcon icon="bx:git-branch" className="me-2" />
          Workflow Management
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Current State */}
        <div className="mb-4">
          <Row>
            <Col>
              <h6>Current State</h6>
              <span className={`badge bg-${getStateColor(currentState)} fs-6`}>
                {formatStateName(currentState)}
              </span>
            </Col>
            {assignedTo && (
              <Col>
                <h6>Assigned To</h6>
                <span className="text-muted">{assignedTo}</span>
              </Col>
            )}
          </Row>
        </div>

        {/* Available Transitions */}
        {availableTransitions.length > 0 && (
          <div className="mb-4">
            <h6>Available Actions</h6>
            <div className="mb-3">
              <select
                className="form-select"
                value={selectedTransition}
                onChange={(e) => setSelectedTransition(e.target.value)}
              >
                <option value="">Select next state...</option>
                {availableTransitions.map((transition) => (
                  <option key={transition.state} value={transition.state}>
                    {transition.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedTransition && (
              <>
                {/* Show requirements for selected transition */}
                {(() => {
                  const selectedTransitionData = availableTransitions.find(t => t.state === selectedTransition)
                  return selectedTransitionData?.requirements && selectedTransitionData.requirements.length > 0 && (
                  <Alert variant="info" className="mb-3">
                    <h6>Requirements:</h6>
                    <ul className="mb-0">
                      {selectedTransitionData?.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </Alert>
                  )
                })()}

                {/* Transition Notes */}
                <div className="mb-3">
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    placeholder="Add notes about this transition..."
                  />
                </div>

                {/* Assign To User */}
                <div className="mb-3">
                  <label className="form-label">Assign To (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={assignToUser}
                    onChange={(e) => setAssignToUser(e.target.value)}
                    placeholder="User ID to assign this application to..."
                  />
                </div>

                {/* Action Button */}
                <Button
                  variant="primary"
                  onClick={handleStateTransition}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="bx:check" className="me-2" />
                      Transition to {formatStateName(selectedTransition)}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {availableTransitions.length === 0 && (
          <Alert variant="info">
            No transitions available from current state or insufficient permissions.
          </Alert>
        )}
      </Card.Body>
    </Card>
  )
}

export default ApplicationWorkflow