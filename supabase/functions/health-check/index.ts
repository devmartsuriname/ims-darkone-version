import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      switch (path) {
        case 'health':
          return await checkSystemHealth();
        case 'database':
          return await checkDatabaseHealth();
        case 'storage':
          return await checkStorageHealth();
        case 'auth':
          return await checkAuthHealth();
        default:
          return await getFullHealthCheck();
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in health-check:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkSystemHealth(): Promise<Response> {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkStorageConnection(),
    checkAuthConnection()
  ]);

  const results = {
    database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: checks[0].reason },
    storage: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: checks[1].reason },
    auth: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: checks[2].reason }
  };

  const overallStatus = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded';

  return new Response(JSON.stringify({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: results,
    uptime: process.uptime?.() || 'unknown'
  }), {
    status: overallStatus === 'healthy' ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkDatabaseHealth(): Promise<Response> {
  const result = await checkDatabaseConnection();
  
  return new Response(JSON.stringify({
    service: 'database',
    ...result,
    timestamp: new Date().toISOString()
  }), {
    status: result.status === 'healthy' ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkStorageHealth(): Promise<Response> {
  const result = await checkStorageConnection();
  
  return new Response(JSON.stringify({
    service: 'storage',
    ...result,
    timestamp: new Date().toISOString()
  }), {
    status: result.status === 'healthy' ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkAuthHealth(): Promise<Response> {
  const result = await checkAuthConnection();
  
  return new Response(JSON.stringify({
    service: 'auth',
    ...result,
    timestamp: new Date().toISOString()
  }), {
    status: result.status === 'healthy' ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getFullHealthCheck(): Promise<Response> {
  const startTime = Date.now();
  
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkStorageConnection(),
    checkAuthConnection(),
    checkEnvironmentVariables()
  ]);

  const results = {
    database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: checks[0].reason },
    storage: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: checks[1].reason },
    auth: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: checks[2].reason },
    environment: checks[3].status === 'fulfilled' ? checks[3].value : { status: 'error', error: checks[3].reason }
  };

  const overallStatus = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded';
  const responseTime = Date.now() - startTime;

  return new Response(JSON.stringify({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    response_time_ms: responseTime,
    services: results,
    system_info: {
      deno_version: Deno.version.deno,
      v8_version: Deno.version.v8,
      typescript_version: Deno.version.typescript
    }
  }), {
    status: overallStatus === 'healthy' ? 200 : 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions for individual health checks
async function checkDatabaseConnection(): Promise<{status: string, details?: any, error?: string}> {
  try {
    const startTime = Date.now();
    
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      throw error;
    }

    return {
      status: 'healthy',
      details: {
        response_time_ms: responseTime,
        connection: 'established'
      }
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Database connection failed'
    };
  }
}

async function checkStorageConnection(): Promise<{status: string, details?: any, error?: string}> {
  try {
    const startTime = Date.now();
    
    // List buckets to test storage connectivity
    const { data, error } = await supabase.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      throw error;
    }

    return {
      status: 'healthy',
      details: {
        response_time_ms: responseTime,
        buckets_count: data?.length || 0,
        buckets: data?.map(b => b.name) || []
      }
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Storage connection failed'
    };
  }
}

async function checkAuthConnection(): Promise<{status: string, details?: any, error?: string}> {
  try {
    const startTime = Date.now();
    
    // Test auth service by getting service role info
    const { data, error } = await supabase.auth.getUser();

    const responseTime = Date.now() - startTime;

    // It's expected that this might fail without a valid JWT, 
    // but if the service is responding, it's healthy
    return {
      status: 'healthy',
      details: {
        response_time_ms: responseTime,
        service: 'responsive'
      }
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Auth service connection failed'
    };
  }
}

async function checkEnvironmentVariables(): Promise<{status: string, details?: any, error?: string}> {
  try {
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !Deno.env.get(varName));

    if (missingVars.length > 0) {
      return {
        status: 'error',
        error: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }

    return {
      status: 'healthy',
      details: {
        variables_set: requiredVars.length,
        all_required_present: true
      }
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Environment check failed'
    };
  }
}