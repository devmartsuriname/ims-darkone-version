import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/useAuthContext';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Card, Row, Col, Badge, ProgressBar, Alert } from 'react-bootstrap';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'database' | 'network' | 'render' | 'memory';
  threshold?: { warning: number; critical: number };
}

interface PerformanceProfile {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  metrics: PerformanceMetric[];
  status: 'running' | 'completed' | 'failed';
}

interface SystemPerformance {
  currentLoad: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  activeConnections: number;
}

export const PerformanceProfiler: React.FC = () => {
  const { user: _user } = useAuthContext();
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<PerformanceProfile | null>(null);
  const [systemPerformance, setSystemPerformance] = useState<SystemPerformance | null>(null);
  const [isProfilerRunning, setIsProfilerRunning] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetric[]>([]);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPerformanceProfile = async (profileName: string) => {
    const newProfile: PerformanceProfile = {
      id: crypto.randomUUID(),
      name: profileName,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      metrics: [],
      status: 'running'
    };

    setCurrentProfile(newProfile);
    setIsProfilerRunning(true);
    
    // Start collecting real-time metrics
    startRealTimeMetrics();
    
    // Log profile start
    console.log(`Performance profiling started: ${profileName}`);
  };

  const stopPerformanceProfile = () => {
    if (currentProfile) {
      const endTime = new Date();
      const completedProfile: PerformanceProfile = {
        ...currentProfile,
        endTime,
        duration: endTime.getTime() - currentProfile.startTime.getTime(),
        metrics: [...realTimeMetrics],
        status: 'completed'
      };

      setProfiles(prev => [...prev, completedProfile]);
      setCurrentProfile(null);
      setIsProfilerRunning(false);
      
      // Stop collecting metrics
      stopRealTimeMetrics();
      
      console.log(`Performance profiling completed: ${currentProfile.name}`);
    }
  };

  const startRealTimeMetrics = () => {
    metricsIntervalRef.current = setInterval(() => {
      collectPerformanceMetrics();
    }, 1000); // Collect every second
  };

  const stopRealTimeMetrics = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  };

  const collectPerformanceMetrics = async () => {
    const timestamp = new Date();
    const newMetrics: PerformanceMetric[] = [];

    // Database performance metrics
    try {
      const dbStartTime = performance.now();
      await supabase.from('profiles').select('count').limit(1);
      const dbResponseTime = performance.now() - dbStartTime;
      
      newMetrics.push({
        name: 'Database Response Time',
        value: Math.round(dbResponseTime),
        unit: 'ms',
        timestamp,
        category: 'database',
        threshold: { warning: 500, critical: 1000 }
      });
    } catch (error) {
      newMetrics.push({
        name: 'Database Response Time',
        value: -1,
        unit: 'ms',
        timestamp,
        category: 'database'
      });
    }

    // Network latency test
    try {
      const networkStartTime = performance.now();
      await fetch('/vite.svg', { method: 'HEAD' });
      const networkLatency = performance.now() - networkStartTime;
      
      newMetrics.push({
        name: 'Network Latency',
        value: Math.round(networkLatency),
        unit: 'ms',
        timestamp,
        category: 'network',
        threshold: { warning: 200, critical: 500 }
      });
    } catch (error) {
      newMetrics.push({
        name: 'Network Latency',
        value: -1,
        unit: 'ms',
        timestamp,
        category: 'network'
      });
    }

    // Memory usage (if available)
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsed = memory.usedJSHeapSize / 1024 / 1024; // MB
      const memoryTotal = memory.totalJSHeapSize / 1024 / 1024; // MB
      const memoryPercent = (memoryUsed / memoryTotal) * 100;
      
      newMetrics.push({
        name: 'Memory Usage',
        value: Math.round(memoryUsed),
        unit: 'MB',
        timestamp,
        category: 'memory',
        threshold: { warning: 100, critical: 200 }
      });

      newMetrics.push({
        name: 'Memory Usage Percentage',
        value: Math.round(memoryPercent),
        unit: '%',
        timestamp,
        category: 'memory',
        threshold: { warning: 80, critical: 95 }
      });
    }

    // Render performance
    const renderMetrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (renderMetrics) {
      const domContentLoaded = renderMetrics.domContentLoadedEventEnd - renderMetrics.domContentLoadedEventStart;
      
      newMetrics.push({
        name: 'DOM Content Loaded',
        value: Math.round(domContentLoaded),
        unit: 'ms',
        timestamp,
        category: 'render',
        threshold: { warning: 1000, critical: 3000 }
      });
    }

    setRealTimeMetrics(prev => [...prev, ...newMetrics].slice(-100)); // Keep last 100 metrics
  };

  const collectSystemPerformance = async () => {
    try {
      // Simulate system performance collection
      const metrics: SystemPerformance = {
        currentLoad: Math.random() * 100,
        averageResponseTime: 150 + Math.random() * 200,
        errorRate: Math.random() * 5,
        throughput: 50 + Math.random() * 50,
        memoryUsage: 60 + Math.random() * 30,
        activeConnections: Math.floor(5 + Math.random() * 20)
      };

      setSystemPerformance(metrics);
    } catch (error) {
      console.error('Failed to collect system performance:', error);
    }
  };

  const runPerformanceTest = async (testType: string) => {
    const testName = `${testType} Performance Test`;
    startPerformanceProfile(testName);

    try {
      switch (testType) {
        case 'Database Load':
          await runDatabaseLoadTest();
          break;
        case 'API Stress':
          await runAPIStressTest();
          break;
        case 'UI Responsiveness':
          await runUIResponsivenessTest();
          break;
        default:
          await runGeneralPerformanceTest();
      }
    } catch (error) {
      console.error(`${testName} failed:`, error);
    }

    setTimeout(() => {
      stopPerformanceProfile();
    }, 10000); // Run for 10 seconds
  };

  const runDatabaseLoadTest = async () => {
    for (let i = 0; i < 10; i++) {
      await Promise.all([
        supabase.from('applications').select('*').limit(10),
        supabase.from('profiles').select('*').limit(10),
        supabase.from('documents').select('*').limit(10),
        supabase.from('user_roles').select('*').limit(10)
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const runAPIStressTest = async () => {
    const functions = ['health-check', 'reference-data'];
    
    for (let i = 0; i < 5; i++) {
      await Promise.all(
        functions.map(fn => 
          supabase.functions.invoke(fn, { body: { test: true } })
        )
      );
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const runUIResponsivenessTest = async () => {
    for (let i = 0; i < 20; i++) {
      // Simulate UI operations
      const start = performance.now();
      
      // Force a reflow
      document.body.offsetHeight;
      
      // Simulate component updates
      setRealTimeMetrics(prev => [...prev]);
      
      const duration = performance.now() - start;
      console.log(`UI operation ${i + 1}: ${duration}ms`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const runGeneralPerformanceTest = async () => {
    await Promise.all([
      runDatabaseLoadTest(),
      runAPIStressTest()
    ]);
  };

  useEffect(() => {
    collectSystemPerformance();
    const interval = setInterval(collectSystemPerformance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      stopRealTimeMetrics();
    };
  }, []);

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (!metric.threshold || metric.value === -1) return 'secondary';
    if (metric.value >= metric.threshold.critical) return 'danger';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'success';
  };

  const getSystemLoadColor = (load: number) => {
    if (load >= 90) return 'danger';
    if (load >= 70) return 'warning';
    return 'success';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Performance Profiler</h4>
        <div className="d-flex gap-2">
          {isProfilerRunning ? (
            <button 
              className="btn btn-danger"
              onClick={stopPerformanceProfile}
            >
              <IconifyIcon icon="solar:stop-bold" className="me-2" />
              Stop Profiling
            </button>
          ) : (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => runPerformanceTest('Database Load')}
              >
                <IconifyIcon icon="solar:database-bold" className="me-2" />
                DB Load Test
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => runPerformanceTest('API Stress')}
              >
                <IconifyIcon icon="solar:server-bold" className="me-2" />
                API Stress Test
              </button>
              <button 
                className="btn btn-info"
                onClick={() => runPerformanceTest('UI Responsiveness')}
              >
                <IconifyIcon icon="solar:monitor-bold" className="me-2" />
                UI Test
              </button>
            </>
          )}
        </div>
      </div>

      {/* Current Profile Status */}
      {currentProfile && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-3" />
            <div className="flex-grow-1">
              <strong>Running: {currentProfile.name}</strong>
              <div className="text-muted">
                Started: {currentProfile.startTime.toLocaleTimeString()}
                {' • '}
                Duration: {Math.round((Date.now() - currentProfile.startTime.getTime()) / 1000)}s
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* System Performance Overview */}
      {systemPerformance && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">System Performance Overview</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">System Load</div>
                      <div className="h4 mb-1">{Math.round(systemPerformance.currentLoad)}%</div>
                      <ProgressBar 
                        variant={getSystemLoadColor(systemPerformance.currentLoad)}
                        now={systemPerformance.currentLoad}
                        style={{ height: '6px' }}
                      />
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">Avg Response Time</div>
                      <div className="h4 mb-1">{Math.round(systemPerformance.averageResponseTime)}ms</div>
                      <Badge bg={systemPerformance.averageResponseTime < 500 ? 'success' : 'warning'}>
                        {systemPerformance.averageResponseTime < 500 ? 'Good' : 'Slow'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">Error Rate</div>
                      <div className="h4 mb-1">{systemPerformance.errorRate.toFixed(2)}%</div>
                      <Badge bg={systemPerformance.errorRate < 1 ? 'success' : 'danger'}>
                        {systemPerformance.errorRate < 1 ? 'Low' : 'High'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">Throughput</div>
                      <div className="h4 mb-1">{Math.round(systemPerformance.throughput)} req/s</div>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">Memory Usage</div>
                      <div className="h4 mb-1">{Math.round(systemPerformance.memoryUsage)}%</div>
                      <ProgressBar 
                        variant={getSystemLoadColor(systemPerformance.memoryUsage)}
                        now={systemPerformance.memoryUsage}
                        style={{ height: '6px' }}
                      />
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="text-center">
                      <div className="text-muted small">Active Connections</div>
                      <div className="h4 mb-1">{systemPerformance.activeConnections}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Real-time Metrics */}
      {realTimeMetrics.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Real-time Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {['database', 'network', 'memory', 'render'].map(category => {
                    const categoryMetrics = realTimeMetrics
                      .filter(m => m.category === category)
                      .slice(-5); // Last 5 metrics
                    
                    if (categoryMetrics.length === 0) return null;
                    
                    const latestMetric = categoryMetrics[categoryMetrics.length - 1];
                    
                    return (
                      <Col md={6} lg={3} key={category} className="mb-3">
                        <div className="text-center">
                          <div className="text-muted small text-capitalize">{category}</div>
                          <div className="h5 mb-1">
                            {latestMetric.name.replace(` ${category.charAt(0).toUpperCase() + category.slice(1)}`, '')}
                          </div>
                          <div className="d-flex align-items-center justify-content-center">
                            <span className="h6 mb-0 me-2">
                              {latestMetric.value === -1 ? 'Error' : `${latestMetric.value}${latestMetric.unit}`}
                            </span>
                            <Badge bg={getMetricStatus(latestMetric)}>
                              {latestMetric.value === -1 ? 'Error' : 
                               getMetricStatus(latestMetric) === 'success' ? 'Good' :
                               getMetricStatus(latestMetric) === 'warning' ? 'Warning' : 'Critical'}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Profiles History */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Performance Profiles History</h6>
            </Card.Header>
            <Card.Body>
              {profiles.length === 0 ? (
                <div className="text-center py-4">
                  <IconifyIcon icon="solar:chart-square-bold" className="fs-1 text-muted" />
                  <p className="text-muted mt-2">No performance profiles recorded yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Profile Name</th>
                        <th>Duration</th>
                        <th>Start Time</th>
                        <th>Metrics Count</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map(profile => (
                        <tr key={profile.id}>
                          <td>{profile.name}</td>
                          <td>{(profile.duration / 1000).toFixed(1)}s</td>
                          <td>{profile.startTime.toLocaleString()}</td>
                          <td>{profile.metrics.length}</td>
                          <td>
                            <Badge bg={
                              profile.status === 'completed' ? 'success' :
                              profile.status === 'failed' ? 'danger' : 'primary'
                            }>
                              {profile.status}
                            </Badge>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => console.log('Profile details:', profile)}
                            >
                              <IconifyIcon icon="solar:eye-bold" />
                            </button>
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
    </div>
  );
};