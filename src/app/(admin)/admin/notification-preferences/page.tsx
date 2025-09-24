import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/useAuthContext';
import { toast } from 'react-toastify';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import PageTitle from '@/components/PageTitle';

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  application_updates: boolean;
  deadline_reminders: boolean;
  decision_notifications: boolean;
  system_notifications: boolean;
  reminder_frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const NotificationPreferencesPage: React.FC = () => {
  const { user } = useAuthContext();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    application_updates: true,
    deadline_reminders: true,
    decision_notifications: true,
    system_notifications: true,
    reminder_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile?.notification_preferences) {
        setPreferences(prev => ({
          ...prev,
          ...profile.notification_preferences
        }));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const sendTestNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('notification-service', {
        body: {
          action: 'send',
          type: 'email',
          recipients: [user?.email],
          subject: 'IMS Test Notification',
          message: 'This is a test notification to verify your email settings are working correctly.',
          template: 'workflow_notification',
          data: {
            recipientName: user?.user_metadata?.first_name || 'User',
            applicationNumber: 'TEST-001',
            applicantName: 'Test Applicant',
            newStatus: 'TEST STATUS',
            notes: 'This is a test notification.',
            systemUrl: window.location.origin
          }
        }
      });

      if (error) throw error;
      
      toast.success('Test notification sent! Please check your email.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <PageTitle 
        title="Notification Preferences" 
        subName="Manage your notification settings"
      />

      <Row>
        <Col lg={8}>
          <ComponentContainerCard title="Notification Settings">
            <Form>
              {/* Delivery Methods */}
              <div className="mb-4">
                <h5 className="mb-3">Delivery Methods</h5>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="email-notifications"
                      label="Email Notifications"
                      checked={preferences.email_notifications}
                      onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                      className="mb-2"
                    />
                    <small className="text-muted">Receive notifications via email</small>
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="sms-notifications"
                      label="SMS Notifications"
                      checked={preferences.sms_notifications}
                      onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                      className="mb-2"
                      disabled
                    />
                    <small className="text-muted">SMS notifications (coming soon)</small>
                  </Col>
                </Row>
              </div>

              {/* Notification Types */}
              <div className="mb-4">
                <h5 className="mb-3">Notification Types</h5>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="application-updates"
                      label="Application Updates"
                      checked={preferences.application_updates}
                      onChange={(e) => handlePreferenceChange('application_updates', e.target.checked)}
                      className="mb-2"
                    />
                    <small className="text-muted d-block mb-3">Status changes and workflow updates</small>

                    <Form.Check
                      type="switch"
                      id="deadline-reminders"
                      label="Deadline Reminders"
                      checked={preferences.deadline_reminders}
                      onChange={(e) => handlePreferenceChange('deadline_reminders', e.target.checked)}
                      className="mb-2"
                    />
                    <small className="text-muted d-block">SLA and task deadline alerts</small>
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="decision-notifications"
                      label="Decision Notifications"
                      checked={preferences.decision_notifications}
                      onChange={(e) => handlePreferenceChange('decision_notifications', e.target.checked)}
                      className="mb-2"
                    />
                    <small className="text-muted d-block mb-3">Director and ministerial decisions</small>

                    <Form.Check
                      type="switch"
                      id="system-notifications"
                      label="System Notifications"
                      checked={preferences.system_notifications}
                      onChange={(e) => handlePreferenceChange('system_notifications', e.target.checked)}
                      className="mb-2"
                    />
                    <small className="text-muted d-block">System maintenance and updates</small>
                  </Col>
                </Row>
              </div>

              {/* Reminder Frequency */}
              <div className="mb-4">
                <h5 className="mb-3">Reminder Settings</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Reminder Frequency</Form.Label>
                      <Form.Select
                        value={preferences.reminder_frequency}
                        onChange={(e) => handlePreferenceChange('reminder_frequency', e.target.value)}
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        How often you receive reminder notifications
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Quiet Hours */}
              <div className="mb-4">
                <h5 className="mb-3">Quiet Hours</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={preferences.quiet_hours_start}
                        onChange={(e) => handlePreferenceChange('quiet_hours_start', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={preferences.quiet_hours_end}
                        onChange={(e) => handlePreferenceChange('quiet_hours_end', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <div className="mt-4">
                      <small className="text-muted">
                        During quiet hours, you'll only receive critical notifications (emergency decisions, system alerts).
                      </small>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={savePreferences}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={sendTestNotification}
                  disabled={!preferences.email_notifications}
                >
                  Send Test Email
                </Button>
              </div>
            </Form>
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Notification Guidelines</h6>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-3">
                <strong>Critical Notifications</strong> such as ministerial decisions and system emergencies will always be delivered regardless of your preferences.
              </Alert>
              
              <div className="mb-3">
                <h6>Notification Types:</h6>
                <ul className="small">
                  <li><strong>Application Updates:</strong> Status changes, assignments, document requests</li>
                  <li><strong>Deadline Reminders:</strong> SLA approaching, overdue tasks</li>
                  <li><strong>Decision Notifications:</strong> Director recommendations, ministerial decisions</li>
                  <li><strong>System Notifications:</strong> Maintenance, updates, announcements</li>
                </ul>
              </div>

              <div className="mb-3">
                <h6>Email Setup:</h6>
                <p className="small text-muted">
                  Make sure your email address is up to date in your profile settings. 
                  Check your spam folder if you don't receive test notifications.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">Quick Stats</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Email Enabled:</span>
                <span className={preferences.email_notifications ? 'text-success' : 'text-muted'}>
                  {preferences.email_notifications ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Frequency:</span>
                <span className="text-muted">{preferences.reminder_frequency}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Quiet Hours:</span>
                <span className="text-muted">
                  {preferences.quiet_hours_start} - {preferences.quiet_hours_end}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NotificationPreferencesPage;