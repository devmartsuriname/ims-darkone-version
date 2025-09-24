import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, Table, Form, Accordion } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface DocumentationSection {
  id: string;
  title: string;
  category: 'user' | 'technical' | 'api' | 'admin';
  status: 'complete' | 'incomplete' | 'outdated';
  lastUpdated: string;
  sections: Array<{
    name: string;
    completed: boolean;
    wordCount: number;
  }>;
}

interface TrainingModule {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'document' | 'quiz';
  targetAudience: string[];
  duration: number; // in minutes
  status: 'ready' | 'draft' | 'review';
  completionRate: number;
}

interface APIEndpoint {
  endpoint: string;
  method: string;
  description: string;
  documented: boolean;
  examples: boolean;
  tested: boolean;
}

const DocumentationPage: React.FC = () => {
  const [documentationSections, setDocumentationSections] = useState<DocumentationSection[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [generatingDocs, setGeneratingDocs] = useState(false);

  useEffect(() => {
    loadDocumentationData();
  }, []);

  const loadDocumentationData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDocumentationSections(),
        loadTrainingModules(),
        loadAPIEndpoints()
      ]);
    } catch (error) {
      console.error('Failed to load documentation data:', error);
      toast.error('Failed to load documentation data');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentationSections = async () => {
    // Simulate documentation sections
    const sections: DocumentationSection[] = [
      {
        id: 'user-guide',
        title: 'User Guide',
        category: 'user',
        status: 'complete',
        lastUpdated: '2024-01-15T10:00:00Z',
        sections: [
          { name: 'Getting Started', completed: true, wordCount: 1250 },
          { name: 'Application Intake', completed: true, wordCount: 2100 },
          { name: 'Document Upload', completed: true, wordCount: 850 },
          { name: 'Control Process', completed: true, wordCount: 1650 },
          { name: 'Review Process', completed: true, wordCount: 1400 },
          { name: 'Troubleshooting', completed: true, wordCount: 900 }
        ]
      },
      {
        id: 'admin-guide',
        title: 'Administrator Guide',
        category: 'admin',
        status: 'incomplete',
        lastUpdated: '2024-01-10T14:30:00Z',
        sections: [
          { name: 'System Setup', completed: true, wordCount: 1800 },
          { name: 'User Management', completed: true, wordCount: 1200 },
          { name: 'Security Configuration', completed: false, wordCount: 0 },
          { name: 'Backup & Recovery', completed: false, wordCount: 0 },
          { name: 'Performance Monitoring', completed: true, wordCount: 950 }
        ]
      },
      {
        id: 'technical-docs',
        title: 'Technical Documentation',
        category: 'technical',
        status: 'incomplete',
        lastUpdated: '2024-01-12T09:15:00Z',
        sections: [
          { name: 'Architecture Overview', completed: true, wordCount: 2500 },
          { name: 'Database Schema', completed: true, wordCount: 1800 },
          { name: 'API Reference', completed: false, wordCount: 0 },
          { name: 'Deployment Guide', completed: true, wordCount: 1600 },
          { name: 'Development Setup', completed: true, wordCount: 1100 }
        ]
      },
      {
        id: 'api-docs',
        title: 'API Documentation',
        category: 'api',
        status: 'outdated',
        lastUpdated: '2024-01-05T16:20:00Z',
        sections: [
          { name: 'Authentication', completed: true, wordCount: 800 },
          { name: 'Application Endpoints', completed: true, wordCount: 1500 },
          { name: 'User Management', completed: false, wordCount: 0 },
          { name: 'File Upload', completed: true, wordCount: 650 },
          { name: 'Workflow API', completed: false, wordCount: 0 }
        ]
      }
    ];
    setDocumentationSections(sections);
  };

  const loadTrainingModules = async () => {
    // Simulate training modules
    const modules: TrainingModule[] = [
      {
        id: 'basic-usage',
        title: 'Basic System Usage',
        type: 'video',
        targetAudience: ['staff', 'front_office'],
        duration: 45,
        status: 'ready',
        completionRate: 85
      },
      {
        id: 'control-process',
        title: 'Control Visit Process',
        type: 'interactive',
        targetAudience: ['control'],
        duration: 60,
        status: 'ready',
        completionRate: 92
      },
      {
        id: 'review-workflow',
        title: 'Review & Decision Workflow',
        type: 'document',
        targetAudience: ['director', 'minister'],
        duration: 30,
        status: 'review',
        completionRate: 67
      },
      {
        id: 'admin-training',
        title: 'System Administration',
        type: 'video',
        targetAudience: ['admin', 'it'],
        duration: 90,
        status: 'draft',
        completionRate: 45
      },
      {
        id: 'security-quiz',
        title: 'Security Best Practices',
        type: 'quiz',
        targetAudience: ['admin', 'it', 'staff'],
        duration: 20,
        status: 'ready',
        completionRate: 78
      }
    ];
    setTrainingModules(modules);
  };

  const loadAPIEndpoints = async () => {
    // Simulate API endpoints documentation status
    const endpoints: APIEndpoint[] = [
      {
        endpoint: '/api/applications',
        method: 'GET',
        description: 'List applications with filtering',
        documented: true,
        examples: true,
        tested: true
      },
      {
        endpoint: '/api/applications',
        method: 'POST',
        description: 'Create new application',
        documented: true,
        examples: true,
        tested: true
      },
      {
        endpoint: '/api/applications/:id/transition',
        method: 'POST',
        description: 'Transition application state',
        documented: true,
        examples: false,
        tested: true
      },
      {
        endpoint: '/api/users',
        method: 'GET',
        description: 'List system users',
        documented: false,
        examples: false,
        tested: true
      },
      {
        endpoint: '/api/documents/upload',
        method: 'POST',
        description: 'Upload application documents',
        documented: true,
        examples: true,
        tested: false
      },
      {
        endpoint: '/api/reports/workflow',
        method: 'GET',
        description: 'Generate workflow reports',
        documented: false,
        examples: false,
        tested: false
      }
    ];
    setApiEndpoints(endpoints);
  };

  const generateDocumentation = async (sectionId: string) => {
    setGeneratingDocs(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'generate_documentation',
          section_id: sectionId
        }
      });

      if (error) throw error;
      
      toast.success('Documentation generated successfully');
      await loadDocumentationSections();
    } catch (error) {
      console.error('Documentation generation failed:', error);
      toast.error('Documentation generation failed');
    } finally {
      setGeneratingDocs(false);
    }
  };

  const exportDocumentation = async (format: 'pdf' | 'html' | 'markdown') => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'export_documentation',
          format: format,
          category: selectedCategory
        }
      });

      if (error) throw error;
      
      toast.success(`Documentation exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Documentation export failed:', error);
      toast.error('Documentation export failed');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      complete: 'success',
      incomplete: 'warning',
      outdated: 'danger',
      ready: 'success',
      draft: 'secondary',
      review: 'warning'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      video: 'bi-play-circle',
      interactive: 'bi-mouse',
      document: 'bi-file-text',
      quiz: 'bi-question-circle'
    };
    return icons[type as keyof typeof icons] || 'bi-file';
  };

  const getCompletionStats = (sections: DocumentationSection[]) => {
    const allSections = sections.flatMap(doc => doc.sections);
    const completed = allSections.filter(section => section.completed).length;
    const total = allSections.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const filteredSections = selectedCategory === 'all' 
    ? documentationSections 
    : documentationSections.filter(section => section.category === selectedCategory);

  const stats = getCompletionStats(documentationSections);

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
        title="Documentation & Training" 
        subName="Comprehensive Documentation & Training Materials"
      />

      {/* Documentation Overview */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{stats.percentage}%</div>
                <p className="text-muted mb-0">Documentation Complete</p>
              </div>
              <div className="mb-3">
                <small className="text-muted">
                  {stats.completed} of {stats.total} sections completed
                </small>
              </div>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => generateDocumentation('all')}
                  disabled={generatingDocs}
                >
                  {generatingDocs ? 'Generating...' : 'Generate Missing Docs'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadDocumentationData}
                >
                  Refresh Status
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard id="documentation-filters" title="Documentation Categories">
            <Row className="align-items-center">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Filter by Category</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="user">User Documentation</option>
                    <option value="admin">Administrator Guide</option>
                    <option value="technical">Technical Documentation</option>
                    <option value="api">API Documentation</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Label>Export Documentation</Form.Label>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => exportDocumentation('pdf')}
                  >
                    PDF
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => exportDocumentation('html')}
                  >
                    HTML
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => exportDocumentation('markdown')}
                  >
                    Markdown
                  </Button>
                </div>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Documentation Sections */}
      <Row className="mb-4">
        <Col lg={8}>
          <ComponentContainerCard id="documentation-sections" title="Documentation Status">
            <Accordion>
              {filteredSections.map((section, index) => (
                <Accordion.Item key={section.id} eventKey={index.toString()}>
                  <Accordion.Header>
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <div className="d-flex align-items-center">
                        <strong>{section.title}</strong>
                        <Badge bg={getStatusColor(section.status)} className="ms-2">
                          {section.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          {section.sections.filter(s => s.completed).length} / {section.sections.length} sections
                        </small>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="mb-3">
                      <small className="text-muted">
                        Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                      </small>
                    </div>
                    <Table responsive size="sm">
                      <thead>
                        <tr>
                          <th>Section</th>
                          <th>Status</th>
                          <th>Word Count</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.sections.map((subsection, subIndex) => (
                          <tr key={subIndex}>
                            <td>{subsection.name}</td>
                            <td>
                              <Badge bg={subsection.completed ? 'success' : 'warning'}>
                                {subsection.completed ? 'Complete' : 'Incomplete'}
                              </Badge>
                            </td>
                            <td>{subsection.wordCount.toLocaleString()}</td>
                            <td>
                              {!subsection.completed && (
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  onClick={() => generateDocumentation(`${section.id}-${subIndex}`)}
                                >
                                  Generate
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <ComponentContainerCard id="training-modules" title="Training Modules">
            {trainingModules.map((module, index) => (
              <Card key={index} className="mb-3 border-0">
                <Card.Body className="py-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <i className={`bi ${getTypeIcon(module.type)} me-2`}></i>
                      <h6 className="mb-0">{module.title}</h6>
                    </div>
                    <Badge bg={getStatusColor(module.status)}>
                      {module.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Duration: {module.duration} minutes
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Audience: {module.targetAudience.join(', ')}
                    </small>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <small>Completion Rate</small>
                      <small>{module.completionRate}%</small>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${module.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  {module.status === 'ready' && (
                    <Button size="sm" variant="outline-primary" className="w-100">
                      Launch Training
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ))}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* API Documentation */}
      <Row>
        <Col>
          <ComponentContainerCard id="api-documentation" title="API Documentation Status">
            <Alert variant="info" className="mb-3">
              <strong>API Documentation:</strong> Track documentation coverage for all API endpoints
            </Alert>

            <Table responsive>
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Description</th>
                  <th>Documented</th>
                  <th>Examples</th>
                  <th>Tested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td>
                      <code>{endpoint.endpoint}</code>
                    </td>
                    <td>
                      <Badge bg="secondary">{endpoint.method}</Badge>
                    </td>
                    <td>{endpoint.description}</td>
                    <td>
                      <Badge bg={endpoint.documented ? 'success' : 'danger'}>
                        {endpoint.documented ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={endpoint.examples ? 'success' : 'danger'}>
                        {endpoint.examples ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={endpoint.tested ? 'success' : 'danger'}>
                        {endpoint.tested ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>
                      {(!endpoint.documented || !endpoint.examples) && (
                        <Button size="sm" variant="outline-primary">
                          Generate Docs
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentationPage;