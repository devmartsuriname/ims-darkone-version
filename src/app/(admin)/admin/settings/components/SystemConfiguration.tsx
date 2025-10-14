import { useState } from 'react'
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

interface SystemConfig {
  sla_intake_hours: number
  sla_control_hours: number
  sla_technical_review_hours: number
  sla_social_review_hours: number
  sla_director_review_hours: number
  sla_minister_decision_hours: number
  notification_quiet_hours_start: string
  notification_quiet_hours_end: string
  max_file_size_mb: number
  max_photos_per_visit: number
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  auto_assign_applications: boolean
}

const SystemConfiguration = () => {
  const [config, setConfig] = useState<SystemConfig>({
    sla_intake_hours: 24,
    sla_control_hours: 72,
    sla_technical_review_hours: 48,
    sla_social_review_hours: 48,
    sla_director_review_hours: 24,
    sla_minister_decision_hours: 48,
    notification_quiet_hours_start: '22:00',
    notification_quiet_hours_end: '08:00',
    max_file_size_mb: 50,
    max_photos_per_visit: 20,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    auto_assign_applications: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // In a real implementation, this would save to a system_config table
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('System configuration saved successfully')
    } catch (error: any) {
      toast.error(`Failed to save configuration: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <Alert variant="info" className="mb-4">
        <i className="mdi mdi-information me-2"></i>
        Configure system-wide settings for workflow SLAs, notifications, and file handling.
      </Alert>

      <Row>
        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="card-title mb-0">SLA Configuration (Hours)</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Intake Processing</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_intake_hours}
                  onChange={(e) => setConfig({ ...config, sla_intake_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Control Visit Completion</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_control_hours}
                  onChange={(e) => setConfig({ ...config, sla_control_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Technical Review</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_technical_review_hours}
                  onChange={(e) => setConfig({ ...config, sla_technical_review_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Social Review</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_social_review_hours}
                  onChange={(e) => setConfig({ ...config, sla_social_review_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Director Review</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_director_review_hours}
                  onChange={(e) => setConfig({ ...config, sla_director_review_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Minister Decision</Form.Label>
                <Form.Control
                  type="number"
                  value={config.sla_minister_decision_hours}
                  onChange={(e) => setConfig({ ...config, sla_minister_decision_hours: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="card-title mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Quiet Hours Start</Form.Label>
                <Form.Control
                  type="time"
                  value={config.notification_quiet_hours_start}
                  onChange={(e) => setConfig({ ...config, notification_quiet_hours_start: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quiet Hours End</Form.Label>
                <Form.Control
                  type="time"
                  value={config.notification_quiet_hours_end}
                  onChange={(e) => setConfig({ ...config, notification_quiet_hours_end: e.target.value })}
                />
              </Form.Group>
              <Form.Check
                type="switch"
                id="email-notifications"
                label="Enable Email Notifications"
                checked={config.enable_email_notifications}
                onChange={(e) => setConfig({ ...config, enable_email_notifications: e.target.checked })}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="sms-notifications"
                label="Enable SMS Notifications"
                checked={config.enable_sms_notifications}
                onChange={(e) => setConfig({ ...config, enable_sms_notifications: e.target.checked })}
                className="mb-3"
              />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header>
              <h5 className="card-title mb-0">File Upload Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Maximum File Size (MB)</Form.Label>
                <Form.Control
                  type="number"
                  value={config.max_file_size_mb}
                  onChange={(e) => setConfig({ ...config, max_file_size_mb: parseInt(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Maximum Photos Per Visit</Form.Label>
                <Form.Control
                  type="number"
                  value={config.max_photos_per_visit}
                  onChange={(e) => setConfig({ ...config, max_photos_per_visit: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header>
              <h5 className="card-title mb-0">Workflow Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="auto-assign"
                label="Auto-assign Applications to Available Staff"
                checked={config.auto_assign_applications}
                onChange={(e) => setConfig({ ...config, auto_assign_applications: e.target.checked })}
                className="mb-3"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-end">
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="mdi mdi-content-save me-1"></i>
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SystemConfiguration
