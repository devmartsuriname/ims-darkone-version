import { useState, useEffect } from 'react'
import { Card, CardBody, CardTitle, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useAuthContext } from '@/context/useAuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

const UserProfilePage = () => {
  const { profile, user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        position: profile.position || ''
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user?.id) {
        toast.error('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          department: formData.department,
          position: formData.position
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle title="My Profile" subName="Account" />

      <Row>
        <Col lg={4}>
          <Card>
            <CardBody className="text-center">
              <div className="mb-3">
                <div className="avatar avatar-xl rounded-circle bg-primary-subtle d-inline-flex align-items-center justify-content-center">
                  <IconifyIcon icon="solar:user-bold" className="fs-1 text-primary" />
                </div>
              </div>
              <h4 className="mb-1">{formData.first_name} {formData.last_name}</h4>
              <p className="text-muted mb-0">{formData.position || 'Staff Member'}</p>
              <p className="text-muted">{formData.department || 'Department'}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-3">Contact Information</CardTitle>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <IconifyIcon icon="solar:letter-outline" className="fs-18 text-muted me-2" />
                  <span className="text-muted">Email:</span>
                </div>
                <p className="mb-0">{formData.email}</p>
              </div>
              <div>
                <div className="d-flex align-items-center mb-2">
                  <IconifyIcon icon="solar:phone-outline" className="fs-18 text-muted me-2" />
                  <span className="text-muted">Phone:</span>
                </div>
                <p className="mb-0">{formData.phone || 'Not provided'}</p>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-4">Edit Profile</CardTitle>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="Enter position"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="solar:diskette-outline" className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h5" className="mb-3">Account Status</CardTitle>
              <Alert variant="success" className="mb-0">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:shield-check-outline" className="fs-3 me-3" />
                  <div>
                    <h6 className="mb-1">Account Active</h6>
                    <p className="mb-0 text-muted">Your account is in good standing</p>
                  </div>
                </div>
              </Alert>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default UserProfilePage
