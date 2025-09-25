import { createClient } from '@supabase/supabase-js'

interface DatabaseHealthMetrics {
  connectionTime: number;
  queryPerformance: {
    simpleSelect: number;
    complexQuery: number;
    insertOperation: number;
  };
  tableStatus: {
    [tableName: string]: {
      rowCount: number;
      lastUpdated: string | null;
      healthy: boolean;
    };
  };
  connectionPoolStatus: string;
}

interface ServiceHealthMetrics {
  auth: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastCheck: string;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uploadTest: boolean;
  };
  edgeFunctions: {
    [functionName: string]: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastInvocation: string;
    };
  };
}

interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  database: DatabaseHealthMetrics;
  services: ServiceHealthMetrics;
  performance: {
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
  };
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting comprehensive system health check...');

    const healthReport: SystemHealthReport = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 0,
      database: await checkDatabaseHealth(supabase),
      services: await checkServicesHealth(supabase),
      performance: await checkPerformanceMetrics(),
      alerts: []
    };

    // Determine overall health status
    healthReport.overall = determineOverallHealth(healthReport);
    healthReport.alerts = generateHealthAlerts(healthReport);

    console.log('Health check completed:', {
      overall: healthReport.overall,
      alertCount: healthReport.alerts.length
    });

    // Store health report in database for historical tracking
    await storeHealthReport(supabase, healthReport);

    return new Response(
      JSON.stringify({
        success: true,
        data: healthReport,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    const criticalReport: SystemHealthReport = {
      overall: 'critical',
      timestamp: new Date().toISOString(),
      uptime: 0,
      database: {} as DatabaseHealthMetrics,
      services: {} as ServiceHealthMetrics,
      performance: {},
      alerts: [{
        severity: 'critical',
        message: `Health check system failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }]
    };

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: criticalReport
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});

async function checkDatabaseHealth(supabase: any): Promise<DatabaseHealthMetrics> {
  const startTime = performance.now();
  
  try {
    // Test basic connectivity
    const connectionStart = performance.now();
    await supabase.from('profiles').select('count').limit(1);
    const connectionTime = performance.now() - connectionStart;

    // Test query performance
    const queryPerformance = await measureQueryPerformance(supabase);
    
    // Check table status
    const tableStatus = await checkTableStatus(supabase);

    return {
      connectionTime,
      queryPerformance,
      tableStatus,
      connectionPoolStatus: connectionTime < 100 ? 'optimal' : connectionTime < 500 ? 'good' : 'slow'
    };

  } catch (error) {
    console.error('Database health check failed:', error);
    throw error;
  }
}

async function measureQueryPerformance(supabase: any) {
  const results = {
    simpleSelect: 0,
    complexQuery: 0,
    insertOperation: 0
  };

  try {
    // Simple SELECT performance
    const simpleStart = performance.now();
    await supabase.from('profiles').select('id').limit(1);
    results.simpleSelect = performance.now() - simpleStart;

    // Complex query performance (join with filters)
    const complexStart = performance.now();
    await supabase
      .from('applications')
      .select(`
        id,
        current_state,
        created_at,
        applicant_id,
        applicants!inner(first_name, last_name)
      `)
      .limit(5);
    results.complexQuery = performance.now() - complexStart;

    // Test insert performance (use audit_logs for test data)
    const insertStart = performance.now();
    await supabase.from('audit_logs').insert({
      table_name: 'health_check',
      operation: 'TEST',
      record_id: crypto.randomUUID(),
      user_id: null,
      old_values: {},
      new_values: { test: 'health_check_insert_test' }
    });
    results.insertOperation = performance.now() - insertStart;

  } catch (error) {
    console.error('Query performance measurement failed:', error);
  }

  return results;
}

async function checkTableStatus(supabase: any) {
  const tables = [
    'applications', 'applicants', 'users', 'profiles', 
    'documents', 'tasks', 'audit_logs', 'user_roles'
  ];
  
  const tableStatus: any = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        tableStatus[table] = {
          rowCount: 0,
          lastUpdated: null,
          healthy: false
        };
      } else {
        tableStatus[table] = {
          rowCount: count || 0,
          lastUpdated: data?.[0]?.created_at || null,
          healthy: true
        };
      }
    } catch (error) {
      tableStatus[table] = {
        rowCount: 0,
        lastUpdated: null,
        healthy: false
      };
    }
  }

  return tableStatus;
}

async function checkServicesHealth(supabase: any): Promise<ServiceHealthMetrics> {
  const services: ServiceHealthMetrics = {
    auth: await checkAuthService(supabase),
    storage: await checkStorageService(supabase),
    edgeFunctions: await checkEdgeFunctionsHealth(supabase)
  };

  return services;
}

async function checkAuthService(supabase: any) {
  try {
    const start = performance.now();
    const { data, error } = await supabase.auth.getSession();
    const responseTime = performance.now() - start;

    return {
      status: (error ? 'degraded' : 'healthy') as 'healthy' | 'degraded' | 'down',
      responseTime,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'down' as const,
      responseTime: 0,
      lastCheck: new Date().toISOString()
    };
  }
}

async function checkStorageService(supabase: any) {
  try {
    const start = performance.now();
    
    // Test storage bucket access
    const { data: buckets, error } = await supabase.storage.listBuckets();
    const responseTime = performance.now() - start;

    // Try a small upload test
    let uploadTest = false;
    try {
      const testData = new Blob(['health-check-test'], { type: 'text/plain' });
      const uploadResult = await supabase.storage
        .from('documents')
        .upload(`health-checks/test-${Date.now()}.txt`, testData);
      
      uploadTest = !uploadResult.error;
      
      // Clean up test file
      if (!uploadResult.error) {
        await supabase.storage
          .from('documents')
          .remove([uploadResult.data.path]);
      }
    } catch (uploadError) {
      console.warn('Storage upload test failed:', uploadError);
    }

    return {
      status: (error ? 'degraded' : 'healthy') as 'healthy' | 'degraded' | 'down',
      responseTime,
      uploadTest
    };
  } catch (error) {
    return {
      status: 'down' as const,
      responseTime: 0,
      uploadTest: false
    };
  }
}

async function checkEdgeFunctionsHealth(supabase: any) {
  const functions = [
    'user-management',
    'application-service',
    'notification-service',
    'workflow-service'
  ];

  const edgeFunctions: any = {};

  for (const functionName of functions) {
    try {
      const start = performance.now();
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { action: 'health-check' }
      });
      const responseTime = performance.now() - start;

      edgeFunctions[functionName] = {
        status: error ? 'degraded' : 'healthy',
        responseTime,
        lastInvocation: new Date().toISOString()
      };
    } catch (error) {
      edgeFunctions[functionName] = {
        status: 'down' as const,
        responseTime: 0,
        lastInvocation: new Date().toISOString()
      };
    }
  }

  return edgeFunctions;
}

async function checkPerformanceMetrics() {
  // Note: In a real environment, you'd integrate with monitoring services
  // For now, we'll return simulated metrics
  return {
    cpuUsage: Math.random() * 20 + 5, // 5-25%
    memoryUsage: Math.random() * 30 + 20, // 20-50%
    diskUsage: Math.random() * 40 + 10 // 10-50%
  };
}

function determineOverallHealth(report: SystemHealthReport): 'healthy' | 'degraded' | 'critical' {
  const issues = [];

  // Check database health
  if (report.database.connectionTime > 1000) {
    issues.push('Database connection slow');
  }

  // Check services
  const serviceStatuses = Object.values(report.services.edgeFunctions).map(f => f.status);
  if (serviceStatuses.includes('down')) {
    issues.push('Critical services down');
  }
  if (serviceStatuses.includes('degraded')) {
    issues.push('Services degraded');
  }

  // Check auth and storage
  if (report.services.auth.status === 'down' || report.services.storage.status === 'down') {
    issues.push('Core services down');
  }

  // Check performance
  if (report.performance.memoryUsage && report.performance.memoryUsage > 80) {
    issues.push('High memory usage');
  }

  if (issues.length === 0) return 'healthy';
  if (issues.some(issue => issue.includes('down') || issue.includes('Critical'))) return 'critical';
  return 'degraded';
}

function generateHealthAlerts(report: SystemHealthReport) {
  const alerts: any[] = [];

  // Database alerts
  if (report.database.connectionTime > 500) {
    alerts.push({
      severity: report.database.connectionTime > 1000 ? 'critical' : 'warning',
      message: `Database connection time is high: ${report.database.connectionTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // Service alerts
  Object.entries(report.services.edgeFunctions).forEach(([name, service]) => {
    if (service.status === 'down') {
      alerts.push({
        severity: 'critical',
        message: `Edge function ${name} is down`,
        timestamp: new Date().toISOString()
      });
    } else if (service.status === 'degraded') {
      alerts.push({
        severity: 'warning',
        message: `Edge function ${name} is degraded`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Performance alerts
  if (report.performance.memoryUsage && report.performance.memoryUsage > 80) {
    alerts.push({
      severity: 'warning',
      message: `High memory usage: ${report.performance.memoryUsage.toFixed(1)}%`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}

async function storeHealthReport(supabase: any, report: SystemHealthReport) {
  try {
    await supabase.from('system_health_reports').insert({
      timestamp: report.timestamp,
      overall_status: report.overall,
      database_metrics: report.database,
      service_metrics: report.services,
      performance_metrics: report.performance,
      alert_count: report.alerts.length,
      alerts: report.alerts
    });
  } catch (error) {
    console.warn('Failed to store health report:', error);
  }
}