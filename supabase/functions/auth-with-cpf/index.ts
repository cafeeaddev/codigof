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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!serviceRoleKey 
      });
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Validando perfil para email:', email, 'e CPF:', cpf);

    // Primeiro buscar perfil por email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('situacao', 'ATIVO')
      .maybeSingle();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!profile) {
      console.log('Perfil não encontrado para email:', email);
      return new Response(
        JSON.stringify({ error: 'Email não encontrado ou usuário inativo' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Perfil encontrado:', profile.nome, 'CPF cadastrado:', profile.cpf);

    // Validar os 4 últimos dígitos do CPF
    const storedCpf = String(profile.cpf || '').replace(/\D/g, '');
    const inputCpf = String(cpf || '').replace(/\D/g, '');
    
    if (!storedCpf || !inputCpf || storedCpf !== inputCpf) {
      console.log('CPF incorreto. Esperado:', storedCpf, 'Recebido:', inputCpf);
      return new Response(
        JSON.stringify({ error: 'CPF incorreto' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Usar os 4 dígitos do CPF como senha (repetir para formar uma senha de 8 dígitos)
    const password = storedCpf + storedCpf;

    console.log('CPF validado. Senha será:', password.slice(0, 2) + '***' + password.slice(-2));

    // Verificar se já existe usuário no Auth com este email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    let existingUser = null;
    if (!listError && existingUsers?.users) {
      existingUser = existingUsers.users.find(user => user.email === email);
    }

    if (existingUser) {
      console.log('Usuário já existe no Auth, atualizando senha');
      
      // Atualizar a senha do usuário existente para o padrão dos 4 dígitos duplicados
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password }
      );

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro interno do servidor' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Se o profile não tem user_id, vincular com o usuário existente
      if (!profile.user_id) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ user_id: existingUser.id })
          .eq('email', email);

        if (updateError) {
          console.error('Erro ao vincular perfil:', updateError);
        }
      }

      console.log('Senha atualizada e usuário validado');
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
        .eq('email', email);

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