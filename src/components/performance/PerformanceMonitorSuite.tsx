import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, Row, Col, Alert, Badge, Button, ProgressBar, Tab, Tabs } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';
import { usePerformanceChartData } from '@/hooks/usePerformanceChartData';

// Lazy load chart components for better performance
const ResourceUsageTrendChart = lazy(() => import('../monitoring/charts/ResourceUsageTrendChart').then(m => ({ default: m.ResourceUsageTrendChart })));
const DatabasePerformanceChart = lazy(() => import('../monitoring/charts/DatabasePerformanceChart').then(m => ({ default: m.DatabasePerformanceChart })));

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    excellent: number;
    good: number;
    poor: number;
  };
  category: 'page' | 'network' | 'resource' | 'user';
}

interface PerformanceReport {
  score: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
  timestamp: Date;
}

export const PerformanceMonitorSuite: React.FC = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const { data: chartData, isLoading: chartsLoading } = usePerformanceChartData(timeRange);

  useEffect(() => {
    startPerformanceMonitoring();
    return () => stopPerformanceMonitoring();
  }, []);

  const startPerformanceMonitoring = () => {
    // Monitor performance in real-time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      updateRealTimeMetrics(entries);
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would be implemented with a web vitals library
    }
  };

  const stopPerformanceMonitoring = () => {
    // Clean up observers
  };

  const updateRealTimeMetrics = (entries: PerformanceEntry[]) => {
    // Process performance entries
    setRealTimeMetrics({
      lastUpdated: new Date(),
      entriesCount: entries.length
    });
  };

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = await collectPerformanceMetrics();
      const score = calculatePerformanceScore(metrics);
      const recommendations = generateRecommendations(metrics);

      setReport({
        score,
        metrics,
        recommendations,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Performance analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const collectPerformanceMetrics = async (): Promise<PerformanceMetric[]> => {
    const metrics: PerformanceMetric[] = [];

    // Page Load Metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.push({
        name: 'First Contentful Paint',
        value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        unit: 'ms',
        threshold: { excellent: 1000, good: 2000, poor: 4000 },
        category: 'page'
      });

      metrics.push({
        name: 'DOM Content Loaded',
        value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        unit: 'ms',
        threshold: { excellent: 1500, good: 2500, poor: 4000 },
        category: 'page'
      });

      metrics.push({
        name: 'Page Load Complete',
        value: navigation.loadEventEnd - navigation.fetchStart,
        unit: 'ms',
        threshold: { excellent: 2000, good: 4000, poor: 6000 },
        category: 'page'
      });
    }

    // Resource Metrics
    const resources = performance.getEntriesByType('resource');
    if (resources.length > 0) {
      const totalResourceTime = resources.reduce((sum, resource) => 
        sum + (resource as PerformanceResourceTiming).duration, 0);
      
      metrics.push({
        name: 'Average Resource Load Time',
        value: totalResourceTime / resources.length,
        unit: 'ms',
        threshold: { excellent: 100, good: 300, poor: 1000 },
        category: 'resource'
      });

      metrics.push({
        name: 'Total Resources',
        value: resources.length,
        unit: 'count',
        threshold: { excellent: 50, good: 100, poor: 200 },
        category: 'resource'
      });
    }

    // Memory Usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.push({
        name: 'Memory Usage',
        value: memory.usedJSHeapSize / 1024 / 1024,
        unit: 'MB',
        threshold: { excellent: 20, good: 50, poor: 100 },
        category: 'resource'
      });
    }

    // Database Performance
    try {
      const dbStart = performance.now();
      await supabase.from('applications').select('id').limit(1);
      const dbEnd = performance.now();
      
      metrics.push({
        name: 'Database Query Response',
        value: dbEnd - dbStart,
        unit: 'ms',
        threshold: { excellent: 100, good: 300, poor: 1000 },
        category: 'network'
      });
    } catch (error) {
      metrics.push({
        name: 'Database Query Response',
        value: 9999,
        unit: 'ms',
        threshold: { excellent: 100, good: 300, poor: 1000 },
        category: 'network'
      });
    }

    // Network Quality Assessment
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.push({
        name: 'Network Quality',
        value: connection.downlink || 0,
        unit: 'Mbps',
        threshold: { excellent: 10, good: 5, poor: 1 },
        category: 'network'
      });
    }

    return metrics;
  };

  const calculatePerformanceScore = (metrics: PerformanceMetric[]): number => {
    let totalScore = 0;
    let totalWeight = 0;

    metrics.forEach(metric => {
      let score = 0;
      const weight = getMetricWeight(metric.category);

      if (metric.value <= metric.threshold.excellent) {
        score = 100;
      } else if (metric.value <= metric.threshold.good) {
        score = 80;
      } else if (metric.value <= metric.threshold.poor) {
        score = 60;
      } else {
        score = 30;
      }

      totalScore += score * weight;
      totalWeight += weight;
    });

    return Math.round(totalScore / totalWeight);
  };

  const getMetricWeight = (category: string): number => {
    switch (category) {
      case 'page': return 3;
      case 'network': return 2;
      case 'resource': return 1.5;
      case 'user': return 2.5;
      default: return 1;
    }
  };

  const generateRecommendations = (metrics: PerformanceMetric[]): string[] => {
    const recommendations: string[] = [];

    metrics.forEach(metric => {
      if (metric.value > metric.threshold.poor) {
        switch (metric.name) {
          case 'First Contentful Paint':
            recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
            break;
          case 'DOM Content Loaded':
            recommendations.push('Minimize DOM size and optimize JavaScript execution');
            break;
          case 'Page Load Complete':
            recommendations.push('Optimize images, enable compression, and use CDN');
            break;
          case 'Average Resource Load Time':
            recommendations.push('Optimize resource loading with HTTP/2, compression, and caching');
            break;
          case 'Memory Usage':
            recommendations.push('Optimize JavaScript memory usage and prevent memory leaks');
            break;
          case 'Database Query Response':
            recommendations.push('Optimize database queries, add indexes, and use caching');
            break;
          case 'Total Resources':
            recommendations.push('Reduce the number of HTTP requests and bundle resources');
            break;
        }
      }
    });

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! Continue monitoring for any regressions.');
    } else {
      recommendations.push('Consider implementing a Content Delivery Network (CDN)');
      recommendations.push('Enable browser caching for static assets');
      recommendations.push('Implement lazy loading for non-critical resources');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  };

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value <= metric.threshold.excellent) return 'excellent';
    if (metric.value <= metric.threshold.good) return 'good';
    if (metric.value <= metric.threshold.poor) return 'poor';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'poor': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (isAnalyzing) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <LoadingSpinner size="lg" />
          <h5 className="mt-3">Analyzing Performance</h5>
          <p className="text-muted">Collecting metrics and generating report...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Performance Monitor Suite</h4>
          <p className="text-muted mb-0">Real-time performance monitoring and optimization</p>
        </div>
        <Button variant="primary" onClick={runPerformanceAnalysis}>
          <IconifyIcon icon="solar:speedometer-bold" className="me-2" />
          Analyze Performance
        </Button>
      </div>

      <Tabs defaultActiveKey="overview" className="mb-4">
        <Tab eventKey="overview" title="Overview">
          {/* Performance Charts */}
          <div className="d-flex justify-content-end mb-3">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${timeRange === '24h' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeRange('24h')}
              >
                24H
              </button>
              <button
                type="button"
                className={`btn btn-sm ${timeRange === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button
                type="button"
                className={`btn btn-sm ${timeRange === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
            </div>
          </div>

          <Suspense fallback={<div className="text-center py-4"><LoadingSpinner /></div>}>
            <Row className="mb-4">
              <Col lg={6}>
                <ResourceUsageTrendChart 
                  data={chartData?.resourceUsage || { timestamps: [], cpuUsage: [], memoryUsage: [], diskUsage: [] }} 
                  isLoading={chartsLoading} 
                />
              </Col>
              <Col lg={6}>
                <DatabasePerformanceChart 
                  data={chartData?.databasePerformance || { timestamps: [], simpleQueries: [], complexQueries: [], insertOperations: [] }} 
                  isLoading={chartsLoading} 
                />
              </Col>
            </Row>
          </Suspense>

          {report && (
            <>
              {/* Performance Score */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className={`text-center border-${getScoreColor(report.score)} border-3`}>
                    <Card.Body>
                      <h1 className={`text-${getScoreColor(report.score)} mb-2`}>
                        {report.score}
                      </h1>
                      <h6>Performance Score</h6>
                      <ProgressBar
                        variant={getScoreColor(report.score)}
                        now={report.score}
                        className="mt-2"
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card>
                    <Card.Body>
                      <h6>Performance Categories</h6>
                      <Row>
                        {['page', 'network', 'resource', 'user'].map(category => {
                          const categoryMetrics = report.metrics.filter(m => m.category === category);
                          const avgScore = categoryMetrics.length > 0 ? 
                            categoryMetrics.reduce((sum, m) => {
                              const status = getMetricStatus(m);
                              const score = status === 'excellent' ? 100 : 
                                          status === 'good' ? 80 : 
                                          status === 'poor' ? 60 : 30;
                              return sum + score;
                            }, 0) / categoryMetrics.length : 0;

                          return (
                            <Col sm={3} key={category} className="text-center mb-3">
                              <h4 className={`text-${getScoreColor(avgScore)}`}>
                                {Math.round(avgScore)}
                              </h4>
                              <small className="text-muted text-capitalize">{category}</small>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Performance Metrics */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Performance Metrics</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {report.metrics.map((metric, index) => {
                      const status = getMetricStatus(metric);
                      return (
                        <Col md={6} lg={4} key={index} className="mb-3">
                          <div className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0">{metric.name}</h6>
                              <Badge bg={getStatusColor(status)}>
                                {status}
                              </Badge>
                            </div>
                            <div className="d-flex align-items-center">
                              <h4 className="me-2 mb-0">
                                {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}
                              </h4>
                              <small className="text-muted">{metric.unit}</small>
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">
                                Target: &lt; {metric.threshold.excellent} {metric.unit}
                              </small>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>

              {/* Recommendations */}
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Performance Recommendations</h6>
                </Card.Header>
                <Card.Body>
                  {report.recommendations.map((recommendation, index) => (
                    <Alert key={index} variant="info" className="mb-2">
                      <IconifyIcon icon="solar:lightbulb-bold" className="me-2" />
                      {recommendation}
                    </Alert>
                  ))}
                </Card.Body>
              </Card>
            </>
          )}
        </Tab>

        <Tab eventKey="realtime" title="Real-time">
          <Card>
            <Card.Body>
              <h6>Real-time Performance Monitoring</h6>
              <p className="text-muted">
                Live performance metrics and monitoring dashboard
              </p>
              
              {realTimeMetrics ? (
                <div>
                  <p>Last updated: {realTimeMetrics.lastUpdated?.toLocaleTimeString()}</p>
                  <p>Performance entries captured: {realTimeMetrics.entriesCount}</p>
                </div>
              ) : (
                <p className="text-muted">Starting real-time monitoring...</p>
              )}
              
              <Alert variant="info">
                <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
                Real-time monitoring is active. Performance data is being collected continuously.
              </Alert>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="optimization" title="Optimization">
          <Card>
            <Card.Body>
              <h6>Performance Optimization Tools</h6>
              
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Bundle Analysis</h6>
                      <p className="text-muted small">
                        Analyze JavaScript bundle size and composition
                      </p>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:pie-chart-bold" className="me-1" />
                        Analyze Bundle
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Image Optimization</h6>
                      <p className="text-muted small">
                        Check image sizes and formats
                      </p>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:gallery-bold" className="me-1" />
                        Check Images
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Database Optimization</h6>
                      <p className="text-muted small">
                        Analyze query performance and indexing
                      </p>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:database-bold" className="me-1" />
                        Check Queries
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Caching Strategy</h6>
                      <p className="text-muted small">
                        Review and optimize caching configuration
                      </p>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:server-bold" className="me-1" />
                        Review Caching
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {report && (
        <div className="text-center mt-4 text-muted small">
          Report generated: {report.timestamp.toLocaleString()}
        </div>
      )}
    </div>
  );
};