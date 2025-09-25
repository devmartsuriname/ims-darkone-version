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
        } else if (path === 'health_check') {
          return new Response(JSON.stringify({ 
            status: 'healthy', 
            service: 'user-management',
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (path === 'create_test_data') {
          return await createTestData(req);
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

  // Update the profile created by the trigger with additional fields
  // The profile is automatically created by handle_new_user() trigger
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: userData.phone,
      department: userData.department,
      position: userData.position,
    })
    .eq('id', authUser.user.id)
    .select('*')
    .single();

  if (profileError) {
    console.error('Failed to update profile:', profileError);
    // Cleanup auth user if profile update fails
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to update profile: ${profileError.message}`);
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

async function createTestData(req: Request): Promise<Response> {
  try {
    console.log('Creating comprehensive test data for workflow testing...');
    
    // Create test users with different roles
    const testUsers = [
      {
        email: 'admin@ims.sr',
        password: 'TestAdmin123!',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin'
      },
      {
        email: 'director@ims.sr', 
        password: 'TestDirector123!',
        first_name: 'Housing',
        last_name: 'Director',
        role: 'director'
      },
      {
        email: 'minister@ims.sr',
        password: 'TestMinister123!',
        first_name: 'Housing',
        last_name: 'Minister', 
        role: 'minister'
      },
      {
        email: 'staff@ims.sr',
        password: 'TestStaff123!',
        first_name: 'Front Office',
        last_name: 'Staff',
        role: 'staff'
      },
      {
        email: 'control@ims.sr',
        password: 'TestControl123!',
        first_name: 'Control',
        last_name: 'Inspector',
        role: 'control'
      }
    ];

    const createdUsers = [];
    
    for (const userData of testUsers) {
      try {
        // Create auth user
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
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.user.id,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              department: 'Test Department',
              position: userData.role.charAt(0).toUpperCase() + userData.role.slice(1),
              is_active: true
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Assign role
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: authUser.user.id,
              role: userData.role,
              assigned_by: authUser.user.id,
              is_active: true
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
          }

          createdUsers.push({
            id: authUser.user.id,
            email: userData.email,
            role: userData.role
          });
        }
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }

    // Create test applicants
    const testApplicants = [
      {
        first_name: 'John',
        last_name: 'Doe',
        national_id: 'SR001234567',
        email: 'john.doe@example.sr',
        phone: '+597-123-4567',
        address: '123 Main Street, Paramaribo',
        district: 'Paramaribo',
        nationality: 'Surinamese',
        marital_status: 'Married',
        employment_status: 'Employed',
        monthly_income: 2500.00
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        national_id: 'SR007654321',
        email: 'jane.smith@example.sr',
        phone: '+597-765-4321',
        address: '456 Side Street, Nieuw Nickerie',
        district: 'Nickerie',
        nationality: 'Surinamese',
        marital_status: 'Single',
        employment_status: 'Self-employed',
        monthly_income: 1800.00
      }
    ];

    const createdApplicants = [];
    for (const applicantData of testApplicants) {
      const { data: applicant, error: applicantError } = await supabase
        .from('applicants')
        .insert(applicantData)
        .select()
        .single();

      if (!applicantError && applicant) {
        createdApplicants.push(applicant);
      }
    }

    // Create test applications
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const staffUser = createdUsers.find(u => u.role === 'staff');

    if (adminUser && createdApplicants.length > 0) {
      const testApplications = createdApplicants.map((applicant, index) => ({
        applicant_id: applicant.id,
        application_number: `TEST-2024-${String(index + 1).padStart(4, '0')}`,
        service_type: 'SUBSIDY',
        current_state: 'DRAFT',
        property_address: applicant.address,
        property_district: applicant.district,
        property_type: 'RESIDENTIAL',
        property_surface_area: 150.0,
        requested_amount: 25000.00,
        reason_for_request: 'Home renovation and improvement',
        title_type: 'Eigendom',
        ownership_status: 'Owner',
        created_by: staffUser?.id || adminUser.id,
        priority_level: index === 0 ? 1 : 3
      }));

      const { data: applications, error: applicationError } = await supabase
        .from('applications')
        .insert(testApplications)
        .select();

      if (applicationError) {
        console.error('Application creation error:', applicationError);
      }
    }

    return new Response(JSON.stringify({
      message: 'Test data created successfully',
      created: {
        users: createdUsers.length,
        applicants: createdApplicants.length,
        note: 'Test users created with passwords: TestRole123! (e.g., TestAdmin123!)'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating test data:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create test data',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}