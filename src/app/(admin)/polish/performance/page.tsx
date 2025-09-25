import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, Table, ProgressBar } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  target: number;
  description: string;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
}

interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryPerformance: {
    avgResponseTime: number;
    slowQueries: number;
  };
  indexUsage: number;
  cacheHitRate: number;
}

const PerformanceOptimizationPage: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadBundleAnalysis(),
        loadDatabaseMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Simulate performance metrics
    const metrics: PerformanceMetric[] = [
      {
        name: 'First Contentful Paint (FCP)',
        value: 1.2,
        unit: 's',
        status: 'good',
        target: 1.8,
        description: 'Time until the first text or image is displayed'
      },
      {
        name: 'Largest Contentful Paint (LCP)',
        value: 2.1,
        unit: 's',
        status: 'good',
        target: 2.5,
        description: 'Time until the largest element is displayed'
      },
      {
        name: 'First Input Delay (FID)',
        value: 85,
        unit: 'ms',
        status: 'warning',
        target: 100,
        description: 'Time from user interaction to browser response'
      },
      {
        name: 'Cumulative Layout Shift (CLS)',
        value: 0.08,
        unit: '',
        status: 'good',
        target: 0.1,
        description: 'Visual stability of the page'
      },
      {
        name: 'Time to Interactive (TTI)',
        value: 3.2,
        unit: 's',
        status: 'warning',
        target: 3.8,
        description: 'Time until the page is fully interactive'
      },
      {
        name: 'Speed Index',
        value: 2.8,
        unit: 's',
        status: 'good',
        target: 3.4,
        description: 'How quickly content is visually displayed'
      }
    ];
    setPerformanceMetrics(metrics);
  };

  const loadBundleAnalysis = async () => {
    // Simulate bundle analysis
    const analysis: BundleAnalysis = {
      totalSize: 2847593, // bytes
      gzippedSize: 892847, // bytes
      chunks: [
        { name: 'main.js', size: 1247593, percentage: 43.8 },
        { name: 'vendor.js', size: 892847, percentage: 31.4 },
        { name: 'runtime.js', size: 124759, percentage: 4.4 },
        { name: 'polyfills.js', size: 89284, percentage: 3.1 },
        { name: 'styles.css', size: 493110, percentage: 17.3 }
      ]
    };
    setBundleAnalysis(analysis);
  };

  const loadDatabaseMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'get_database_metrics'
        }
      });

      if (error) throw error;

      const metrics: DatabaseMetrics = data || {
        connectionPool: {
          active: 12,
          idle: 8,
          total: 20
        },
        queryPerformance: {
          avgResponseTime: 45,
          slowQueries: 3
        },
        indexUsage: 92,
        cacheHitRate: 96.5
      };

      setDbMetrics(metrics);
    } catch (error) {
      console.error('Failed to load database metrics:', error);
      // Use mock data on error
      setDbMetrics({
        connectionPool: {
          active: 12,
          idle: 8,
          total: 20
        },
        queryPerformance: {
          avgResponseTime: 45,
          slowQueries: 3
        },
        indexUsage: 92,
        cacheHitRate: 96.5
      });
    }
  };

  const runOptimization = async (type: string) => {
    setOptimizing(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'run_optimization',
          type: type
        }
      });

      if (error) throw error;

      toast.success(`${type} optimization completed`);
      await loadPerformanceData();
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      good: 'success',
      warning: 'warning',
      critical: 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getStatusVariant = (status: string) => {
    const variants = {
      good: 'success',
      warning: 'warning',
      critical: 'danger'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOverallScore = () => {
    const goodMetrics = performanceMetrics.filter(m => m.status === 'good').length;
    const total = performanceMetrics.length;
    return Math.round((goodMetrics / total) * 100);
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
        title="Performance Optimization" 
        subName="Application Performance Monitoring & Optimization"
      />

      {/* Performance Overview */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="h1 text-primary mb-1">{getOverallScore()}</div>
                <p className="text-muted mb-0">Performance Score</p>
              </div>
              <div className="progress mb-3">
                <div 
                  className={`progress-bar bg-${getOverallScore() >= 90 ? 'success' : getOverallScore() >= 70 ? 'warning' : 'danger'}`}
                  style={{ width: `${getOverallScore()}%` }}
                ></div>
              </div>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => runOptimization('all')}
                  disabled={optimizing}
                >
                  {optimizing ? 'Optimizing...' : 'Run All Optimizations'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadPerformanceData}
                >
                  Refresh Metrics
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard id="performance-metrics" title="Core Web Vitals">
            <Row>
              {performanceMetrics.map((metric, index) => (
                <Col lg={4} md={6} key={index} className="mb-3">
                  <Card className="border-0 h-100">
                    <Card.Body className="text-center">
                      <div className="mb-2">
                        <Badge bg={getStatusColor(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h6 className="mb-1">{metric.name}</h6>
                      <div className="h4 text-primary mb-2">
                        {metric.value}{metric.unit}
                      </div>
                      <ProgressBar 
                        now={Math.min((metric.value / metric.target) * 100, 100)} 
                        variant={getStatusVariant(metric.status)}
                        className="mb-2"
                        style={{ height: '4px' }}
                      />
                      <small className="text-muted">
                        Target: {metric.target}{metric.unit}
                      </small>
                      <div className="mt-2">
                        <small className="text-muted">{metric.description}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Bundle Analysis */}
      <Row className="mb-4">
        <Col lg={6}>
          <ComponentContainerCard id="bundle-analysis" title="Bundle Analysis">
            {bundleAnalysis && (
              <>
                <div className="mb-3">
                  <Row>
                    <Col>
                      <div className="text-center">
                        <div className="h5">{formatSize(bundleAnalysis.totalSize)}</div>
                        <small className="text-muted">Total Bundle Size</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="text-center">
                        <div className="h5">{formatSize(bundleAnalysis.gzippedSize)}</div>
                        <small className="text-muted">Gzipped Size</small>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Table responsive>
                  <thead>
                    <tr>
                      <th>Chunk</th>
                      <th>Size</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundleAnalysis.chunks.map((chunk, index) => (
                      <tr key={index}>
                        <td>{chunk.name}</td>
                        <td>{formatSize(chunk.size)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <ProgressBar 
                              now={chunk.percentage} 
                              className="flex-grow-1 me-2"
                              style={{ height: '8px' }}
                            />
                            <small>{chunk.percentage}%</small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-grid">
                  <Button 
                    variant="outline-primary"
                    onClick={() => runOptimization('bundle')}
                    disabled={optimizing}
                  >
                    Optimize Bundle
                  </Button>
                </div>
              </>
            )}
          </ComponentContainerCard>
        </Col>

        <Col lg={6}>
          <ComponentContainerCard id="database-metrics" title="Database Performance">
            {dbMetrics && (
              <>
                <Row className="mb-3">
                  <Col>
                    <div className="text-center">
                      <div className="h5">{dbMetrics.connectionPool.active}/{dbMetrics.connectionPool.total}</div>
                      <small className="text-muted">Active Connections</small>
                      <ProgressBar 
                        now={(dbMetrics.connectionPool.active / dbMetrics.connectionPool.total) * 100}
                        variant="info"
                        className="mt-1"
                        style={{ height: '4px' }}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="text-center">
                      <div className="h5">{dbMetrics.queryPerformance.avgResponseTime}ms</div>
                      <small className="text-muted">Avg Response Time</small>
                      <ProgressBar 
                        now={Math.min(dbMetrics.queryPerformance.avgResponseTime / 100 * 100, 100)}
                        variant={dbMetrics.queryPerformance.avgResponseTime < 50 ? 'success' : 'warning'}
                        className="mt-1"
                        style={{ height: '4px' }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <div className="text-center">
                      <div className="h5">{dbMetrics.indexUsage}%</div>
                      <small className="text-muted">Index Usage</small>
                      <ProgressBar 
                        now={dbMetrics.indexUsage}
                        variant={dbMetrics.indexUsage > 90 ? 'success' : 'warning'}
                        className="mt-1"
                        style={{ height: '4px' }}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="text-center">
                      <div className="h5">{dbMetrics.cacheHitRate}%</div>
                      <small className="text-muted">Cache Hit Rate</small>
                      <ProgressBar 
                        now={dbMetrics.cacheHitRate}
                        variant={dbMetrics.cacheHitRate > 95 ? 'success' : 'warning'}
                        className="mt-1"
                        style={{ height: '4px' }}
                      />
                    </div>
                  </Col>
                </Row>

                <div className="mb-3">
                  <Alert variant="warning" className="mb-2">
                    <small>
                      <strong>Slow Queries:</strong> {dbMetrics.queryPerformance.slowQueries} queries taking over 1s
                    </small>
                  </Alert>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary"
                    onClick={() => runOptimization('database')}
                    disabled={optimizing}
                  >
                    Optimize Database
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => runOptimization('cache')}
                    disabled={optimizing}
                  >
                    Clear Cache
                  </Button>
                </div>
              </>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Optimization Recommendations */}
      <Row>
        <Col>
          <ComponentContainerCard id="optimization-recommendations" title="Optimization Recommendations">
            <Table responsive>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Priority</th>
                  <th>Impact</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>JavaScript Bundle</td>
                  <td><Badge bg="warning">Medium</Badge></td>
                  <td><Badge bg="success">High</Badge></td>
                  <td>Implement code splitting for route-based chunks</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('code-splitting')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Image Optimization</td>
                  <td><Badge bg="success">Low</Badge></td>
                  <td><Badge bg="warning">Medium</Badge></td>
                  <td>Convert images to WebP format with lazy loading</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('images')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Database Queries</td>
                  <td><Badge bg="danger">High</Badge></td>
                  <td><Badge bg="success">High</Badge></td>
                  <td>Add indexes for frequently queried columns</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('indexes')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>CSS Optimization</td>
                  <td><Badge bg="warning">Medium</Badge></td>
                  <td><Badge bg="warning">Medium</Badge></td>
                  <td>Remove unused CSS and optimize critical path</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('css')}>
                      Apply
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </ComponentContainerCard>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceOptimizationPage;