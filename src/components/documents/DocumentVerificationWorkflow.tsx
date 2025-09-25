import React, { useState, useCallback, useEffect } from 'react'
import { Card, Row, Col, Button, Form, Badge, Modal, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { documentService } from '@/services/edgeFunctionServices'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface DocumentVerificationWorkflowProps {
  applicationId: string
  onVerificationComplete?: () => void
}

interface Document {
  id: string
  document_type: string
  document_name: string
  file_name: string
  file_size: number
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW'
  upload_date: string
  verified_at?: string
  verified_by?: string
  verification_notes?: string
  is_required: boolean
  file_path?: string
}


const REQUIRED_DOCUMENTS = [
  { type: 'NATIONAL_ID', name: 'Nationale verklaring + uittreksel', critical: true },
  { type: 'FAMILY_EXTRACT', name: 'Gezinsuittreksel', critical: true },
  { type: 'ID_COPIES', name: 'ID kopieën (all household members)', critical: true },
  { type: 'PLOT_MAP', name: 'Perceelkaart (plot map)', critical: true },
  { type: 'OWNERSHIP_DOCS', name: 'Eigendom/koopakte/beschikking', critical: true },
  { type: 'PERMISSION_LETTER', name: 'Toestemmingsbrief eigenaar/SVS', critical: false },
  { type: 'AOV_DECLARATION', name: 'AOV verklaring', critical: true },
  { type: 'PENSION_STATEMENT', name: 'Pensioenverklaring', critical: true },
  { type: 'MORTGAGE_EXTRACT', name: 'Hypotheek uittreksel', critical: false },
  { type: 'PAY_SLIP', name: 'Recente loonstrook', critical: true },
  { type: 'EMPLOYER_DECLARATION', name: 'Werkgeversverklaring', critical: true },
  { type: 'VILLAGE_DECLARATION', name: 'Dorpsverklaring / DC-verklaring', critical: true },
]

export const DocumentVerificationWorkflow: React.FC<DocumentVerificationWorkflowProps> = ({
  applicationId,
  onVerificationComplete
}) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [processingBulk, setProcessingBulk] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<{
    action: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW'
    notes: string
  }>({ action: 'VERIFIED', notes: '' })
  

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const result = await documentService.listDocuments({ application_id: applicationId })
      setDocuments(result.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    if (applicationId) {
      loadDocuments()
    }
  }, [applicationId, loadDocuments])

  const handleVerifyDocument = async (
    documentId: string,
    status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW',
    notes?: string
  ) => {
    try {
      await documentService.verifyDocument({
        document_id: documentId,
        verification_status: status,
        verification_notes: notes || ''
      })

      toast.success(`Document ${status.toLowerCase()} successfully`)
      await loadDocuments()
      onVerificationComplete?.()
    } catch (error) {
      console.error('Verification failed:', error)
      toast.error('Failed to verify document')
    }
  }

  const handleBulkVerification = async () => {
    if (selectedDocuments.size === 0) {
      toast.error('Please select documents to verify')
      return
    }

    setProcessingBulk(true)
    try {
      const promises = Array.from(selectedDocuments).map(documentId =>
        documentService.verifyDocument({
          document_id: documentId,
          verification_status: bulkAction.action,
          verification_notes: bulkAction.notes
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedDocuments.size} documents ${bulkAction.action.toLowerCase()} successfully`)
      
      setSelectedDocuments(new Set())
      setShowBulkModal(false)
      setBulkAction({ action: 'VERIFIED', notes: '' })
      await loadDocuments()
      onVerificationComplete?.()
    } catch (error) {
      console.error('Bulk verification failed:', error)
      toast.error('Failed to process bulk verification')
    } finally {
      setProcessingBulk(false)
    }
  }

  const handleDocumentView = async (document: Document) => {
    try {
      const downloadUrl = await documentService.generateDownloadUrl(document.id)
      // Open in new tab/window
      window.open(downloadUrl.url, '_blank')
    } catch (error) {
      console.error('Failed to generate download URL:', error)
      toast.error('Failed to view document')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'danger',
      NEEDS_REVIEW: 'info'
    }
    return colors[status] || 'secondary'
  }

  const getCompletionStats = () => {
    const totalRequired = REQUIRED_DOCUMENTS.filter(doc => doc.critical).length
    const uploadedRequired = documents.filter(doc => 
      doc.is_required && REQUIRED_DOCUMENTS.find(rd => rd.type === doc.document_type)?.critical
    ).length
    const verifiedRequired = documents.filter(doc => 
      doc.is_required && 
      doc.verification_status === 'VERIFIED' &&
      REQUIRED_DOCUMENTS.find(rd => rd.type === doc.document_type)?.critical
    ).length

    return {
      totalRequired,
      uploadedRequired,
      verifiedRequired,
      isComplete: verifiedRequired === totalRequired && uploadedRequired === totalRequired
    }
  }

  const stats = getCompletionStats()
  const pendingDocuments = documents.filter(doc => doc.verification_status === 'PENDING')
  const rejectedDocuments = documents.filter(doc => doc.verification_status === 'REJECTED')

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
      {/* Verification Status Overview */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <IconifyIcon icon="bx:shield-check" className="me-2" />
                  Document Verification Workflow
                </h5>
                {selectedDocuments.size > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowBulkModal(true)}
                  >
                    <IconifyIcon icon="bx:check-double" className="me-1" />
                    Bulk Action ({selectedDocuments.size})
                  </Button>
                )}
              </div>

              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className={`h2 mb-1 text-${stats.isComplete ? 'success' : 'warning'}`}>
                      {stats.verifiedRequired}/{stats.totalRequired}
                    </div>
                    <div className="text-muted small">Critical Documents Verified</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-1 text-info">{documents.length}</div>
                    <div className="text-muted small">Total Documents</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-1 text-warning">{pendingDocuments.length}</div>
                    <div className="text-muted small">Pending Review</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h2 mb-1 text-danger">{rejectedDocuments.length}</div>
                    <div className="text-muted small">Rejected</div>
                  </div>
                </Col>
              </Row>

              {!stats.isComplete && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <IconifyIcon icon="bx:info-circle" className="me-2" />
                  All critical documents must be verified before proceeding to director review.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Document List */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Document Verification Queue</h6>
                <Form.Check
                  type="checkbox"
                  label="Select All"
                  checked={selectedDocuments.size === documents.length && documents.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocuments(new Set(documents.map(doc => doc.id)))
                    } else {
                      setSelectedDocuments(new Set())
                    }
                  }}
                />
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {documents.length === 0 ? (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:file" style={{ fontSize: '3rem' }} className="text-muted mb-3" />
                  <p className="text-muted">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Upload Date</th>
                        <th>Verified</th>
                        <th style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedDocuments.has(document.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedDocuments)
                                if (e.target.checked) {
                                  newSelected.add(document.id)
                                } else {
                                  newSelected.delete(document.id)
                                }
                                setSelectedDocuments(newSelected)
                              }}
                            />
                          </td>
                          <td>
                            <div>
                              <h6 className="mb-1">{document.document_name}</h6>
                              <small className="text-muted">{document.file_name}</small>
                              {document.is_required && (
                                <Badge bg="info" className="ms-2">Required</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <code className="small">{document.document_type}</code>
                          </td>
                          <td>
                            <Badge bg={getStatusColor(document.verification_status)}>
                              {document.verification_status}
                            </Badge>
                          </td>
                          <td>
                            <small>{new Date(document.upload_date).toLocaleDateString()}</small>
                          </td>
                          <td>
                            {document.verified_at && (
                              <small>{new Date(document.verified_at).toLocaleDateString()}</small>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleDocumentView(document)}
                                title="View Document"
                              >
                                <IconifyIcon icon="bx:show" />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleVerifyDocument(document.id, 'VERIFIED')}
                                disabled={document.verification_status === 'VERIFIED'}
                                title="Verify"
                              >
                                <IconifyIcon icon="bx:check" />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleVerifyDocument(document.id, 'NEEDS_REVIEW', 'Requires additional review')}
                                disabled={document.verification_status === 'NEEDS_REVIEW'}
                                title="Needs Review"
                              >
                                <IconifyIcon icon="bx:time" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleVerifyDocument(document.id, 'REJECTED', 'Document does not meet requirements')}
                                disabled={document.verification_status === 'REJECTED'}
                                title="Reject"
                              >
                                <IconifyIcon icon="bx:x" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bulk Action Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Document Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have selected {selectedDocuments.size} documents.</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Action</Form.Label>
            <Form.Select
              value={bulkAction.action}
              onChange={(e) => setBulkAction({
                ...bulkAction,
                action: e.target.value as 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW'
              })}
            >
              <option value="VERIFIED">Verify All</option>
              <option value="NEEDS_REVIEW">Mark as Needs Review</option>
              <option value="REJECTED">Reject All</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={bulkAction.notes}
              onChange={(e) => setBulkAction({ ...bulkAction, notes: e.target.value })}
              placeholder="Add verification notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkVerification}
            disabled={processingBulk}
          >
            {processingBulk ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Processing...
              </>
            ) : (
              'Apply Action'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default DocumentVerificationWorkflow