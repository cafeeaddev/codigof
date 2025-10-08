import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { emailSchema, cpfSchema, checkRateLimit } from '../_shared/validation.ts';

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
    const body = await req.json();
    
    // Validate input with Zod schemas
    const emailValidation = emailSchema.safeParse(body.email);
    const cpfValidation = cpfSchema.safeParse(body.cpf);
    
    if (!emailValidation.success) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!cpfValidation.success) {
      return new Response(
        JSON.stringify({ error: 'CPF inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const email = emailValidation.data;
    const cpf = cpfValidation.data;
    
    // Rate limiting by IP address (max 5 attempts per minute)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(`auth:${clientIp}`, 5, 60000)) {
      console.log('Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde um momento.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    console.log('Validating profile for email:', email);

    // Primeiro buscar perfil por email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
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

    console.log('Profile found for user:', profile.nome);

    // Validar os 4 últimos dígitos do CPF
    const storedCpf = String(profile.cpf || '').replace(/\D/g, '');
    const inputCpf = String(cpf || '').replace(/\D/g, '');
    
    if (!storedCpf || !inputCpf || storedCpf !== inputCpf) {
      console.log('CPF validation failed');
      return new Response(
        JSON.stringify({ error: 'CPF incorreto' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate secure password using SHA-256 hash with CPF and salt
    const encoder = new TextEncoder();
    const data = encoder.encode(storedCpf + 'SECURE_SALT_2025_FMZ');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password = hashArray.slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('CPF validated successfully');

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

      console.log('Senha atualizada, autenticando usuário');
      
      // Sign in user directly and return session
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (signInError) {
        console.error('Erro ao autenticar:', signInError);
        return new Response(
          JSON.stringify({ error: 'Erro ao autenticar' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Autenticado com sucesso',
          session: signInData.session,
          user: signInData.user
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

      console.log('Usuário criado com sucesso, autenticando:', newUser.user.email);

      // Sign in newly created user
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (signInError) {
        console.error('Erro ao autenticar novo usuário:', signInError);
        return new Response(
          JSON.stringify({ error: 'Usuário criado mas erro ao autenticar' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conta criada e autenticada',
          session: signInData.session,
          user: signInData.user
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