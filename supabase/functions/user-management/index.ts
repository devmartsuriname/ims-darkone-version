import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const allowedOrigins = [
  'https://preview--ims-darkone-version.lovable.app',
  'https://ims-darkone-version.lovable.app',
  'http://localhost:5173'
];

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
  const origin = req.headers.get('Origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // Parse body once
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (err) {
      console.error('Failed to parse request body:', err);
    }

    // Health check (supports both 'health_check' and 'health-check')
    if (body.action === 'health_check' || body.action === 'health-check') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        service: 'user-management',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    if (!isInitialSetup && user) {
      // Use direct query instead of RPC to avoid auth context issues
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const hasPermission = userRoles?.some(r => r.role === 'admin' || r.role === 'it');

      if (!hasPermission) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions. Admin or IT role required.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        // Check body.action first, then fall back to path-based routing
        if (body.action === 'create' || !path || path === 'user-management' || path === 'create') {
          return await createUser(body, user?.id || null);
        } else if (body.action === 'assign-role' || path === 'assign-role') {
          if (!user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return await assignRole(body, user.id);
        } else if (body.action === 'create_test_data' || path === 'create_test_data') {
          return await createTestData();
        }
        break;
      case 'GET':
        if (path === 'list') {
          return await listUsers(url);
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
          return await updateUser(body, path, user.id);
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

async function createUser(userData: any, adminId: string | null): Promise<Response> {
  // Accept both camelCase and snake_case
  const firstName = userData.firstName || userData.first_name;
  const lastName = userData.lastName || userData.last_name;
  const email = userData.email;
  const password = userData.password;
  const phone = userData.phone;
  const department = userData.department;
  const position = userData.position;

  // Accept role or roles array
  let rolesInput: string[] = [];
  if (Array.isArray(userData.roles)) {
    rolesInput = userData.roles;
  } else if (userData.role) {
    rolesInput = [userData.role];
  }
  
  // Default to applicant if no roles specified
  if (rolesInput.length === 0) {
    rolesInput = ['applicant'];
  }

  // Validate roles
  const validRoles = ['admin', 'it', 'staff', 'control', 'director', 'minister', 'front_office', 'applicant'];
  const invalidRoles = rolesInput.filter(r => !validRoles.includes(r));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}`);
  }

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      first_name: firstName,
      last_name: lastName
    },
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authUser.user) {
    throw new Error('Failed to create user');
  }

  // Update the profile created by the trigger with additional fields
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: phone || null,
      department: department || null,
      position: position || null,
    })
    .eq('id', authUser.user.id)
    .select('*')
    .single();

  if (profileError) {
    console.error('Failed to update profile:', profileError);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  // Deactivate any existing roles for this user
  await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', authUser.user.id);

  // Assign roles
  const roleInserts = rolesInput.map(role => ({
    user_id: authUser.user.id,
    role,
    assigned_by: adminId || authUser.user.id,
    is_active: true
  }));

  const { error: newRoleError } = await supabase
    .from('user_roles')
    .insert(roleInserts);

  if (newRoleError) {
    console.error('Failed to assign roles:', newRoleError);
    throw new Error(`Failed to assign roles: ${newRoleError.message}`);
  }

  console.log(`User created successfully with roles: ${rolesInput.join(', ')}`);

  return new Response(JSON.stringify({
    success: true,
    message: 'User created successfully',
    user: {
      id: authUser.user.id,
      email,
      profile,
      roles: rolesInput
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateUser(updateData: UpdateUserRequest, userId: string, adminId: string): Promise<Response> {
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

async function assignRole(roleData: AssignRoleRequest, adminId: string): Promise<Response> {
  const { user_id, role, is_active = true } = roleData;

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

async function listUsers(url: URL): Promise<Response> {
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
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to deactivate profile: ${profileError.message}`);
  }

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

async function createTestData(): Promise<Response> {
  try {
    console.log('Creating comprehensive test data for workflow testing...');
    
    const testUsers = [
      {
        email: 'admin@ims.sr',
        password: 'TestAdmin123!',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin' as const
      },
      {
        email: 'director@ims.sr', 
        password: 'TestDirector123!',
        first_name: 'Housing',
        last_name: 'Director',
        role: 'director' as const
      },
      {
        email: 'minister@ims.sr',
        password: 'TestMinister123!',
        first_name: 'Housing',
        last_name: 'Minister', 
        role: 'minister' as const
      },
      {
        email: 'staff@ims.sr',
        password: 'TestStaff123!',
        first_name: 'Front Office',
        last_name: 'Staff',
        role: 'staff' as const
      },
      {
        email: 'control@ims.sr',
        password: 'TestControl123!',
        first_name: 'Control',
        last_name: 'Inspector',
        role: 'control' as const
      }
    ];

    const createdUsers = [];
    
    for (const userData of testUsers) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        });

        if (authError) {
          console.log(`User ${userData.email} might already exist:`, authError.message);
          continue;
        }

        if (authUser.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.user.id,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
            });

          if (profileError) {
            console.error(`Failed to create profile for ${userData.email}:`, profileError);
          }

          await supabase
            .from('user_roles')
            .update({ is_active: false })
            .eq('user_id', authUser.user.id);

          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: authUser.user.id,
              role: userData.role,
              assigned_by: authUser.user.id,
            }]);

          if (roleError) {
            console.error(`Failed to assign role for ${userData.email}:`, roleError);
          }

          createdUsers.push({
            email: userData.email,
            role: userData.role,
            id: authUser.user.id
          });
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${createdUsers.length} test users`,
      users: createdUsers,
      credentials: testUsers.map(u => ({ email: u.email, password: u.password, role: u.role }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Failed to create test data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
