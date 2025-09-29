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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users with their progress
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        email,
        nome,
        user_progress (
          total_xp,
          missao_1_completed,
          missao_2_completed,
          missao_3_completed,
          missao_4_completed,
          final_profile
        )
      `)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
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

    // Process users data
    const processedUsers = users?.map(user => {
      const progress = user.user_progress?.[0] || {}
      
      // Find mission 4 response for this user
      const mission4Response = mission4Responses?.find(r => r.email === user.email)
      
      // Extract competencies from star ratings
      const competencies = extractCompetencies(mission4Response?.respostas)

      return {
        email: user.email,
        nome: user.nome,
        total_xp: progress.total_xp || 0,
        missions_completed: {
          missao_1: progress.missao_1_completed || false,
          missao_2: progress.missao_2_completed || false,
          missao_3: progress.missao_3_completed || false,
          missao_4: progress.missao_4_completed || false
        },
        total_missions_completed: [
          progress.missao_1_completed,
          progress.missao_2_completed,
          progress.missao_3_completed,
          progress.missao_4_completed
        ].filter(Boolean).length,
        final_profile: progress.final_profile || null,
        competencies: competencies
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