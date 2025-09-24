import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import DropzoneFormInput from '@/components/from/DropzoneFormInput';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface DocumentUploadStepProps {
  applicationId: string | null;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: string;
}

interface UploadedDocument {
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: string;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ applicationId }) => {
  const { setValue } = useFormContext();
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  

  // Required documents as per PRD
  const requiredDocuments: RequiredDocument[] = [
    {
      id: 'nationale_verklaring',
      name: 'Nationale verklaring + uittreksel',
      description: 'National declaration and extract',
      required: true,
      category: 'identity',
    },
    {
      id: 'gezinsuittreksel',
      name: 'Gezinsuittreksel',
      description: 'Family extract',
      required: true,
      category: 'identity',
    },
    {
      id: 'id_copies',
      name: 'ID kopieën (all household members)',
      description: 'ID copies for all household members',
      required: true,
      category: 'identity',
    },
    {
      id: 'perceelkaart',
      name: 'Perceelkaart (plot map)',
      description: 'Plot map of the property',
      required: true,
      category: 'property',
    },
    {
      id: 'eigendom_documents',
      name: 'Eigendom/koopakte/beschikking',
      description: 'Ownership documents',
      required: true,
      category: 'property',
    },
    {
      id: 'toestemmingsbrief',
      name: 'Toestemmingsbrief eigenaar/SVS',
      description: 'Permission letter from owner/SVS',
      required: false,
      category: 'property',
    },
    {
      id: 'aov_verklaring',
      name: 'AOV verklaring',
      description: 'AOV declaration',
      required: true,
      category: 'income',
    },
    {
      id: 'pensioenverklaring',
      name: 'Pensioenverklaring',
      description: 'Pension statement',
      required: false,
      category: 'income',
    },
    {
      id: 'hypotheek_uittreksel',
      name: 'Hypotheek uittreksel',
      description: 'Mortgage statement',
      required: false,
      category: 'financial',
    },
    {
      id: 'recente_loonstrook',
      name: 'Recente loonstrook',
      description: 'Recent pay slip',
      required: true,
      category: 'income',
    },
    {
      id: 'werkgeversverklaring',
      name: 'Werkgeversverklaring',
      description: 'Employer declaration',
      required: true,
      category: 'income',
    },
    {
      id: 'dorpsverklaring',
      name: 'Dorpsverklaring / DC-verklaring',
      description: 'Village/district declaration',
      required: true,
      category: 'residence',
    },
  ];

  useEffect(() => {
    setValue('uploaded_documents', uploadedDocuments);
  }, [uploadedDocuments, setValue]);

  const handleFileUpload = async (files: File[], documentType: string) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `applications/${applicationId || 'temp'}/${documentType}/${fileName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (error) throw error;

        return {
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          verification_status: 'PENDING',
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedDocuments(prev => [...prev, ...results]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getDocumentsByCategory = (category: string) => {
    return requiredDocuments.filter(doc => doc.category === category);
  };

  const getUploadedForType = (documentType: string) => {
    return uploadedDocuments.filter(doc => doc.document_type === documentType);
  };

  const getRequiredDocumentsProgress = () => {
    const required = requiredDocuments.filter(doc => doc.required);
    const uploaded = required.filter(doc => 
      uploadedDocuments.some(up => up.document_type === doc.id)
    );
    return { uploaded: uploaded.length, total: required.length };
  };

  const progress = getRequiredDocumentsProgress();

  const renderDocumentCategory = (category: string, title: string, icon: string) => {
    const docs = getDocumentsByCategory(category);
    
    return (
      <Card className="border-0 shadow-none mb-4">
        <Card.Header className="bg-light border-0">
          <div className="d-flex align-items-center">
            <IconifyIcon icon={icon} className="me-2 text-primary" />
            <h6 className="mb-0">{title}</h6>
          </div>
        </Card.Header>
        <Card.Body>
          {docs.map((doc) => {
            const uploaded = getUploadedForType(doc.id);
            const hasUploaded = uploaded.length > 0;
            
            return (
              <div key={doc.id} className="mb-4 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">
                      {doc.name}
                      {doc.required && <span className="text-danger ms-1">*</span>}
                    </h6>
                    <p className="text-muted small mb-0">{doc.description}</p>
                  </div>
                  <div>
                    {hasUploaded ? (
                      <Badge bg="success">
                        <IconifyIcon icon="bx:check" className="me-1" />
                        {uploaded.length} uploaded
                      </Badge>
                    ) : doc.required ? (
                      <Badge bg="warning">Required</Badge>
                    ) : (
                      <Badge bg="secondary">Optional</Badge>
                    )}
                  </div>
                </div>

                <DropzoneFormInput
                  showPreview={false}
                  iconProps={{ icon: 'bx:upload', height: 24, width: 24 }}
                  text={`Upload ${doc.name}`}
                  textClassName="small"
                  className="border-dashed"
                  helpText="Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 50MB)"
                  onFileUpload={(files) => handleFileUpload(files, doc.id)}
                />

                {uploaded.map((file, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mt-2 p-2 bg-light rounded">
                    <div>
                      <small className="fw-medium">{file.file_name}</small>
                      <br />
                      <small className="text-muted">Status: {file.verification_status}</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeDocument(uploadedDocuments.indexOf(file))}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div>
      <Alert variant="info">
        <h6 className="alert-heading">
          <IconifyIcon icon="bx:info-circle" className="me-2" />
          Document Upload Requirements
        </h6>
        <p className="mb-2">
          Please upload all required documents. Files must be clear, legible, and in accepted formats.
        </p>
        <div className="progress mb-2" style={{ height: '20px' }}>
          <div
            className="progress-bar"
            style={{ width: `${(progress.uploaded / progress.total) * 100}%` }}
          >
            {progress.uploaded} of {progress.total} required documents
          </div>
        </div>
      </Alert>

      {uploading && (
        <Alert variant="info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" />
            Uploading files...
          </div>
        </Alert>
      )}

      <Row>
        <Col lg={6}>
          {renderDocumentCategory('identity', 'Identity Documents', 'bx:id-card')}
          {renderDocumentCategory('property', 'Property Documents', 'bx:home')}
        </Col>
        <Col lg={6}>
          {renderDocumentCategory('income', 'Income Documents', 'bx:money')}
          {renderDocumentCategory('financial', 'Financial Documents', 'bx:wallet')}
          {renderDocumentCategory('residence', 'Residence Documents', 'bx:map')}
        </Col>
      </Row>
    </div>
  );
};

export default DocumentUploadStep;