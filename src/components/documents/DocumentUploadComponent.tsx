import React, { useState, useCallback } from 'react'
import { Card, Col, Row, Button, Form, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { documentService } from '@/services/edgeFunctionServices'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface DocumentUploadComponentProps {
  applicationId: string
  onDocumentUploaded?: () => void
}

interface Document {
  id: string
  document_type: string
  document_name: string
  file_name: string
  file_size: number
  verification_status: string
  upload_date: string
  verified_at?: string
  verified_by?: string
  verification_notes?: string
}

const REQUIRED_DOCUMENTS = [
  { type: 'NATIONAL_ID', name: 'Nationale verklaring + uittreksel', required: true },
  { type: 'FAMILY_EXTRACT', name: 'Gezinsuittreksel', required: true },
  { type: 'ID_COPIES', name: 'ID kopieën (all household members)', required: true },
  { type: 'PLOT_MAP', name: 'Perceelkaart (plot map)', required: true },
  { type: 'OWNERSHIP_DOCS', name: 'Eigendom/koopakte/beschikking', required: true },
  { type: 'PERMISSION_LETTER', name: 'Toestemmingsbrief eigenaar/SVS', required: true },
  { type: 'AOV_DECLARATION', name: 'AOV verklaring', required: true },
  { type: 'PENSION_STATEMENT', name: 'Pensioenverklaring', required: true },
  { type: 'MORTGAGE_EXTRACT', name: 'Hypotheek uittreksel', required: true },
  { type: 'PAY_SLIP', name: 'Recente loonstrook', required: true },
  { type: 'EMPLOYER_DECLARATION', name: 'Werkgeversverklaring', required: true },
  { type: 'VILLAGE_DECLARATION', name: 'Dorpsverklaring / DC-verklaring', required: true },
]

const DocumentUploadComponent: React.FC<DocumentUploadComponentProps> = ({
  applicationId,
  onDocumentUploaded
}) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const result = await documentService.listDocuments({ application_id: applicationId })
      setDocuments(result.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    }
  }, [applicationId])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, images, Word documents, and text files are allowed')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType) {
      toast.error('Please select a document type and file')
      return
    }

    setIsUploading(true)
    try {
      // First generate upload URL
      const uploadUrlResult = await documentService.generateUploadUrl({
        application_id: applicationId,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type
      })

      // Upload file to storage
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch(uploadUrlResult.upload_url, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      // Create document record
      const documentType = REQUIRED_DOCUMENTS.find(doc => doc.type === selectedDocumentType)
      await documentService.uploadDocument({
        application_id: applicationId,
        document_type: selectedDocumentType,
        document_name: documentType?.name || selectedDocumentType,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        is_required: documentType?.required || false,
      })

      toast.success('Document uploaded successfully!')
      
      // Reset form
      setSelectedFile(null)
      setSelectedDocumentType('')
      
      // Reload documents
      await loadDocuments()
      onDocumentUploaded?.()

    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleVerifyDocument = async (documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      await documentService.verifyDocument({
        document_id: documentId,
        verification_status: status,
        verification_notes: notes
      })

      toast.success(`Document ${status.toLowerCase()} successfully`)
      await loadDocuments()
    } catch (error) {
      console.error('Verification failed:', error)
      toast.error('Failed to verify document')
    }
  }

  React.useEffect(() => {
    if (applicationId) {
      loadDocuments()
    }
  }, [applicationId, loadDocuments])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'danger',
      NEEDS_REVIEW: 'info'
    }
    return colors[status] || 'secondary'
  }

  const uploadedDocumentTypes = documents.map(doc => doc.document_type)
  const missingRequiredDocs = REQUIRED_DOCUMENTS.filter(
    doc => doc.required && !uploadedDocumentTypes.includes(doc.type)
  )

  return (
    <div>
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <IconifyIcon icon="bx:upload" className="me-2" />
                Upload Documents
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Document Type Selection */}
              <div className="mb-3">
                <Form.Label>Document Type</Form.Label>
                <Form.Select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                >
                  <option value="">Select document type...</option>
                  {REQUIRED_DOCUMENTS.map((doc) => (
                    <option
                      key={doc.type}
                      value={doc.type}
                      disabled={uploadedDocumentTypes.includes(doc.type)}
                    >
                      {doc.name} {doc.required ? '(Required)' : ''}
                      {uploadedDocumentTypes.includes(doc.type) ? ' - Already uploaded' : ''}
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* File Selection */}
              <div className="mb-3">
                <Form.Label>Select File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                />
                <Form.Text className="text-muted">
                  Accepted formats: PDF, Images, Word documents, Text files (Max 50MB)
                </Form.Text>
              </div>

              {/* Upload Button */}
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !selectedDocumentType}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="bx:upload" className="me-2" />
                    Upload Document
                  </>
                )}
              </Button>

              {/* Missing Required Documents Alert */}
              {missingRequiredDocs.length > 0 && (
                <Alert variant="warning" className="mt-3">
                  <h6>Missing Required Documents:</h6>
                  <ul className="mb-0">
                    {missingRequiredDocs.map((doc) => (
                      <li key={doc.type}>{doc.name}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <IconifyIcon icon="bx:file" className="me-2" />
                Uploaded Documents ({documents.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {documents.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <IconifyIcon icon="bx:file" className="mb-2" style={{ fontSize: '3rem' }} />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {documents.map((document) => (
                    <div key={document.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{document.document_name}</h6>
                          <p className="mb-1 text-muted small">
                            {document.file_name} ({Math.round(document.file_size / 1024)} KB)
                          </p>
                          <small className="text-muted">
                            Uploaded: {new Date(document.upload_date).toLocaleDateString()}
                          </small>
                          {document.verification_notes && (
                            <p className="mb-0 small text-muted mt-1">
                              Notes: {document.verification_notes}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          <span className={`badge bg-${getStatusColor(document.verification_status)} mb-2`}>
                            {document.verification_status}
                          </span>
                          <div>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleVerifyDocument(document.id, 'VERIFIED')}
                              disabled={document.verification_status === 'VERIFIED'}
                              className="me-1"
                            >
                              <IconifyIcon icon="bx:check" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleVerifyDocument(document.id, 'REJECTED', 'Document rejected - please resubmit')}
                              disabled={document.verification_status === 'REJECTED'}
                            >
                              <IconifyIcon icon="bx:x" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DocumentUploadComponent