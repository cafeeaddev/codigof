import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, nome, cpf } = await req.json()

    console.log('Creating admin user:', { email, nome })

    // Create user with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        nome: nome,
        cpf: cpf,
        skip_profile_creation: true // Skip automatic profile creation
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    console.log('User created successfully:', authData.user?.id)

    // Create profile manually
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user?.id,
        nome: nome,
        email: email,
        cpf: cpf,
        area: 'Administração',
        cargo: 'Administrador',
        situacao: 'Ativo'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Don't throw here, user was created successfully
    }

    // Grant admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user?.id,
        role: 'admin'
      })

    if (roleError) {
      console.error('Role error:', roleError)
      // Don't throw here, user was created successfully
    }

    console.log('Admin user setup complete')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user_id: authData.user?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
});