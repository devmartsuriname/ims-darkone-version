import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface PolishTask {
  id: string;
  category: 'performance' | 'ux' | 'security' | 'documentation' | 'accessibility';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimatedTime: number; // in minutes
  automatable: boolean;
}

interface PolishMetrics {
  overallScore: number;
  categoryScores: {
    performance: number;
    ux: number;
    security: number;
    documentation: number;
    accessibility: number;
  };
  completedTasks: number;
  totalTasks: number;
}

const ProductionPolishDashboard: React.FC = () => {
  const [polishTasks, setPolishTasks] = useState<PolishTask[]>([]);
  const [metrics, setMetrics] = useState<PolishMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingTask, setExecutingTask] = useState<string | null>(null);

  useEffect(() => {
    loadPolishData();
  }, []);

  const loadPolishData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPolishTasks(),
        calculateMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load polish data:', error);
      toast.error('Failed to load production polish data');
    } finally {
      setLoading(false);
    }
  };

  const loadPolishTasks = async () => {
    // Simulate production polish tasks
    const tasks: PolishTask[] = [
      // Performance Tasks
      {
        id: 'perf-1',
        category: 'performance',
        title: 'Optimize Bundle Size',
        description: 'Reduce JavaScript bundle size through code splitting and tree shaking',
        priority: 'high',
        status: 'pending',
        estimatedTime: 45,
        automatable: true
      },
      {
        id: 'perf-2',
        category: 'performance',
        title: 'Image Optimization',
        description: 'Convert images to WebP format and implement lazy loading',
        priority: 'medium',
        status: 'completed',
        estimatedTime: 30,
        automatable: true
      },
      {
        id: 'perf-3',
        category: 'performance',
        title: 'Database Query Optimization',
        description: 'Add indexes and optimize slow queries',
        priority: 'high',
        status: 'in_progress',
        estimatedTime: 60,
        automatable: false
      },

      // UX Tasks
      {
        id: 'ux-1',
        category: 'ux',
        title: 'Mobile Responsiveness',
        description: 'Ensure all components work perfectly on mobile devices',
        priority: 'high',
        status: 'completed',
        estimatedTime: 90,
        automatable: false
      },
      {
        id: 'ux-2',
        category: 'ux',
        title: 'Loading States',
        description: 'Add skeleton screens and loading indicators',
        priority: 'medium',
        status: 'pending',
        estimatedTime: 40,
        automatable: false
      },
      {
        id: 'ux-3',
        category: 'ux',
        title: 'Error Handling',
        description: 'Improve error messages and user feedback',
        priority: 'medium',
        status: 'pending',
        estimatedTime: 35,
        automatable: false
      },

      // Security Tasks
      {
        id: 'sec-1',
        category: 'security',
        title: 'Security Headers',
        description: 'Configure security headers (CSP, HSTS, etc.)',
        priority: 'critical',
        status: 'completed',
        estimatedTime: 20,
        automatable: true
      },
      {
        id: 'sec-2',
        category: 'security',
        title: 'Input Sanitization',
        description: 'Validate and sanitize all user inputs',
        priority: 'critical',
        status: 'completed',
        estimatedTime: 45,
        automatable: false
      },
      {
        id: 'sec-3',
        category: 'security',
        title: 'Rate Limiting',
        description: 'Implement rate limiting for API endpoints',
        priority: 'high',
        status: 'pending',
        estimatedTime: 25,
        automatable: true
      },

      // Documentation Tasks
      {
        id: 'doc-1',
        category: 'documentation',
        title: 'API Documentation',
        description: 'Complete OpenAPI specification and examples',
        priority: 'medium',
        status: 'in_progress',
        estimatedTime: 120,
        automatable: false
      },
      {
        id: 'doc-2',
        category: 'documentation',
        title: 'User Manual',
        description: 'Create comprehensive user documentation',
        priority: 'medium',
        status: 'pending',
        estimatedTime: 180,
        automatable: false
      },
      {
        id: 'doc-3',
        category: 'documentation',
        title: 'Deployment Guide',
        description: 'Document deployment and configuration procedures',
        priority: 'high',
        status: 'completed',
        estimatedTime: 90,
        automatable: false
      },

      // Accessibility Tasks
      {
        id: 'a11y-1',
        category: 'accessibility',
        title: 'Keyboard Navigation',
        description: 'Ensure all functionality is keyboard accessible',
        priority: 'high',
        status: 'completed',
        estimatedTime: 60,
        automatable: false
      },
      {
        id: 'a11y-2',
        category: 'accessibility',
        title: 'ARIA Labels',
        description: 'Add proper ARIA labels to form controls',
        priority: 'medium',
        status: 'pending',
        estimatedTime: 30,
        automatable: true
      },
      {
        id: 'a11y-3',
        category: 'accessibility',
        title: 'Color Contrast',
        description: 'Ensure WCAG AA color contrast compliance',
        priority: 'medium',
        status: 'completed',
        estimatedTime: 25,
        automatable: true
      }
    ];

    setPolishTasks(tasks);
  };

  const calculateMetrics = async () => {
    const tasks = polishTasks;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;

    const categoryScores = {
      performance: Math.round((tasks.filter(t => t.category === 'performance' && t.status === 'completed').length / 
                              tasks.filter(t => t.category === 'performance').length) * 100) || 0,
      ux: Math.round((tasks.filter(t => t.category === 'ux' && t.status === 'completed').length / 
                     tasks.filter(t => t.category === 'ux').length) * 100) || 0,
      security: Math.round((tasks.filter(t => t.category === 'security' && t.status === 'completed').length / 
                           tasks.filter(t => t.category === 'security').length) * 100) || 0,
      documentation: Math.round((tasks.filter(t => t.category === 'documentation' && t.status === 'completed').length / 
                                tasks.filter(t => t.category === 'documentation').length) * 100) || 0,
      accessibility: Math.round((tasks.filter(t => t.category === 'accessibility' && t.status === 'completed').length / 
                               tasks.filter(t => t.category === 'accessibility').length) * 100) || 0
    };

    const overallScore = Math.round((completed / total) * 100);

    setMetrics({
      overallScore,
      categoryScores,
      completedTasks: completed,
      totalTasks: total
    });
  };

  const executeTask = async (taskId: string) => {
    setExecutingTask(taskId);
    try {
      const task = polishTasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.automatable) {
        const { error } = await supabase.functions.invoke('workflow-service', {
          body: {
            action: 'execute_polish_task',
            task_id: taskId,
            category: task.category
          }
        });

        if (error) throw error;
      }

      // Update task status
      setPolishTasks(prev => 
        prev.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed' as const }
            : t
        )
      );

      toast.success(`Task "${task.title}" completed successfully`);
      await calculateMetrics();
    } catch (error) {
      console.error('Task execution failed:', error);
      toast.error('Task execution failed');
    } finally {
      setExecutingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'primary',
      critical: 'danger'
    };
    return colors[priority as keyof typeof colors] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'secondary',
      in_progress: 'warning',
      completed: 'success',
      skipped: 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      performance: 'bi-speedometer2',
      ux: 'bi-palette',
      security: 'bi-shield-check',
      documentation: 'bi-book',
      accessibility: 'bi-eye'
    };
    return icons[category as keyof typeof icons] || 'bi-gear';
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
    <div>
      {/* Overall Progress */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{metrics?.overallScore || 0}%</div>
                <p className="text-muted mb-0">Production Ready</p>
              </div>
              <ProgressBar 
                now={metrics?.overallScore || 0} 
                variant={getScoreColor(metrics?.overallScore || 0)}
                className="mb-3"
              />
              <small className="text-muted">
                {metrics?.completedTasks} of {metrics?.totalTasks} tasks completed
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Row>
            {metrics && Object.entries(metrics.categoryScores).map(([category, score]) => (
              <Col lg={2} md={4} sm={6} key={category} className="mb-3">
                <Card className="border-0 text-center h-100">
                  <Card.Body className="py-3">
                    <div className="mb-2">
                      <i className={`${getCategoryIcon(category)} text-primary`} style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="h6 mb-1">{score}%</div>
                    <small className="text-muted text-capitalize">{category}</small>
                    <ProgressBar 
                      now={score} 
                      variant={getScoreColor(score)}
                      className="mt-2"
                      style={{ height: '3px' }}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Polish Tasks */}
      <ComponentContainerCard id="polish-tasks" title="Production Polish Tasks">
        {['critical', 'high', 'medium', 'low'].map(priority => {
          const priorityTasks = polishTasks.filter(task => task.priority === priority);
          if (priorityTasks.length === 0) return null;

          return (
            <div key={priority} className="mb-4">
              <h6 className="text-primary mb-3">
                <Badge bg={getPriorityColor(priority)} className="me-2">
                  {priority.toUpperCase()}
                </Badge>
                Priority Tasks
              </h6>
              
              <Row>
                {priorityTasks.map(task => (
                  <Col lg={6} key={task.id} className="mb-3">
                    <Card className="border-0 h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            <i className={`${getCategoryIcon(task.category)} me-2 text-muted`}></i>
                            <h6 className="mb-0">{task.title}</h6>
                          </div>
                          <Badge bg={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-muted small mb-3">{task.description}</p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <small className="text-muted me-3">
                              <i className="bi-clock me-1"></i>
                              {task.estimatedTime}min
                            </small>
                            {task.automatable && (
                              <Badge bg="info" className="me-2">
                                <i className="bi-robot"></i> Auto
                              </Badge>
                            )}
                          </div>
                          
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => executeTask(task.id)}
                              disabled={executingTask === task.id}
                            >
                              {executingTask === task.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Executing...
                                </>
                              ) : (
                                'Execute'
                              )}
                            </Button>
                          )}
                          
                          {task.status === 'completed' && (
                            <Badge bg="success">
                              <i className="bi-check-circle"></i> Done
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}

        {/* Production Readiness Alert */}
        {metrics && metrics.overallScore < 80 && (
          <Alert variant="warning" className="mt-4">
            <Alert.Heading>Production Readiness Warning</Alert.Heading>
            <p className="mb-0">
              Your application score is below 80%. Please complete the high and critical priority tasks
              before deploying to production.
            </p>
          </Alert>
        )}

        {metrics && metrics.overallScore >= 95 && (
          <Alert variant="success" className="mt-4">
            <Alert.Heading>🎉 Production Ready!</Alert.Heading>
            <p className="mb-0">
              Congratulations! Your application meets all production readiness criteria.
              You can safely deploy to production.
            </p>
          </Alert>
        )}
      </ComponentContainerCard>
    </div>
  );
};

export default ProductionPolishDashboard;