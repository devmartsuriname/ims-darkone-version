import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Alert, Badge, Table, Button } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';

interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
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
  connectionPool: number;
  queryPerformance: number;
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
        metric: 'First Contentful Paint',
        value: 1.2,
        unit: 's',
        status: 'good',
        target: 1.5,
        description: 'Time until first content is rendered'
      },
      {
        metric: 'Largest Contentful Paint',
        value: 2.1,
        unit: 's',
        status: 'good',
        target: 2.5,
        description: 'Time until largest content element is rendered'
      },
      {
        metric: 'Cumulative Layout Shift',
        value: 0.05,
        unit: '',
        status: 'excellent',
        target: 0.1,
        description: 'Visual stability of the page'
      },
      {
        metric: 'Time to Interactive',
        value: 2.8,
        unit: 's',
        status: 'warning',
        target: 2.5,
        description: 'Time until page is fully interactive'
      },
      {
        metric: 'Bundle Size',
        value: 1.8,
        unit: 'MB',
        status: 'good',
        target: 2.0,
        description: 'Total JavaScript bundle size'
      }
    ];
    setPerformanceMetrics(metrics);
  };

  const loadBundleAnalysis = async () => {
    // Simulate bundle analysis
    const analysis: BundleAnalysis = {
      totalSize: 1834567,
      gzippedSize: 456789,
      chunks: [
        { name: 'vendor', size: 890234, percentage: 48.5 },
        { name: 'main', size: 345678, percentage: 18.8 },
        { name: 'components', size: 234567, percentage: 12.8 },
        { name: 'pages', size: 156789, percentage: 8.5 },
        { name: 'utils', size: 87654, percentage: 4.8 },
        { name: 'assets', size: 119645, percentage: 6.5 }
      ]
    };
    setBundleAnalysis(analysis);
  };

  const loadDatabaseMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check', {
        body: { action: 'database_performance' }
      });

      if (error) throw error;

      setDbMetrics(data.metrics || {
        connectionPool: 85,
        queryPerformance: 92,
        indexUsage: 88,
        cacheHitRate: 95
      });
    } catch (error) {
      console.error('Failed to load database metrics:', error);
      // Use mock data on error
      setDbMetrics({
        connectionPool: 85,
        queryPerformance: 92,
        indexUsage: 88,
        cacheHitRate: 95
      });
    }
  };

  const runOptimization = async (type: string) => {
    setOptimizing(true);
    try {
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'optimize',
          type: type
        }
      });

      if (error) throw error;
      
      toast.success(`${type} optimization completed successfully`);
      await loadPerformanceData();
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    const colors = {
      excellent: 'success',
      good: 'info',
      warning: 'warning',
      critical: 'danger'
    };
    return colors[status];
  };

  const getStatusVariant = (status: PerformanceMetric['status']) => {
    const variants = {
      excellent: 'success',
      good: 'primary',
      warning: 'warning',
      critical: 'danger'
    };
    return variants[status];
  };

  const formatSize = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
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
        subName="System Performance Analysis & Optimization"
      />

      {/* Performance Overview */}
      <Row className="mb-4">
        <Col lg={8}>
          <ComponentContainerCard id="performance-metrics" title="Core Web Vitals & Performance Metrics">
            <Row>
              {performanceMetrics.map((metric, index) => (
                <Col lg={6} key={index} className="mb-4">
                  <Card className="border-0 h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{metric.metric}</h6>
                        <Badge bg={getStatusVariant(metric.status)}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <span className="h4 text-primary">{metric.value}</span>
                        <span className="text-muted">{metric.unit}</span>
                        <small className="text-muted ms-2">/ {metric.target}{metric.unit}</small>
                      </div>
                      <ProgressBar 
                        now={Math.min((metric.value / metric.target) * 100, 100)} 
                        variant={getStatusColor(metric.status)}
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
              <h6 className="mb-0">Performance Score</h6>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="h1 text-success mb-1">87</div>
                <p className="text-muted mb-0">Overall Performance Score</p>
              </div>
              <ProgressBar now={87} variant="success" className="mb-3" />
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => runOptimization('performance')}
                  disabled={optimizing}
                >
                  {optimizing ? 'Optimizing...' : 'Run Optimization'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={loadPerformanceData}
                  disabled={optimizing}
                >
                  Refresh Metrics
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bundle Analysis */}
      {bundleAnalysis && (
        <Row className="mb-4">
          <Col lg={6}>
            <ComponentContainerCard id="bundle-analysis" title="Bundle Analysis">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Total Bundle Size:</span>
                  <strong>{formatSize(bundleAnalysis.totalSize)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Gzipped Size:</span>
                  <strong className="text-success">{formatSize(bundleAnalysis.gzippedSize)}</strong>
                </div>
              </div>

              <Table responsive size="sm">
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
                        <Badge bg={chunk.percentage > 40 ? 'warning' : 'secondary'}>
                      {chunk.percentage.toFixed(1)}%
                    </Badge>
                  </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Alert variant="info" className="mt-3">
                <small>
                  <strong>Recommendation:</strong> Consider code splitting for chunks larger than 30% of total bundle size.
                </small>
              </Alert>
            </ComponentContainerCard>
          </Col>

          <Col lg={6}>
            {dbMetrics && (
              <ComponentContainerCard id="database-metrics" title="Database Performance">
                <Row>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="h4 text-primary mb-1">{dbMetrics.connectionPool}%</div>
                      <p className="text-muted mb-0">Connection Pool</p>
                      <ProgressBar now={dbMetrics.connectionPool} variant={dbMetrics.connectionPool > 90 ? 'danger' : 'primary'} />
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="h4 text-success mb-1">{dbMetrics.queryPerformance}%</div>
                      <p className="text-muted mb-0">Query Performance</p>
                      <ProgressBar now={dbMetrics.queryPerformance} variant="success" />
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="h4 text-info mb-1">{dbMetrics.indexUsage}%</div>
                      <p className="text-muted mb-0">Index Usage</p>
                      <ProgressBar now={dbMetrics.indexUsage} variant="info" />
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="h4 text-warning mb-1">{dbMetrics.cacheHitRate}%</div>
                      <p className="text-muted mb-0">Cache Hit Rate</p>
                      <ProgressBar now={dbMetrics.cacheHitRate} variant="warning" />
                    </div>
                  </Col>
                </Row>

                <div className="d-grid gap-2 mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => runOptimization('database')}
                    disabled={optimizing}
                  >
                    Optimize Database
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => runOptimization('cache')}
                    disabled={optimizing}
                  >
                    Clear & Rebuild Cache
                  </Button>
                </div>
              </ComponentContainerCard>
            )}
          </Col>
        </Row>
      )}

      {/* Optimization Recommendations */}
      <Row>
        <Col>
          <ComponentContainerCard id="optimization-recommendations" title="Optimization Recommendations">
            <Alert variant="info" className="mb-3">
              <strong>Performance Insights:</strong> Based on current metrics analysis
            </Alert>

            <Table responsive>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Issue</th>
                  <th>Impact</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bundle Size</td>
                  <td>Large vendor chunk (48.5%)</td>
                  <td>
                    <Badge bg="warning">Medium</Badge>
                  </td>
                  <td>Implement dynamic imports and code splitting</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('code_splitting')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Time to Interactive</td>
                  <td>TTI exceeds target (2.8s &gt; 2.5s)</td>
                  <td>
                    <Badge bg="warning">Medium</Badge>
                  </td>
                  <td>Lazy load non-critical components</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('lazy_loading')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>High connection pool usage (85%)</td>
                  <td>
                    <Badge bg="warning">Medium</Badge>
                  </td>
                  <td>Optimize query patterns and add connection pooling</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('db_optimization')}>
                      Apply
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Images</td>
                  <td>Unoptimized image assets</td>
                  <td>
                    <Badge bg="secondary">Low</Badge>
                  </td>
                  <td>Implement image compression and WebP format</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => runOptimization('image_optimization')}>
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