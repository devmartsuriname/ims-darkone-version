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

interface CreateReferenceDataRequest {
  category: string;
  code: string;
  name_nl: string;
  name_en?: string;
  description?: string;
  parent_code?: string;
  sort_order?: number;
  metadata?: Record<string, any>;
}

interface UpdateReferenceDataRequest {
  name_nl?: string;
  name_en?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Parse body for action-based routing (used by integration tests)
    let body: any = {};
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        body = await req.json();
      } catch {
        // Body might be empty or invalid
      }
    }
    
    // Support both URL path routing and body-based action routing
    const action = body.action || path;

    switch (req.method) {
      case 'POST':
        // Health check endpoint for integration tests
        if (action === 'health-check') {
          return new Response(JSON.stringify({
            status: 'healthy',
            service: 'reference-data',
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (action === 'create' || path === 'create') {
          return await createReferenceData(req, user.id);
        }
        break;
      case 'GET':
        if (action === 'list' || path === 'list') {
          return await listReferenceData(req);
        } else if (action === 'categories' || path === 'categories') {
          return await getCategories();
        } else if (path && path !== 'reference-data') {
          return await getReferenceData(path);
        }
        break;
      case 'PUT':
        if (path && path !== 'reference-data') {
          return await updateReferenceData(req, path, user.id);
        }
        break;
      case 'DELETE':
        if (path && path !== 'reference-data') {
          return await deleteReferenceData(path, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in reference-data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createReferenceData(req: Request, userId: string): Promise<Response> {
  const referenceData: CreateReferenceDataRequest = await req.json();

  // Check if user has admin/IT permissions
  const { data: hasPermission, error: permError } = await supabase
    .rpc('is_admin_or_it');

  if (permError || !hasPermission) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: newRefData, error: createError } = await supabase
    .from('reference_data')
    .insert([{
      ...referenceData,
      sort_order: referenceData.sort_order || 0,
    }])
    .select('*')
    .single();

  if (createError) {
    throw new Error(`Failed to create reference data: ${createError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Reference data created successfully',
    reference_data: newRefData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateReferenceData(req: Request, id: string, userId: string): Promise<Response> {
  const updateData: UpdateReferenceDataRequest = await req.json();

  // Check if user has admin/IT permissions
  const { data: hasPermission, error: permError } = await supabase
    .rpc('is_admin_or_it');

  if (permError || !hasPermission) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: updatedRefData, error: updateError } = await supabase
    .from('reference_data')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update reference data: ${updateError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Reference data updated successfully',
    reference_data: updatedRefData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listReferenceData(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const parent_code = url.searchParams.get('parent_code');
  const active = url.searchParams.get('active');

  let query = supabase
    .from('reference_data')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name_nl', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  if (parent_code) {
    query = query.eq('parent_code', parent_code);
  }

  if (active !== null) {
    query = query.eq('is_active', active !== 'false');
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch reference data: ${error.message}`);
  }

  return new Response(JSON.stringify({
    reference_data: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getCategories(): Promise<Response> {
  const { data, error } = await supabase
    .from('reference_data')
    .select('category')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = [...new Set(data?.map(item => item.category) || [])];

  return new Response(JSON.stringify({
    categories
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getReferenceData(id: string): Promise<Response> {
  const { data, error } = await supabase
    .from('reference_data')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Reference data not found: ${error.message}`);
  }

  return new Response(JSON.stringify({
    reference_data: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteReferenceData(id: string, userId: string): Promise<Response> {
  // Check if user has admin/IT permissions
  const { data: hasPermission, error: permError } = await supabase
    .rpc('is_admin_or_it');

  if (permError || !hasPermission) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Soft delete by setting is_active to false
  const { error: deleteError } = await supabase
    .from('reference_data')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (deleteError) {
    throw new Error(`Failed to delete reference data: ${deleteError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Reference data deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}