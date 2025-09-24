import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface WorkflowValidationResult {
  state: string;
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  applicationCount: number;
  averageTimeInState: number;
  slaCompliance: number;
}

interface WorkflowMetrics {
  totalApplications: number;
  completedApplications: number;
  averageProcessingTime: number;
  slaViolations: number;
  bottlenecks: string[];
}

const WorkflowValidationPage: React.FC = () => {
  const [validationResults, setValidationResults] = useState<WorkflowValidationResult[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        runWorkflowValidation(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load validation data:', error);
      toast.error('Failed to load workflow validation data');
    } finally {
      setLoading(false);
    }
  };

  const runWorkflowValidation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'validate',
          type: 'full_validation'
        }
      });

      if (error) throw error;
      setValidationResults(data.results || []);
    } catch (error) {
      console.error('Workflow validation failed:', error);
      toast.error('Workflow validation failed');
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reporting-service', {
        body: {
          action: 'get_workflow_metrics',
          period: 'last_30_days'
        }
      });

      if (error) throw error;
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast.error('Failed to load workflow metrics');
    }
  };

  const runWorkflowSimulation = async () => {
    setSimulationRunning(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'simulate',
          scenarios: [
            'peak_load',
            'sla_stress_test',
            'bottleneck_analysis'
          ]
        }
      });

      if (error) throw error;
      
      toast.success('Workflow simulation completed successfully');
      await loadValidationData(); // Refresh data after simulation
    } catch (error) {
      console.error('Workflow simulation failed:', error);
      toast.error('Workflow simulation failed');
    } finally {
      setSimulationRunning(false);
    }
  };

  const fixWorkflowIssues = async (state: string) => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'auto_fix',
          state: state
        }
      });

      if (error) throw error;
      
      toast.success(`Auto-fix applied for ${state} state`);
      await runWorkflowValidation();
    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast.error('Auto-fix failed');
    }
  };

  const getValidationStatusColor = (isValid: boolean, issueCount: number) => {
    if (isValid) return 'success';
    if (issueCount > 5) return 'danger';
    return 'warning';
  };

  const getStateHealth = (result: WorkflowValidationResult) => {
    if (result.isValid && result.slaCompliance > 90) return 'Excellent';
    if (result.isValid && result.slaCompliance > 70) return 'Good';
    if (result.issues.length < 3) return 'Fair';
    return 'Poor';
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
        title="Workflow Validation" 
        subName="End-to-End Workflow Testing & Monitoring"
      />

      {/* Metrics Overview */}
      {metrics && (
        <Row className="mb-4">
          <Col lg={3} md={6}>
            <Card className="border-0">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{metrics.totalApplications}</h3>
                <p className="text-muted mb-0">Total Applications</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">{metrics.completedApplications}</h3>
                <p className="text-muted mb-0">Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">{metrics.averageProcessingTime}d</h3>
                <p className="text-muted mb-0">Avg Processing Time</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0">
              <Card.Body className="text-center">
                <h3 className={`mb-1 ${metrics.slaViolations > 10 ? 'text-danger' : 'text-warning'}`}>
                  {metrics.slaViolations}
                </h3>
                <p className="text-muted mb-0">SLA Violations</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          <ComponentContainerCard id="workflow-validation" title="Workflow State Validation">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <Button 
                  variant="primary" 
                  onClick={runWorkflowValidation}
                  disabled={loading}
                  className="me-2"
                >
                  Run Validation
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={runWorkflowSimulation}
                  disabled={simulationRunning}
                >
                  {simulationRunning ? 'Running Simulation...' : 'Run Simulation'}
                </Button>
              </div>
              <Badge bg="info">
                {validationResults.filter(r => r.isValid).length} / {validationResults.length} States Valid
              </Badge>
            </div>

            {validationResults.length === 0 ? (
              <Alert variant="info">
                No validation results available. Click "Run Validation" to start testing the workflow.
              </Alert>
            ) : (
              <div className="space-y-3">
                {validationResults.map((result, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={getValidationStatusColor(result.isValid, result.issues.length)}
                          className="me-2"
                        >
                          {result.state}
                        </Badge>
                        <span className="text-muted">
                          {result.applicationCount} applications • {getStateHealth(result)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="text-muted me-2">
                          SLA: {result.slaCompliance}%
                        </span>
                        {!result.isValid && (
                          <Button 
                            size="sm" 
                            variant="outline-warning"
                            onClick={() => fixWorkflowIssues(result.state)}
                          >
                            Auto-Fix
                          </Button>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <small className="text-muted">SLA Compliance</small>
                        <ProgressBar 
                          now={result.slaCompliance} 
                          variant={result.slaCompliance > 90 ? 'success' : result.slaCompliance > 70 ? 'warning' : 'danger'}
                          className="mb-2"
                        />
                      </div>

                      {result.issues.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-danger">Issues ({result.issues.length})</h6>
                          <ul className="mb-0">
                            {result.issues.map((issue, i) => (
                              <li key={i} className="text-danger small">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.length > 0 && (
                        <div>
                          <h6 className="text-info">Recommendations</h6>
                          <ul className="mb-0">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-muted small">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Validation Controls</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={() => runWorkflowValidation()}
                  disabled={loading}
                >
                  Quick Validation
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {/* Deep validation */}}
                  disabled={loading}
                >
                  Deep Validation
                </Button>
                <Button 
                  variant="outline-info" 
                  onClick={() => {/* Performance test */}}
                  disabled={loading}
                >
                  Performance Test
                </Button>
                <Button 
                  variant="outline-warning" 
                  onClick={() => {/* Stress test */}}
                  disabled={loading}
                >
                  Stress Test
                </Button>
              </div>
            </Card.Body>
          </Card>

          {metrics?.bottlenecks && metrics.bottlenecks.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Identified Bottlenecks</h6>
              </Card.Header>
              <Card.Body>
                {metrics.bottlenecks.map((bottleneck, index) => (
                  <Alert key={index} variant="warning" className="mb-2">
                    <small>{bottleneck}</small>
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <h6 className="mb-0">Validation Health</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <div className={`h2 mb-1 ${validationResults.filter(r => r.isValid).length === validationResults.length ? 'text-success' : 'text-warning'}`}>
                    {validationResults.length > 0 ? 
                      Math.round((validationResults.filter(r => r.isValid).length / validationResults.length) * 100) : 0}%
                  </div>
                  <p className="text-muted mb-0">Overall Health</p>
                </div>
                <ProgressBar 
                  now={validationResults.length > 0 ? 
                    (validationResults.filter(r => r.isValid).length / validationResults.length) * 100 : 0} 
                  variant="success"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowValidationPage;