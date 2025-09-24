import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, Form, Table, ProgressBar } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface AccessibilityAudit {
  rule: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'pass' | 'fail' | 'warning';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  elements: number;
  recommendation: string;
}

interface UXMetric {
  metric: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface MobileOptimization {
  area: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

const UXEnhancementPage: React.FC = () => {
  const [accessibilityAudits, setAccessibilityAudits] = useState<AccessibilityAudit[]>([]);
  const [uxMetrics, setUxMetrics] = useState<UXMetric[]>([]);
  const [mobileOptimizations, setMobileOptimizations] = useState<MobileOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  useEffect(() => {
    loadUXData();
  }, []);

  const loadUXData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAccessibilityAudits(),
        loadUXMetrics(),
        loadMobileOptimizations()
      ]);
    } catch (error) {
      console.error('Failed to load UX data:', error);
      toast.error('Failed to load UX enhancement data');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessibilityAudits = async () => {
    // Simulate accessibility audit results
    const audits: AccessibilityAudit[] = [
      {
        rule: 'Color Contrast',
        level: 'AA',
        status: 'pass',
        description: 'Text has sufficient color contrast ratio',
        impact: 'high',
        elements: 247,
        recommendation: 'Maintain current contrast ratios'
      },
      {
        rule: 'Alt Text',
        level: 'A',
        status: 'warning',
        description: 'Some images missing descriptive alt text',
        impact: 'medium',
        elements: 12,
        recommendation: 'Add meaningful alt text to all images'
      },
      {
        rule: 'Keyboard Navigation',
        level: 'A',
        status: 'pass',
        description: 'All interactive elements are keyboard accessible',
        impact: 'high',
        elements: 89,
        recommendation: 'Continue following focus management best practices'
      },
      {
        rule: 'ARIA Labels',
        level: 'AA',
        status: 'fail',
        description: 'Form inputs missing proper ARIA labels',
        impact: 'medium',
        elements: 8,
        recommendation: 'Add aria-label or aria-labelledby to form controls'
      },
      {
        rule: 'Heading Structure',
        level: 'A',
        status: 'warning',
        description: 'Some pages have non-sequential heading levels',
        impact: 'low',
        elements: 5,
        recommendation: 'Ensure logical heading hierarchy (h1->h2->h3)'
      }
    ];
    setAccessibilityAudits(audits);
  };

  const loadUXMetrics = async () => {
    // Simulate UX metrics
    const metrics: UXMetric[] = [
      {
        metric: 'Task Completion Rate',
        current: 87,
        target: 95,
        unit: '%',
        trend: 'up',
        description: 'Percentage of users who complete their intended tasks'
      },
      {
        metric: 'Time to Complete Application',
        current: 12.5,
        target: 10,
        unit: 'min',
        trend: 'down',
        description: 'Average time to complete application intake'
      },
      {
        metric: 'User Error Rate',
        current: 8,
        target: 5,
        unit: '%',
        trend: 'stable',
        description: 'Percentage of user actions resulting in errors'
      },
      {
        metric: 'Form Abandonment Rate',
        current: 15,
        target: 10,
        unit: '%',
        trend: 'down',
        description: 'Percentage of users who abandon forms before completion'
      },
      {
        metric: 'System Satisfaction Score',
        current: 4.2,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        description: 'Average user satisfaction rating'
      }
    ];
    setUxMetrics(metrics);
  };

  const loadMobileOptimizations = async () => {
    // Simulate mobile optimization analysis
    const optimizations: MobileOptimization[] = [
      {
        area: 'Touch Target Size',
        score: 92,
        issues: ['Some buttons below 44px minimum size'],
        recommendations: ['Increase button padding', 'Add touch-friendly spacing']
      },
      {
        area: 'Viewport Configuration',
        score: 88,
        issues: ['Horizontal scrolling on some forms'],
        recommendations: ['Improve responsive breakpoints', 'Stack form elements on mobile']
      },
      {
        area: 'Text Readability',
        score: 95,
        issues: ['Minor font size issues on small screens'],
        recommendations: ['Increase base font size for mobile', 'Improve line spacing']
      },
      {
        area: 'Navigation Usability',
        score: 83,
        issues: ['Mobile menu could be more intuitive'],
        recommendations: ['Implement hamburger menu', 'Add breadcrumb navigation']
      }
    ];
    setMobileOptimizations(optimizations);
  };

  const runAccessibilityAudit = async () => {
    setRunningAudit(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_accessibility_audit'
        }
      });

      if (error) throw error;
      
      toast.success('Accessibility audit completed');
      await loadAccessibilityAudits();
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      toast.error('Accessibility audit failed');
    } finally {
      setRunningAudit(false);
    }
  };

  const fixAccessibilityIssue = async (rule: string) => {
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'fix_accessibility_issue',
          rule: rule
        }
      });

      if (error) throw error;
      
      toast.success(`Fixed accessibility issue: ${rule}`);
      await loadAccessibilityAudits();
    } catch (error) {
      console.error('Failed to fix accessibility issue:', error);
      toast.error('Failed to fix accessibility issue');
    }
  };

  const getStatusColor = (status: AccessibilityAudit['status']) => {
    const colors = {
      pass: 'success',
      warning: 'warning',
      fail: 'danger'
    };
    return colors[status];
  };

  const getImpactColor = (impact: AccessibilityAudit['impact']) => {
    const colors = {
      low: 'secondary',
      medium: 'warning',
      high: 'primary',
      critical: 'danger'
    };
    return colors[impact];
  };

  const getTrendIcon = (trend: UXMetric['trend']) => {
    const icons = {
      up: '↗️',
      down: '↘️',
      stable: '→'
    };
    return icons[trend];
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 80) return 'primary';
    if (score >= 60) return 'warning';
    return 'danger';
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
        title="UX Enhancement" 
        subName="User Experience & Accessibility Optimization"
      />

      {/* UX Metrics Overview */}
      <Row className="mb-4">
        <Col lg={8}>
          <ComponentContainerCard id="ux-metrics" title="User Experience Metrics">
            <Row>
              {uxMetrics.map((metric, index) => (
                <Col lg={6} key={index} className="mb-3">
                  <Card className="border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{metric.metric}</h6>
                        <span className="text-muted">{getTrendIcon(metric.trend)}</span>
                      </div>
                      <div className="d-flex align-items-baseline mb-2">
                        <span className="h4 text-primary me-1">{metric.current}</span>
                        <span className="text-muted">{metric.unit}</span>
                        <small className="text-muted ms-2">/ {metric.target}{metric.unit}</small>
                      </div>
                      <ProgressBar 
                        now={Math.min((metric.current / metric.target) * 100, 100)} 
                        variant={metric.current >= metric.target ? 'success' : 'warning'}
                        className="mb-2"
                        style={{ height: '4px' }}
                      />
                      <small className="text-muted">{metric.description}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Accessibility Settings</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="dark-mode"
                  label="Dark Mode"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Font Size: {Math.round(fontSizeMultiplier * 100)}%</Form.Label>
                <Form.Range
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  value={fontSizeMultiplier}
                  onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={runAccessibilityAudit}
                  disabled={runningAudit}
                >
                  {runningAudit ? 'Running Audit...' : 'Run Accessibility Audit'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadUXData}
                >
                  Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Accessibility Audit Results */}
      <Row className="mb-4">
        <Col lg={8}>
          <ComponentContainerCard id="accessibility-audit" title="Accessibility Audit Results">
            <div className="mb-3">
              <Alert variant="info">
                <strong>WCAG 2.1 Compliance:</strong> Following Web Content Accessibility Guidelines
              </Alert>
            </div>

            <Table responsive>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Impact</th>
                  <th>Elements</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accessibilityAudits.map((audit, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <strong>{audit.rule}</strong>
                        <div>
                          <small className="text-muted">{audit.description}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{audit.level}</Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(audit.status)}>
                        {audit.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getImpactColor(audit.impact)}>
                        {audit.impact.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{audit.elements}</td>
                    <td>
                      {audit.status !== 'pass' && (
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => fixAccessibilityIssue(audit.rule)}
                        >
                          Fix
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>

        <Col lg={4}>
          <ComponentContainerCard id="mobile-optimization" title="Mobile Optimization">
            {mobileOptimizations.map((optimization, index) => (
              <Card key={index} className="mb-3 border-0">
                <Card.Body className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{optimization.area}</h6>
                    <Badge bg={getScoreColor(optimization.score)}>
                      {optimization.score}%
                    </Badge>
                  </div>
                  <ProgressBar 
                    now={optimization.score} 
                    variant={getScoreColor(optimization.score)}
                    className="mb-2"
                    style={{ height: '4px' }}
                  />
                  {optimization.issues.length > 0 && (
                    <div className="mb-2">
                      <small className="text-danger">
                        <strong>Issues:</strong> {optimization.issues.join(', ')}
                      </small>
                    </div>
                  )}
                  <div>
                    <small className="text-muted">
                      <strong>Recommendations:</strong> {optimization.recommendations.join(', ')}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* UX Enhancement Tools */}
      <Row>
        <Col>
          <ComponentContainerCard id="ux-tools" title="UX Enhancement Tools">
            <Row>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-eye-fill text-primary" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Visual Hierarchy</h6>
                    <p className="text-muted small">Analyze and optimize visual flow</p>
                    <Button variant="outline-primary" size="sm">
                      Analyze
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-speedometer2 text-success" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Loading States</h6>
                    <p className="text-muted small">Improve perceived performance</p>
                    <Button variant="outline-success" size="sm">
                      Optimize
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Error Handling</h6>
                    <p className="text-muted small">Enhance error messages and recovery</p>
                    <Button variant="outline-warning" size="sm">
                      Improve
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body>
                    <div className="mb-3">
                      <i className="bi bi-phone text-info" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>Mobile Experience</h6>
                    <p className="text-muted small">Optimize for mobile devices</p>
                    <Button variant="outline-info" size="sm">
                      Enhance
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default UXEnhancementPage;