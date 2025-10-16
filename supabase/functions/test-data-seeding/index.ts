import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { action } = await req.json()

    // Only admin/IT can seed test data
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)

    const isAdmin = roles?.some(r => ['admin', 'it'].includes(r.role))
    if (!isAdmin) {
      throw new Error('Only admin/IT can seed test data')
    }

    if (action === 'seed') {
      // First, create test users with all required roles
      const testUsers = [
        { email: 'minister@test.sr', role: 'minister', firstName: 'Minister', lastName: 'Test' },
        { email: 'director@test.sr', role: 'director', firstName: 'Director', lastName: 'Test' },
        { email: 'control@test.sr', role: 'control', firstName: 'Control', lastName: 'Inspector' },
        { email: 'staff@test.sr', role: 'staff', firstName: 'Staff', lastName: 'Member' },
        { email: 'frontoffice@test.sr', role: 'front_office', firstName: 'Front', lastName: 'Office' }
      ]

      const createdUserIds: string[] = []
      
      for (const testUser of testUsers) {
        // Check if user already exists
        const { data: existingUser } = await supabaseClient.auth.admin.listUsers()
        const userExists = existingUser?.users?.find(u => u.email === testUser.email)
        
        let userId: string
        
        if (userExists) {
          userId = userExists.id
          console.log(`User ${testUser.email} already exists`)
        } else {
          // Create auth user
          const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
            email: testUser.email,
            password: 'Test123!@#',
            email_confirm: true,
            user_metadata: {
              first_name: testUser.firstName,
              last_name: testUser.lastName
            }
          })
          
          if (userError) {
            console.error(`Error creating user ${testUser.email}:`, userError)
            continue
          }
          
          userId = newUser.user.id
          console.log(`Created user ${testUser.email}`)
        }
        
        createdUserIds.push(userId)
        
        // Ensure profile exists
        await supabaseClient
          .from('profiles')
          .upsert({
            id: userId,
            email: testUser.email,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            is_active: true
          }, { onConflict: 'id' })
        
        // Assign role
        await supabaseClient
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: testUser.role,
            assigned_by: user.id,
            is_active: true
          }, { onConflict: 'user_id,role' })
      }

      // Create test applicants
      const testApplicants = [
        {
          national_id: 'TEST-001-2024',
          first_name: 'Jan',
          last_name: 'de Vries',
          date_of_birth: '1980-05-15',
          marital_status: 'MARRIED',
          nationality: 'Surinamese',
          phone: '+597-8123456',
          email: 'jan.devries@test.sr',
          address: 'Teststraat 1',
          district: 'Paramaribo',
          employment_status: 'EMPLOYED',
          employer_name: 'Test Bedrijf BV',
          monthly_income: 3500.00,
          household_size: 4,
          children_count: 2
        },
        {
          national_id: 'TEST-002-2024',
          first_name: 'Maria',
          last_name: 'Santos',
          date_of_birth: '1975-08-22',
          marital_status: 'SINGLE',
          nationality: 'Surinamese',
          phone: '+597-8234567',
          email: 'maria.santos@test.sr',
          address: 'Testweg 45',
          district: 'Wanica',
          employment_status: 'SELF_EMPLOYED',
          monthly_income: 2800.00,
          household_size: 3,
          children_count: 2
        },
        {
          national_id: 'TEST-003-2024',
          first_name: 'Ravi',
          last_name: 'Sharma',
          date_of_birth: '1982-03-10',
          marital_status: 'MARRIED',
          nationality: 'Surinamese',
          phone: '+597-8345678',
          email: 'ravi.sharma@test.sr',
          address: 'Testlaan 78',
          district: 'Nickerie',
          employment_status: 'EMPLOYED',
          employer_name: 'Agri Test NV',
          monthly_income: 4200.00,
          spouse_income: 3000.00,
          household_size: 5,
          children_count: 3
        }
      ]

      const { data: applicants, error: applicantsError } = await supabaseClient
        .from('applicants')
        .upsert(testApplicants, { onConflict: 'national_id' })
        .select()

      if (applicantsError) throw applicantsError

      // Create test applications in various states
      const testApplications = [
        {
          application_number: 'APP-2024-TEST-001',
          applicant_id: applicants[0].id,
          service_type: 'SUBSIDY',
          current_state: 'INTAKE_REVIEW',
          property_address: 'Teststraat 1, Paramaribo',
          property_district: 'Paramaribo',
          title_type: 'EIGENDOM',
          ownership_status: 'OWNER',
          property_type: 'RESIDENTIAL',
          property_surface_area: 180.50,
          requested_amount: 15000.00,
          reason_for_request: 'Dakvervanging en fundering herstel',
          priority_level: 2,
          created_by: user.id,
          submitted_at: new Date().toISOString()
        },
        {
          application_number: 'APP-2024-TEST-002',
          applicant_id: applicants[1].id,
          service_type: 'SUBSIDY',
          current_state: 'CONTROL_ASSIGN',
          property_address: 'Testweg 45, Wanica',
          property_district: 'Wanica',
          title_type: 'ERFPACHT',
          ownership_status: 'OWNER',
          property_type: 'RESIDENTIAL',
          property_surface_area: 150.00,
          requested_amount: 12000.00,
          reason_for_request: 'Sanitaire voorzieningen verbetering',
          priority_level: 3,
          created_by: user.id,
          submitted_at: new Date().toISOString()
        },
        {
          application_number: 'APP-2024-TEST-003',
          applicant_id: applicants[2].id,
          service_type: 'SUBSIDY',
          current_state: 'TECHNICAL_REVIEW',
          property_address: 'Testlaan 78, Nickerie',
          property_district: 'Nickerie',
          title_type: 'EIGENDOM',
          ownership_status: 'OWNER',
          property_type: 'RESIDENTIAL',
          property_surface_area: 200.00,
          requested_amount: 18000.00,
          reason_for_request: 'Volledige renovatie na storm schade',
          priority_level: 1,
          created_by: user.id,
          submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const { data: applications, error: applicationsError } = await supabaseClient
        .from('applications')
        .upsert(testApplications, { onConflict: 'application_number' })
        .select()

      if (applicationsError) throw applicationsError

      // Create control visits for applications that need them
      const testControlVisit = {
        application_id: applications[1].id,
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        visit_type: 'TECHNICAL_INSPECTION',
        visit_status: 'SCHEDULED',
        location_notes: 'Toegang via hoofdweg, bel aan bij voordeur'
      }

      await supabaseClient
        .from('control_visits')
        .upsert([testControlVisit])

      // Create test technical report
      const testTechnicalReport = {
        application_id: applications[2].id,
        inspector_id: user.id,
        foundation_condition: 'NEEDS_REPAIR',
        floor_condition: 'FAIR',
        roof_condition: 'NEEDS_REPLACEMENT',
        walls_condition: 'GOOD',
        windows_doors_condition: 'FAIR',
        sanitation_condition: 'NEEDS_IMPROVEMENT',
        sewerage_condition: 'ADEQUATE',
        electrical_condition: 'NEEDS_UPGRADE',
        water_supply_condition: 'GOOD',
        structural_issues: 'Fundering heeft scheuren, dakconstructie zwak',
        recommended_repairs: 'Fundering herstellen, dak vervangen, elektrische installatie moderniseren',
        technical_conclusion: 'Woning heeft urgente reparaties nodig',
        estimated_cost: 18000.00,
        urgency_level: 1,
        submitted_at: new Date().toISOString()
      }

      await supabaseClient
        .from('technical_reports')
        .upsert([testTechnicalReport])

      // Create test social report
      const testSocialReport = {
        application_id: applications[2].id,
        social_worker_id: user.id,
        household_situation: 'Gezin met 3 kinderen, beide ouders werken',
        health_conditions: 'Geen bijzondere gezondheids problemen',
        special_needs: 'Oudste kind heeft leerstoornis',
        income_verification: 'Bevestigd door werkgevers verklaringen',
        living_conditions_assessment: 'Beperkte ruimte, maar schoon en goed onderhouden',
        community_integration: 'Actief in lokale gemeenschap',
        support_network: 'Familie in de buurt, goede buren contacten',
        social_conclusion: 'Familie is zeer gemotiveerd, heeft ondersteuning nodig',
        recommendations: 'Goedkeuren voor maximale subsidie gezien urgentie en gezinssituatie',
        vulnerability_score: 7,
        social_priority_level: 1,
        submitted_at: new Date().toISOString()
      }

      await supabaseClient
        .from('social_reports')
        .upsert([testSocialReport])

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test data seeded successfully',
          data: {
            users: createdUserIds.length,
            applicants: applicants.length,
            applications: applications.length,
            controlVisits: 1,
            technicalReports: 1,
            socialReports: 1
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'cleanup') {
      // Clean up test data
      await supabaseClient
        .from('applications')
        .delete()
        .like('application_number', 'APP-2024-TEST-%')

      await supabaseClient
        .from('applicants')
        .delete()
        .like('national_id', 'TEST-%')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test data cleaned up successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
