import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Button, Badge, Alert, Form, Modal, Accordion } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface IncomeVerificationData {
  applicant_id: string
  application_id: string
  income_type: 'SALARY' | 'PENSION' | 'BUSINESS' | 'BENEFITS' | 'OTHER'
  amount: number
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  employer_name?: string
  position?: string
  income_period_start?: string
  income_period_end?: string
  verification_document?: string
}

interface IncomeVerificationWorkflowProps {
  applicationId: string
  applicantData: any
  onVerificationComplete?: () => void
}

const INCOME_TYPES = [
  { value: 'SALARY', label: 'Employment Salary', icon: 'bx:briefcase', required_docs: ['Pay slip', 'Employment contract', 'Bank statements'] },
  { value: 'PENSION', label: 'Pension/Retirement', icon: 'bx:user-circle', required_docs: ['Pension statement', 'AOV declaration', 'Bank statements'] },
  { value: 'BUSINESS', label: 'Business Income', icon: 'bx:store', required_docs: ['Business registration', 'Tax returns', 'Bank statements'] },
  { value: 'BENEFITS', label: 'Government Benefits', icon: 'bx:shield', required_docs: ['Benefit statement', 'Government letter', 'Bank statements'] },
  { value: 'OTHER', label: 'Other Income', icon: 'bx:money', required_docs: ['Supporting documentation', 'Bank statements'] }
]

const FREQUENCY_MULTIPLIERS = {
  WEEKLY: 52,
  MONTHLY: 12,
  YEARLY: 1
}

