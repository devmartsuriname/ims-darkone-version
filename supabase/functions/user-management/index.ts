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

interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  position?: string;
  role: 'admin' | 'it' | 'staff' | 'control' | 'director' | 'minister' | 'front_office' | 'applicant';
}

interface UpdateUserRequest {
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  position?: string;
  is_active?: boolean;
}

interface AssignRoleRequest {
  user_id: string;
  role: 'admin' | 'it' | 'staff' | 'control' | 'director' | 'minister' | 'front_office' | 'applicant';
  is_active?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is the initial admin creation (no admin users exist)
  const { data: adminCount, error: countError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role', 'admin')
    .eq('is_active', true);

  const isInitialSetup = !countError && (!adminCount || adminCount.length === 0);

  let user = null;

  // For initial setup, we don't require authentication
  if (!isInitialSetup) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    user = authUser;
  }

  // For non-initial setup, check if user has admin/IT role
  if (!isInitialSetup) {
    const { data: hasPermission, error: permError } = await supabase
      .rpc('is_admin_or_it');

    if (permError || !hasPermission) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        // Handle direct user creation for initial setup (without URL path)
        if (!path || path === 'user-management' || path === 'create') {
          return await createUser(req, user?.id || null);
        } else if (path === 'assign-role') {
          if (!user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return await assignRole(req, user.id);
        }
        break;
      case 'GET':
        if (path === 'list') {
          return await listUsers(req);
        } else if (path && path !== 'user-management') {
          return await getUser(path);
        }
        break;
      case 'PUT':
        if (path && path !== 'user-management') {
          if (!user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return await updateUser(req, path, user.id);
        }
        break;
      case 'DELETE':
        if (path && path !== 'user-management') {
          if (!user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return await deactivateUser(path, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in user-management:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createUser(req: Request, adminId: string | null): Promise<Response> {
  const userData: CreateUserRequest = await req.json();

  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    user_metadata: {
      first_name: userData.first_name,
      last_name: userData.last_name
    },
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authUser.user) {
    throw new Error('Failed to create user');
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authUser.user.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      department: userData.department,
      position: userData.position,
    }])
    .select('*')
    .single();

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Assign role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert([{
      user_id: authUser.user.id,
      role: userData.role,
      assigned_by: adminId || authUser.user.id, // Self-assigned for initial admin
    }]);

  if (roleError) {
    console.error('Failed to assign role:', roleError);
  }

  return new Response(JSON.stringify({
    message: 'User created successfully',
    user: {
      id: authUser.user.id,
      email: userData.email,
      profile,
      role: userData.role
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateUser(req: Request, userId: string, adminId: string): Promise<Response> {
  const updateData: UpdateUserRequest = await req.json();

  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update({
      first_name: updateData.first_name,
      last_name: updateData.last_name,
      phone: updateData.phone,
      department: updateData.department,
      position: updateData.position,
      is_active: updateData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update user: ${updateError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'User updated successfully',
    profile
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function assignRole(req: Request, adminId: string): Promise<Response> {
  const { user_id, role, is_active = true }: AssignRoleRequest = await req.json();

  // Deactivate existing roles
  const { error: deactivateError } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', user_id);

  if (deactivateError) {
    console.error('Failed to deactivate existing roles:', deactivateError);
  }

  // Assign new role
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .insert([{
      user_id,
      role,
      assigned_by: adminId,
      is_active,
    }])
    .select('*')
    .single();

  if (roleError) {
    throw new Error(`Failed to assign role: ${roleError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Role assigned successfully',
    user_role: userRole
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listUsers(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const role = url.searchParams.get('role');
  const active = url.searchParams.get('active');

  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles!inner(role, is_active, assigned_at)
    `)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (role) {
    query = query.eq('user_roles.role', role);
  }

  if (active !== null) {
    query = query.eq('user_roles.is_active', active === 'true');
  }

  const { data: users, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return new Response(JSON.stringify({
    users: users || [],
    pagination: { page, limit, total: users?.length || 0 }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUser(userId: string): Promise<Response> {
  const { data: user, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`User not found: ${error.message}`);
  }

  return new Response(JSON.stringify({ user }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deactivateUser(userId: string, adminId: string): Promise<Response> {
  // Deactivate profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to deactivate profile: ${profileError.message}`);
  }

  // Deactivate roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (roleError) {
    console.error('Failed to deactivate user roles:', roleError);
  }

  return new Response(JSON.stringify({
    message: 'User deactivated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}