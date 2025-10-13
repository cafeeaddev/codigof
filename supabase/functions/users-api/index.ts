import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Use admin client for data fetching
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, nome, user_id')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Get all user progress
    const { data: userProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id, total_xp, missao_1_completed, missao_2_completed, missao_3_completed, missao_4_completed, missao_5_completed, final_profile')

    if (progressError) {
      console.error('Error fetching user progress:', progressError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user progress' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Get mission 4 responses for competencies
    const { data: mission4Responses, error: mission4Error } = await supabase
      .from('respostas_missao4')
      .select('email, respostas')

    if (mission4Error) {
      console.error('Error fetching mission 4 responses:', mission4Error)
    }

    // Get manual XP adjustments
    const { data: manualXPData, error: xpError } = await supabase
      .from('manual_xp_adjustments')
      .select('email, xp_value')

    if (xpError) {
      console.error('Error fetching manual XP adjustments:', xpError)
    }

    // Get fast track terms responses
    const { data: fastTrackTerms, error: termsError } = await supabase
      .from('fast_track_terms_responses')
      .select('user_id, accepted_terms, want_to_participate, decline_reason, created_at')

    if (termsError) {
      console.error('Error fetching fast track terms:', termsError)
    }

    // Get fast track form responses
    const { data: fastTrackForms, error: formsError } = await supabase
      .from('fast_track_responses')
      .select('user_id, main_objective, other_objective, time_commitment, interest_level, created_at')

    if (formsError) {
      console.error('Error fetching fast track forms:', formsError)
    }

    // Process users data
    const processedUsers = profiles?.map(profile => {
      // Find progress for this user
      const progress = userProgress?.find(up => up.user_id === profile.user_id) || {}
      
      // Find mission 4 response for this user
      const mission4Response = mission4Responses?.find(r => r.email === profile.email)
      
      // Extract competencies from star ratings
      const competencies = extractCompetencies(mission4Response?.respostas)

      // Find manual XP adjustment for this user
      const manualXP = manualXPData?.find(xp => xp.email === profile.email)

      // Find fast track data for this user
      const userTerms = fastTrackTerms?.find(t => t.user_id === profile.user_id)
      const userForm = fastTrackForms?.find(f => f.user_id === profile.user_id)

      return {
        email: profile.email,
        nome: profile.nome,
        total_xp: progress.total_xp || 0,
        manual_xp_adjustment: manualXP ? {
          xp_value: manualXP.xp_value,
          has_adjustment: true
        } : {
          xp_value: 0,
          has_adjustment: false
        },
        missions_completed: {
          missao_1: progress.missao_1_completed || false,
          missao_2: progress.missao_2_completed || false,
          missao_3: progress.missao_3_completed || false,
          missao_4: progress.missao_4_completed || false,
          missao_5: progress.missao_5_completed || false
        },
        total_missions_completed: [
          progress.missao_1_completed,
          progress.missao_2_completed,
          progress.missao_3_completed,
          progress.missao_4_completed,
          progress.missao_5_completed
        ].filter(Boolean).length,
        final_profile: progress.final_profile || null,
        competencies: competencies,
        extra_mission: {
          terms_response: userTerms ? {
            accepted_terms: userTerms.accepted_terms,
            want_to_participate: userTerms.want_to_participate,
            decline_reason: userTerms.decline_reason || null,
            responded_at: userTerms.created_at
          } : null,
          form_response: userForm ? {
            main_objective: userForm.main_objective,
            other_objective: userForm.other_objective,
            time_commitment: userForm.time_commitment,
            interest_level: userForm.interest_level,
            submitted_at: userForm.created_at
          } : null
        }
      }
    }) || []

    return new Response(
      JSON.stringify({
        success: true,
        total_users: processedUsers.length,
        users: processedUsers
      }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})

function extractCompetencies(respostas: any): any {
  if (!respostas?.starRatings) {
    return {
      software_skills: {},
      total_skills_evaluated: 0,
      average_rating: 0
    }
  }

  const starRatings = respostas.starRatings
  const allRatings: number[] = []
  const softwareSkills: Record<string, number> = {}

  // Extract all software ratings
  Object.values(starRatings).forEach((questionRatings: any) => {
    if (questionRatings && typeof questionRatings === 'object') {
      Object.entries(questionRatings).forEach(([software, rating]) => {
        const numRating = Number(rating)
        if (!isNaN(numRating) && numRating > 0) {
          softwareSkills[software] = numRating
          allRatings.push(numRating)
        }
      })
    }
  })

  return {
    software_skills: softwareSkills,
    total_skills_evaluated: Object.keys(softwareSkills).length,
    average_rating: allRatings.length > 0 
      ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10 
      : 0
  }
}