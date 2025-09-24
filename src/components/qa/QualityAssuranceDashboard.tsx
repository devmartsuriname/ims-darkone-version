import React, { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface QAMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coveragePercentage: number;
  regressionTests: number;
  performanceTests: number;
  securityTests: number;
  accessibilityScore: number;
}

interface QACategory {
  name: string;
  icon: string;
  color: string;
  tests: QATest[];
  metrics: {
    total: number;
    passed: number;
    failed: number;
    coverage: number;
  };
}

interface QATest {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  category: string;
  description: string;
  lastRun: Date;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const QualityAssuranceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<QAMetrics | null>(null);
  const [categories, setCategories] = useState<QACategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadQAData();
  }, []);

  const loadQAData = () => {
    // Mock QA data for the housing system
    const mockMetrics: QAMetrics = {
      totalTests: 127,
      passedTests: 118,
      failedTests: 9,
      coveragePercentage: 87.2,
      regressionTests: 45,
      performanceTests: 23,
      securityTests: 31,
      accessibilityScore: 94.5
    };

    const mockCategories: QACategory[] = [
      {
        name: 'Functional Testing',
        icon: 'solar:cog-bold',
        color: 'primary',
        metrics: { total: 45, passed: 42, failed: 3, coverage: 93.3 },
        tests: [
          {
            id: 'func-1',
            name: 'Application Creation Workflow',
            status: 'passed',
            category: 'functional',
            description: 'Test complete application creation process',
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
            duration: 4500,
            severity: 'high'
          },
          {
            id: 'func-2',
            name: 'Document Upload Validation',
            status: 'passed',
            category: 'functional',
            description: 'Verify document upload and validation process',
            lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
            duration: 2800,
            severity: 'medium'
          },
          {
            id: 'func-3',
            name: 'Workflow State Transitions',
            status: 'failed',
            category: 'functional',
            description: 'Test all workflow state changes',
            lastRun: new Date(Date.now() - 30 * 60 * 1000),
            duration: 6200,
            severity: 'critical'
          }
        ]
      },
      {
        name: 'Security Testing',
        icon: 'solar:shield-bold',
        color: 'danger',
        metrics: { total: 31, passed: 29, failed: 2, coverage: 93.5 },
        tests: [
          {
            id: 'sec-1',
            name: 'Authentication Security',
            status: 'passed',
            category: 'security',
            description: 'Verify user authentication and session management',
            lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
            duration: 3200,
            severity: 'critical'
          },
          {
            id: 'sec-2',
            name: 'Authorization Controls',
            status: 'passed',
            category: 'security',
            description: 'Test role-based access controls',
            lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000),
            duration: 5100,
            severity: 'high'
          },
          {
            id: 'sec-3',
            name: 'File Upload Security',
            status: 'failed',
            category: 'security',
            description: 'Verify secure file upload mechanisms',
            lastRun: new Date(Date.now() - 45 * 60 * 1000),
            duration: 2900,
            severity: 'high'
          }
        ]
      },
      {
        name: 'Performance Testing',
        icon: 'solar:speedometer-bold',
        color: 'success',
        metrics: { total: 23, passed: 21, failed: 2, coverage: 91.3 },
        tests: [
          {
            id: 'perf-1',
            name: 'Page Load Performance',
            status: 'passed',
            category: 'performance',
            description: 'Verify page load times under 2 seconds',
            lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
            duration: 1800,
            severity: 'medium'
          },
          {
            id: 'perf-2',
            name: 'Database Query Performance',
            status: 'passed',
            category: 'performance',
            description: 'Test database query execution times',
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
            duration: 3400,
            severity: 'medium'
          },
          {
            id: 'perf-3',
            name: 'File Upload Performance',
            status: 'failed',
            category: 'performance',
            description: 'Test large file upload performance',
            lastRun: new Date(Date.now() - 20 * 60 * 1000),
            duration: 8900,
            severity: 'low'
          }
        ]
      },
      {
        name: 'Accessibility Testing',
        icon: 'solar:accessibility-bold',
        color: 'info',
        metrics: { total: 28, passed: 26, failed: 2, coverage: 92.9 },
        tests: [
          {
            id: 'a11y-1',
            name: 'Keyboard Navigation',
            status: 'passed',
            category: 'accessibility',
            description: 'Verify all functions accessible via keyboard',
            lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
            duration: 2100,
            severity: 'medium'
          },
          {
            id: 'a11y-2',
            name: 'Screen Reader Compatibility',
            status: 'passed',
            category: 'accessibility',
            description: 'Test screen reader compatibility',
            lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000),
            duration: 4200,
            severity: 'high'
          },
          {
            id: 'a11y-3',
            name: 'Color Contrast Ratios',
            status: 'failed',
            category: 'accessibility',
            description: 'Verify WCAG color contrast requirements',
            lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
            duration: 1500,
            severity: 'medium'
          }
        ]
      }
    ];

    setMetrics(mockMetrics);
    setCategories(mockCategories);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Refresh data
    loadQAData();
    setIsRunning(false);
  };

  const runCategoryTests = async (categoryName: string) => {
    setIsRunning(true);
    setSelectedCategory(categoryName);
    
    // Simulate category test execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    loadQAData();
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return 'solar:check-circle-bold';
      case 'failed': return 'solar:close-circle-bold';
      case 'running': return 'solar:clock-circle-bold';
      case 'pending': return 'solar:clock-circle-bold';
      default: return 'solar:question-circle-bold';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-success';
      case 'failed': return 'text-danger';
      case 'running': return 'text-warning';
      case 'pending': return 'text-muted';
      default: return 'text-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-secondary';
      default: return 'bg-light';
    }
  };

  if (!metrics) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner />
          <p className="mt-2 text-muted">Loading QA metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* QA Metrics Overview */}
      <div className="col-12 mb-4">
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-primary border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Total Tests</h6>
                    <h3 className="mb-0 text-primary">{metrics.totalTests}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:test-tube-bold" className="text-primary fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-success border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Passed</h6>
                    <h3 className="mb-0 text-success">{metrics.passedTests}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:check-circle-bold" className="text-success fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-danger border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Failed</h6>
                    <h3 className="mb-0 text-danger">{metrics.failedTests}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:close-circle-bold" className="text-danger fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-info border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Coverage</h6>
                    <h3 className="mb-0 text-info">{metrics.coveragePercentage}%</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:chart-bold" className="text-info fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QA Controls */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Quality Assurance Controls</h6>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={runAllTests}
                  disabled={isRunning}
                >
                  <IconifyIcon icon="solar:play-bold" className="me-2" />
                  {isRunning ? 'Running Tests...' : 'Run All Tests'}
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={loadQAData}
                  disabled={isRunning}
                >
                  <IconifyIcon icon="solar:refresh-bold" className="me-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Categories */}
      <div className="col-12">
        <div className="row">
          {categories.map((category, index) => (
            <div key={index} className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconifyIcon 
                      icon={category.icon} 
                      className={`me-2 text-${category.color} fs-5`}
                    />
                    <h6 className="mb-0">{category.name}</h6>
                  </div>
                  <button 
                    className={`btn btn-sm btn-outline-${category.color}`}
                    onClick={() => runCategoryTests(category.name)}
                    disabled={isRunning}
                  >
                    <IconifyIcon icon="solar:play-bold" className="me-1" />
                    Run Tests
                  </button>
                </div>
                <div className="card-body">
                  {/* Category Metrics */}
                  <div className="mb-3">
                    <div className="row text-center">
                      <div className="col-3">
                        <small className="text-muted">Total</small>
                        <div className="fw-bold">{category.metrics.total}</div>
                      </div>
                      <div className="col-3">
                        <small className="text-muted">Passed</small>
                        <div className="fw-bold text-success">{category.metrics.passed}</div>
                      </div>
                      <div className="col-3">
                        <small className="text-muted">Failed</small>
                        <div className="fw-bold text-danger">{category.metrics.failed}</div>
                      </div>
                      <div className="col-3">
                        <small className="text-muted">Coverage</small>
                        <div className="fw-bold text-info">{category.metrics.coverage}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar bg-${category.color}`}
                        style={{ width: `${category.metrics.coverage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div className="test-list">
                    {category.tests.map((test) => (
                      <div key={test.id} className="border-bottom py-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <IconifyIcon 
                              icon={getStatusIcon(test.status)} 
                              className={`me-2 ${getStatusColor(test.status)}`}
                            />
                            <div>
                              <div className="fw-medium">{test.name}</div>
                              <small className="text-muted">{test.description}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${getSeverityBadge(test.severity)}`}>
                              {test.severity}
                            </span>
                            <small className="text-muted">
                              {(test.duration / 1000).toFixed(1)}s
                            </small>
                          </div>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">
                            Last run: {test.lastRun.toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Execution Status */}
      {isRunning && (
        <div className="col-12">
          <div className="card border-warning">
            <div className="card-body text-center">
              <LoadingSpinner />
              <p className="mt-2 mb-0">
                Running {selectedCategory === 'all' ? 'all tests' : `${selectedCategory} tests`}...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};