export const IncomeVerificationWorkflow: React.FC<IncomeVerificationWorkflowProps> = ({
  applicationId,
  applicantData,
  onVerificationComplete
}) => {
  const [incomeRecords, setIncomeRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<IncomeVerificationData>>({
    income_type: 'SALARY',
    frequency: 'MONTHLY',
    amount: 0
  })
  const [verifying, setVerifying] = useState(false)
  const [calculatedAnnual, setCalculatedAnnual] = useState(0)

  const loadIncomeRecords = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('income_records')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIncomeRecords(data || [])
    } catch (error) {
      console.error('Failed to load income records:', error)
      toast.error('Failed to load income records')
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    loadIncomeRecords()
  }, [loadIncomeRecords])

  useEffect(() => {
    // Calculate annual equivalent
    if (formData.amount && formData.frequency) {
      const multiplier = FREQUENCY_MULTIPLIERS[formData.frequency]
      setCalculatedAnnual((formData.amount || 0) * multiplier)
    }
  }, [formData.amount, formData.frequency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const recordData = {
        applicant_id: applicantData.id,
        application_id: applicationId,
        income_type: formData.income_type as string,
        amount: formData.amount || 0,
        frequency: formData.frequency as string,
        employer_name: formData.employer_name || null,
        position: formData.position || null,
        income_period_start: formData.income_period_start || null,
        income_period_end: formData.income_period_end || null,
        verification_document: formData.verification_document || null,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      }

      let error;
      if (editingRecord) {
        const result = await supabase
          .from('income_records')
          .update(recordData)
          .eq('id', editingRecord.id)
        error = result.error
      } else {
        const result = await supabase
          .from('income_records')
          .insert(recordData)
        error = result.error
      }

      if (error) throw error

      toast.success('Income record saved successfully')
      setShowModal(false)
      setEditingRecord(null)
      setFormData({ income_type: 'SALARY', frequency: 'MONTHLY', amount: 0 })
      await loadIncomeRecords()
      onVerificationComplete?.()

    } catch (error) {
      console.error('Error saving income record:', error)
      toast.error('Failed to save income record')
    } finally {
      setVerifying(false)
    }
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setFormData(record)
    setShowModal(true)
  }

  const handleDelete = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return

    try {
      const { error } = await supabase
        .from('income_records')
        .delete()
        .eq('id', recordId)

      if (error) throw error
      toast.success('Income record deleted')
      await loadIncomeRecords()
    } catch (error) {
      console.error('Error deleting income record:', error)
      toast.error('Failed to delete income record')
    }
  }

  const calculateTotalIncome = () => {
    return incomeRecords.reduce((total, record) => {
      const multiplier = FREQUENCY_MULTIPLIERS[record.frequency as keyof typeof FREQUENCY_MULTIPLIERS]
      return total + (record.amount * multiplier)
    }, 0)
  }

  const getIncomeTypeInfo = (type: string) => {
    return INCOME_TYPES.find(t => t.value === type) || INCOME_TYPES[0]
  }

  const getVerificationStatus = () => {
    const totalIncome = calculateTotalIncome()
    const hasRequiredDocs = incomeRecords.every(record => record.verification_document)
    const hasMultipleSources = incomeRecords.length > 0

    return {
      complete: hasMultipleSources && hasRequiredDocs,
      totalIncome,
      recordCount: incomeRecords.length,
      missingDocs: incomeRecords.filter(record => !record.verification_document).length
    }
  }

  const status = getVerificationStatus()

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Status Overview */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <IconifyIcon icon="bx:dollar-circle" className="me-2" />
                  Income Verification
                </h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowModal(true)}
                >
                  <IconifyIcon icon="bx:plus" className="me-1" />
                  Add Income Source
                </Button>
              </div>

              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className={`h2 mb-1 text-${status.complete ? 'success' : 'warning'}`}>
                      SRD {status.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-muted small">Total Annual Income</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-1 text-info">{status.recordCount}</div>
                    <div className="text-muted small">Income Sources</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-1 text-warning">{status.missingDocs}</div>
                    <div className="text-muted small">Missing Documentation</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <Badge bg={status.complete ? 'success' : 'warning'} className="h5 mb-1">
                      {status.complete ? 'Verified' : 'Incomplete'}
                    </Badge>
                    <div className="text-muted small">Verification Status</div>
                  </div>
                </Col>
              </Row>

              {!status.complete && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <IconifyIcon icon="bx:info-circle" className="me-2" />
                  Income verification is incomplete. All income sources must be documented and verified.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Income Records List */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Income Sources</h6>
            </Card.Header>
            <Card.Body>
              {incomeRecords.length === 0 ? (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:money" style={{ fontSize: '3rem' }} className="text-muted mb-3" />
                  <p className="text-muted">No income sources recorded yet</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Add First Income Source
                  </Button>
                </div>
              ) : (
                <Accordion>
                  {incomeRecords.map((record, index) => {
                    const typeInfo = getIncomeTypeInfo(record.income_type)
                    const annualAmount = record.amount * FREQUENCY_MULTIPLIERS[record.frequency as keyof typeof FREQUENCY_MULTIPLIERS]
                    
                    return (
                      <Accordion.Item key={record.id} eventKey={index.toString()}>
                        <Accordion.Header>
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <div className="d-flex align-items-center">
                              <IconifyIcon icon={typeInfo.icon} className="me-2" />
                              <span>{typeInfo.label}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <Badge bg="info" className="me-2">
                                SRD {record.amount.toLocaleString()}/{record.frequency.toLowerCase()}
                              </Badge>
                              <Badge bg={record.verification_document ? 'success' : 'warning'}>
                                {record.verification_document ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={8}>
                              <div className="mb-2">
                                <strong>Amount:</strong> SRD {record.amount.toLocaleString()} per {record.frequency.toLowerCase()}
                              </div>
                              <div className="mb-2">
                                <strong>Annual Equivalent:</strong> SRD {annualAmount.toLocaleString()}
                              </div>
                              {record.employer_name && (
                                <div className="mb-2">
                                  <strong>Employer:</strong> {record.employer_name}
                                </div>
                              )}
                              {record.position && (
                                <div className="mb-2">
                                  <strong>Position:</strong> {record.position}
                                </div>
                              )}
                              {record.income_period_start && record.income_period_end && (
                                <div className="mb-2">
                                  <strong>Period:</strong> {new Date(record.income_period_start).toLocaleDateString()} - {new Date(record.income_period_end).toLocaleDateString()}
                                </div>
                              )}
                              {record.verification_document && (
                                <div className="mb-2">
                                  <strong>Documentation:</strong> 
                                  <Badge bg="success" className="ms-2">{record.verification_document}</Badge>
                                </div>
                              )}
                            </Col>
                            <Col md={4}>
                              <div className="d-flex flex-column gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                >
                                  <IconifyIcon icon="bx:edit" className="me-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(record.id)}
                                >
                                  <IconifyIcon icon="bx:trash" className="me-1" />
                                  Delete
                                </Button>
                              </div>

                              <div className="mt-3">
                                <h6 className="small">Required Documents:</h6>
                                <ul className="list-unstyled small">
                                  {typeInfo.required_docs.map((doc, idx) => (
                                    <li key={idx}>
                                      <IconifyIcon icon="bx:check" className="text-muted me-1" />
                                      {doc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    )
                  })}
                </Accordion>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Income Source Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRecord ? 'Edit Income Source' : 'Add Income Source'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Income Type *</Form.Label>
                <Form.Select
                  value={formData.income_type}
                  onChange={(e) => setFormData({ ...formData, income_type: e.target.value as any })}
                  required
                >
                  {INCOME_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </Col>

              <Col md={3} className="mb-3">
                <Form.Label>Frequency *</Form.Label>
                <Form.Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  required
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Employer/Source Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.employer_name || ''}
                  onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                  placeholder="Name of employer or income source"
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Position/Role</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Job title or role"
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Period Start</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.income_period_start || ''}
                  onChange={(e) => setFormData({ ...formData, income_period_start: e.target.value })}
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Period End</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.income_period_end || ''}
                  onChange={(e) => setFormData({ ...formData, income_period_end: e.target.value })}
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Verification Document</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.verification_document || ''}
                  onChange={(e) => setFormData({ ...formData, verification_document: e.target.value })}
                  placeholder="Reference to uploaded verification document"
                />
              </Col>

              {calculatedAnnual > 0 && (
                <Col md={12}>
                  <Alert variant="info">
                    <IconifyIcon icon="bx:calculator" className="me-2" />
                    <strong>Annual Equivalent:</strong> SRD {calculatedAnnual.toLocaleString()}
                  </Alert>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={verifying}>
              {verifying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <IconifyIcon icon="bx:save" className="me-1" />
                  {editingRecord ? 'Update' : 'Save'} Income Source
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default IncomeVerificationWorkflow