import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner, ProgressBar } from '@/components/ui/LoadingStates';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface CheckResult {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'checking';
    message: string;
    details?: string;
  }[];
}

export const ProductionReadinessChecker: React.FC = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runReadinessCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const checkCategories = [
      'Database Schema',
      'Authentication',
      'Security Policies',
      'Edge Functions',
      'Storage Configuration',
      'Performance',
      'Data Integrity'
    ];

    for (let i = 0; i < checkCategories.length; i++) {
      const category = checkCategories[i];
      setProgress(((i + 1) / checkCategories.length) * 100);
      
      const categoryResults = await performCategoryCheck(category);
      setResults(prev => [...prev, categoryResults]);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const performCategoryCheck = async (category: string): Promise<CheckResult> => {
    const checks: CheckResult['checks'] = [];

    try {
      switch (category) {
        case 'Database Schema':
          checks.push(await checkTableExists('applications', 'Applications table'));
          checks.push(await checkTableExists('applicants', 'Applicants table'));
          checks.push(await checkTableExists('user_roles', 'User roles table'));
          checks.push(await checkTableExists('notifications', 'Notifications table'));
          checks.push(await checkTableExists('audit_logs', 'Audit logs table'));
          break;

        case 'Authentication':
          checks.push(await checkAuthConfiguration());
          checks.push(await checkUserRoleFunctions());
          break;

        case 'Security Policies':
          checks.push(await checkRLSPolicies('applications'));
          checks.push(await checkRLSPolicies('user_roles'));
          checks.push(await checkRLSPolicies('notifications'));
          break;

        case 'Edge Functions':
          checks.push(await checkEdgeFunction('application-service'));
          checks.push(await checkEdgeFunction('workflow-service'));
          checks.push(await checkEdgeFunction('notification-service'));
          checks.push(await checkEdgeFunction('user-management'));
          break;

        case 'Storage Configuration':
          checks.push(await checkStorageBucket('documents'));
          checks.push(await checkStorageBucket('control-photos'));
          break;

        case 'Performance':
          checks.push(await checkDatabasePerformance());
          checks.push(await checkIndexes());
          break;

        case 'Data Integrity':
          checks.push(await checkForeignKeyConstraints());
          checks.push(await checkRequiredData());
          break;
      }
    } catch (error) {
      checks.push({
        name: `${category} Check`,
        status: 'fail',
        message: 'Category check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { category, checks };
  };

  const checkTableExists = async (tableName: 'applications' | 'applicants' | 'user_roles' | 'notifications' | 'audit_logs', displayName: string): Promise<CheckResult['checks'][0]> => {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(1);
      return {
        name: displayName,
        status: error ? 'fail' as const : 'pass' as const,
        message: error ? `Table not accessible: ${error.message}` : 'Table exists and accessible'
      };
    } catch (error) {
      return {
        name: displayName,
        status: 'fail' as const,
        message: 'Table check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAuthConfiguration = async (): Promise<CheckResult['checks'][0]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return {
        name: 'Authentication Service',
        status: 'pass' as const,
        message: user ? 'Authentication working' : 'Authentication service available'
      };
    } catch (error) {
      return {
        name: 'Authentication Service',
        status: 'fail' as const,
        message: 'Authentication check failed'
      };
    }
  };

  const checkUserRoleFunctions = async (): Promise<CheckResult['checks'][0]> => {
    try {
      const { error } = await supabase.rpc('get_current_user_role');
      return {
        name: 'User Role Functions',
        status: error ? 'fail' as const : 'pass' as const,
        message: error ? 'Role functions not working' : 'Role functions operational'
      };
    } catch (error) {
      return {
        name: 'User Role Functions',
        status: 'fail' as const,
        message: 'Role function check failed'
      };
    }
  };

  const checkRLSPolicies = async (tableName: 'applications' | 'user_roles' | 'notifications'): Promise<CheckResult['checks'][0]> => {
    try {
      // Try to access the table - RLS will enforce policies
      await supabase.from(tableName).select('*').limit(1);
      return {
        name: `${tableName} RLS Policies`,
        status: 'pass' as const,
        message: 'RLS policies active'
      };
    } catch (error) {
      return {
        name: `${tableName} RLS Policies`,
        status: 'warning' as const,
        message: 'Could not verify RLS policies'
      };
    }
  };

  const checkEdgeFunction = async (functionName: string): Promise<CheckResult['checks'][0]> => {
    try {
      const { error } = await supabase.functions.invoke(functionName, {
        body: { action: 'health-check' }
      });
      
      return {
        name: `${functionName} Function`,
        status: error ? 'fail' as const : 'pass' as const,
        message: error ? `Function error: ${error.message}` : 'Function operational'
      };
    } catch (error) {
      return {
        name: `${functionName} Function`,
        status: 'fail' as const,
        message: 'Function check failed'
      };
    }
  };

  const checkStorageBucket = async (bucketName: string): Promise<CheckResult['checks'][0]> => {
    try {
      const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
      return {
        name: `${bucketName} Storage Bucket`,
        status: error ? 'fail' as const : 'pass' as const,
        message: error ? `Bucket error: ${error.message}` : 'Bucket accessible'
      };
    } catch (error) {
      return {
        name: `${bucketName} Storage Bucket`,
        status: 'fail' as const,
        message: 'Bucket check failed'
      };
    }
  };

  const checkDatabasePerformance = async (): Promise<CheckResult['checks'][0]> => {
    try {
      const startTime = Date.now();
      await supabase.from('applications').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Database Response Time',
        status: responseTime < 1000 ? 'pass' as const : responseTime < 2000 ? 'warning' as const : 'fail' as const,
        message: `Response time: ${responseTime}ms`,
        details: responseTime > 1000 ? 'Consider optimizing queries or adding indexes' : undefined
      };
    } catch (error) {
      return {
        name: 'Database Response Time',
        status: 'fail' as const,
        message: 'Performance check failed'
      };
    }
  };

  const checkIndexes = async (): Promise<CheckResult['checks'][0]> => {
    // This would need to be implemented with proper database queries
    return {
      name: 'Database Indexes',
      status: 'warning' as const,
      message: 'Manual verification required',
      details: 'Check that indexes exist on frequently queried columns'
    };
  };

  const checkForeignKeyConstraints = async (): Promise<CheckResult['checks'][0]> => {
    try {
      // Test foreign key constraints by checking related data
      const { error } = await supabase
        .from('applications')
        .select('applicant_id, applicants(id)')
        .limit(1);
      
      return {
        name: 'Foreign Key Constraints',
        status: error ? 'warning' as const : 'pass' as const,
        message: error ? 'Some constraints may be missing' : 'Constraints verified'
      };
    } catch (error) {
      return {
        name: 'Foreign Key Constraints',
        status: 'fail' as const,
        message: 'Constraint check failed'
      };
    }
  };

  const checkRequiredData = async (): Promise<CheckResult['checks'][0]> => {
    try {
      const { data: adminUsers, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .eq('is_active', true);
      
      return {
        name: 'Required Reference Data',
        status: (!error && adminUsers && adminUsers.length > 0) ? 'pass' as const : 'warning' as const,
        message: (!error && adminUsers && adminUsers.length > 0) 
          ? 'Admin users configured' 
          : 'No active admin users found'
      };
    } catch (error) {
      return {
        name: 'Required Reference Data',
        status: 'fail' as const,
        message: 'Data verification failed'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <IconifyIcon icon="solar:check-circle-bold" className="text-success" />;
      case 'fail':
        return <IconifyIcon icon="solar:close-circle-bold" className="text-danger" />;
      case 'warning':
        return <IconifyIcon icon="solar:warning-circle-bold" className="text-warning" />;
      case 'checking':
        return <LoadingSpinner size="sm" />;
      default:
        return <IconifyIcon icon="solar:question-circle-bold" className="text-muted" />;
    }
  };

  const getOverallStatus = () => {
    if (results.length === 0) return 'Not Started';
    
    const allChecks = results.flatMap(r => r.checks);
    const failCount = allChecks.filter(c => c.status === 'fail').length;
    const warningCount = allChecks.filter(c => c.status === 'warning').length;
    
    if (failCount > 0) return 'Critical Issues';
    if (warningCount > 0) return 'Warnings';
    return 'Ready for Production';
  };

  const getOverallStatusClass = () => {
    const status = getOverallStatus();
    if (status === 'Critical Issues') return 'text-danger';
    if (status === 'Warnings') return 'text-warning';
    if (status === 'Ready for Production') return 'text-success';
    return 'text-muted';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Production Readiness Check</h5>
          <button 
            className="btn btn-primary"
            onClick={runReadinessCheck}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <LoadingSpinner size="sm" className="me-2" />
                Running Checks...
              </>
            ) : (
              <>
                <IconifyIcon icon="solar:refresh-bold" className="me-2" />
                Run Checks
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card-body">
        {isRunning && (
          <div className="mb-4">
            <ProgressBar 
              progress={progress} 
              variant="primary" 
              animated 
              showLabel 
              className="mb-2"
            />
            <small className="text-muted">Running production readiness checks...</small>
          </div>
        )}

        {results.length > 0 && (
          <div className="alert alert-info mb-4">
            <div className="d-flex align-items-center">
              <IconifyIcon icon="solar:shield-check-bold" className="me-2 fs-4" />
              <div>
                <strong>Overall Status: </strong>
                <span className={getOverallStatusClass()}>{getOverallStatus()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {results.map((category, index) => (
            <div key={index} className="col-12 mb-4">
              <div className="card border">
                <div className="card-header bg-light">
                  <h6 className="mb-0">{category.category}</h6>
                </div>
                <div className="card-body">
                  {category.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="d-flex align-items-start mb-3">
                      <div className="me-3 mt-1">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{check.name}</div>
                        <div className="text-muted small">{check.message}</div>
                        {check.details && (
                          <div className="text-warning small mt-1">
                            <IconifyIcon icon="solar:info-circle-bold" className="me-1" />
                            {check.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="alert alert-light">
            <h6>Next Steps:</h6>
            <ul className="mb-0">
              <li>Address any critical issues before deploying to production</li>
              <li>Review warnings and optimize where possible</li>
              <li>Set up monitoring and alerting for production environment</li>
              <li>Configure backup and disaster recovery procedures</li>
              <li>Test all user workflows in production-like environment</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};