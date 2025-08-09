import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, cpf } = await req.json();

    if (!email || !cpf) {
      return new Response(
        JSON.stringify({ error: 'Email e CPF são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Cliente com service role para operações administrativas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Validando perfil para email:', email, 'e CPF:', cpf);

    // Buscar perfil na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('cpf', cpf)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!profile) {
      console.log('Perfil não encontrado para email/CPF fornecidos');
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Perfil encontrado:', profile.nome);

    // Extrair os 4 dígitos do CPF como senha
    const password = cpf.slice(-4);

    // Verificar se já existe usuário no Auth com este email
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (existingUser.user) {
      console.log('Usuário já existe no Auth, fazendo login');
      
      // Se o profile não tem user_id, vincular com o usuário existente
      if (!profile.user_id) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ user_id: existingUser.user.id })
          .eq('email', email)
          .eq('cpf', cpf);

        if (updateError) {
          console.error('Erro ao vincular perfil:', updateError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário validado',
          email,
          password 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.log('Criando novo usuário no Auth');
      
      // Criar novo usuário no Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Email já confirmado
        user_metadata: {
          nome: profile.nome,
          cpf: profile.cpf,
          skip_profile_creation: true // Flag para não criar perfil duplicado
        }
      });

      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        return new Response(
          JSON.stringify({ error: 'Erro interno do servidor' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Vincular o perfil ao novo usuário
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ user_id: newUser.user.id })
        .eq('email', email)
        .eq('cpf', cpf);

      if (updateError) {
        console.error('Erro ao vincular perfil:', updateError);
      }

      console.log('Usuário criado com sucesso:', newUser.user.email);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário criado e validado',
          email,
          password 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Erro na edge function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});