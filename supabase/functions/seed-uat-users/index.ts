import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UAT_USERS = [
  {
    first_name: 'Maria',
    last_name: 'Fernandes',
    email: 'maria.fernandes@ims.sr',
    password: 'Test@123',
    department: 'Administration',
    position: 'Clerk',
    phone: '+597-123-4001',
    roles: ['applicant']
  },
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@ims.sr',
    password: 'Test@123',
    department: 'Front Office',
    position: 'Officer',
    phone: '+597-123-4002',
    roles: ['front_office']
  },
  {
    first_name: 'Leonie',
    last_name: 'Wijnhard',
    email: 'leonie.wijnhard@ims.sr',
    password: 'Test@123',
    department: 'Control Dept',
    position: 'Inspector',
    phone: '+597-123-4003',
    roles: ['control']
  },
  {
    first_name: 'Jason',
    last_name: 'Pinas',
    email: 'jason.pinas@ims.sr',
    password: 'Test@123',
    department: 'ICT',
    position: 'Support Agent',
    phone: '+597-123-4004',
    roles: ['it']
  },
  {
    first_name: 'Charlene',
    last_name: 'Slooten',
    email: 'charlene.slooten@ims.sr',
    password: 'Test@123',
    department: 'Staff',
    position: 'Coordinator',
    phone: '+597-123-4005',
    roles: ['staff']
  },
  {
    first_name: 'Derrick',
    last_name: 'Meye',
    email: 'derrick.meye@ims.sr',
    password: 'Test@123',
    department: 'Cabinet Office',
    position: 'Director',
    phone: '+597-123-4006',
    roles: ['director']
  },
  {
    first_name: 'Gregory',
    last_name: 'Rusland',
    email: 'gregory.rusland@ims.sr',
    password: 'Test@123',
    department: 'Leadership',
    position: 'Minister',
    phone: '+597-123-4007',
    roles: ['minister']
  }
]

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with SERVICE_ROLE_KEY (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify caller is admin/IT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Unauthorized: No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized: Invalid token')
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)

    const isAdmin = roles?.some(r => ['admin', 'it'].includes(r.role))
    if (!isAdmin) {
      throw new Error('Forbidden: Only admin/IT can seed UAT users')
    }

    const { action } = await req.json()

    if (action === 'seed') {
      const results = []
      
      for (const userData of UAT_USERS) {
        try {
          // Check if user already exists
          const { data: existingAuthUsers } = await supabaseClient.auth.admin.listUsers()
          const userExists = existingAuthUsers?.users?.find(u => u.email === userData.email)
          
          if (userExists) {
            console.log(`[seed-uat-users] User ${userData.email} already exists, skipping`)
            results.push({
              email: userData.email,
              status: 'skipped',
              reason: 'User already exists',
              userId: userExists.id
            })
            continue
          }

          // Create auth user
          const { data: newUser, error: authError } = await supabaseClient.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              first_name: userData.first_name,
              last_name: userData.last_name
            }
          })

          if (authError) {
            throw new Error(`Auth creation failed: ${authError.message}`)
          }

          const userId = newUser.user.id

          // Update profile (created by trigger)
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
              phone: userData.phone,
              department: userData.department,
              position: userData.position,
              is_active: true
            })
            .eq('id', userId)

          if (profileError) {
            console.error(`Profile update failed for ${userData.email}:`, profileError)
          }

          // Assign roles
          const roleInserts = userData.roles.map(role => ({
            user_id: userId,
            role,
            assigned_by: user.id,
            is_active: true
          }))

          const { error: roleError } = await supabaseClient
            .from('user_roles')
            .insert(roleInserts)

          if (roleError) {
            throw new Error(`Role assignment failed: ${roleError.message}`)
          }

          console.log(`[seed-uat-users] Created user: ${userData.email} with roles: ${userData.roles.join(', ')}`)
          
          results.push({
            email: userData.email,
            status: 'created',
            userId,
            roles: userData.roles
          })

        } catch (error) {
          console.error(`[seed-uat-users] Error creating ${userData.email}:`, error)
          results.push({
            email: userData.email,
            status: 'error',
            error: error.message
          })
        }
      }

      const successCount = results.filter(r => r.status === 'created').length
      const skippedCount = results.filter(r => r.status === 'skipped').length
      const errorCount = results.filter(r => r.status === 'error').length

      return new Response(
        JSON.stringify({
          success: true,
          message: `UAT users seeding completed: ${successCount} created, ${skippedCount} skipped, ${errorCount} errors`,
          results,
          summary: {
            total: UAT_USERS.length,
            created: successCount,
            skipped: skippedCount,
            errors: errorCount
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else if (action === 'cleanup') {
      // Delete all UAT users
      const emailsToDelete = UAT_USERS.map(u => u.email)
      const deleteResults = []

      for (const email of emailsToDelete) {
        try {
          const { data: users } = await supabaseClient.auth.admin.listUsers()
          const userToDelete = users?.users?.find(u => u.email === email)

          if (!userToDelete) {
            deleteResults.push({ email, status: 'not_found' })
            continue
          }

          const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userToDelete.id)
          
          if (deleteError) {
            throw new Error(deleteError.message)
          }

          console.log(`[seed-uat-users] Deleted user: ${email}`)
          deleteResults.push({ email, status: 'deleted' })

        } catch (error) {
          console.error(`[seed-uat-users] Error deleting ${email}:`, error)
          deleteResults.push({ email, status: 'error', error: error.message })
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'UAT users cleanup completed',
          results: deleteResults
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else {
      throw new Error('Invalid action. Use "seed" or "cleanup"')
    }

  } catch (error) {
    console.error('[seed-uat-users] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
