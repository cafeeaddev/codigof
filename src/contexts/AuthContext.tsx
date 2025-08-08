import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Session timeout constants
const SESSION_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const WARNING_TIME = 15 * 60 * 1000; // 15 minutes before timeout
const LAST_ACTIVITY_KEY = 'lastActivity';

// CPF helpers
const normalizeCPF = (value: string) => value.replace(/\D/g, '');
const formatCPF = (digits: string) => {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length !== 11) return digits;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
};

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  area: string;
  cargo: string;
  situacao: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithCredentials: (email: string, cpf: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const warningShownRef = useRef(false);
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  // Check if session has expired
  const checkSessionTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > SESSION_TIMEOUT;
  }, []);

  // Show warning before session expires
  const scheduleSessionWarning = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    const timeUntilWarning = SESSION_TIMEOUT - WARNING_TIME - timeSinceLastActivity;

    if (timeUntilWarning > 0 && !warningShownRef.current) {
      timeoutWarningRef.current = setTimeout(() => {
        if (user && !warningShownRef.current) {
          warningShownRef.current = true;
          toast({
            title: "Sessão expirando",
            description: "Sua sessão expirará em 15 minutos. Clique em qualquer lugar para renovar.",
            duration: 10000,
          });
        }
      }, timeUntilWarning);
    }
  }, [user]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(async () => {
    if (checkSessionTimeout() && user) {
      await supabase.auth.signOut();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      toast({
        title: "Sessão expirada",
        description: "Sua sessão expirou após 3 horas de inatividade.",
        duration: 5000,
      });
    }
  }, [user, checkSessionTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    console.log('[AuthContext] Setting up activity listeners for user:', user.id);

    const handleActivity = () => {
      updateLastActivity();
      warningShownRef.current = false;
      if (timeoutWarningRef.current) {
        clearTimeout(timeoutWarningRef.current);
        timeoutWarningRef.current = null;
      }
      scheduleSessionWarning();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity updates to avoid excessive localStorage writes
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 30000); // Update every 30 seconds max
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, true);
    });

    // Initial activity update and warning schedule
    updateLastActivity();
    scheduleSessionWarning();

    // DON'T check for timeout on mount - let Supabase handle session validity
    console.log('[AuthContext] Activity listeners configured');

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity, true);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (timeoutWarningRef.current) clearTimeout(timeoutWarningRef.current);
    };
  }, [user, updateLastActivity, scheduleSessionWarning]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state change:', event, 'session exists:', !!session, 'user:', session?.user?.id);
        console.log('[AuthContext] Full session object:', session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AuthContext] User logged in, userId:', session.user.id);
          updateLastActivity(); // Set activity on login
          // Defer profile fetch to avoid deadlock
setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email ?? undefined);
          }, 0);
        } else {
          console.log('[AuthContext] User logged out');
          setProfile(null);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check - session exists:', !!session, 'user:', session?.user?.id);
      
      if (session?.user) {
        console.log('[AuthContext] Found existing session for user:', session.user.id);
        // Only set state if we haven't already processed this via onAuthStateChange
        if (!user) {
          setSession(session);
          setUser(session.user);
          updateLastActivity(); // Mark as active
setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email ?? undefined);
          }, 0);
        }
      } else {
        console.log('[AuthContext] No existing session found');
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [updateLastActivity]);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('[AuthContext] Fetching profile for userId:', userId);
      const { data: profileById, error: byIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (byIdError) {
        console.warn('[AuthContext] Error fetching profile by user_id:', byIdError);
      }

      let resolved: any = profileById ?? null;

      // Fallback: try by email if not found
      if (!resolved && userEmail) {
        console.log('[AuthContext] Profile not linked to user_id. Trying by email:', userEmail);
        const { data: profileByEmail, error: byEmailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .eq('situacao', 'ATIVO')
          .limit(1)
          .maybeSingle();

        if (byEmailError) {
          console.warn('[AuthContext] Error fetching profile by email:', byEmailError);
        }

        if (profileByEmail) {
          resolved = profileByEmail;
          // Attempt to link profile with user_id
          if (!profileByEmail.user_id) {
            const { error: linkError } = await supabase
              .from('profiles')
              .update({ user_id: userId })
              .eq('id', profileByEmail.id);
            if (linkError) {
              console.warn('[AuthContext] Failed to link profile.user_id:', linkError);
            } else {
              console.log('[AuthContext] Linked profile to user_id:', userId);
            }
          }
        }
      }

      if (!resolved) {
        console.log('[AuthContext] No profile found for user. Proceeding without profile.');
        setProfile(null);
        return;
      }

      console.log('[AuthContext] Profile fetched successfully for:', resolved.email);
      setProfile(resolved as UserProfile);
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
    }
  };

  const signInWithCredentials = async (email: string, cpf: string): Promise<{ error?: string }> => {
    try {
      console.log('[AuthContext] Starting login with email:', email);

      // Validar que o usuário informou exatamente os 4 últimos dígitos
      const inputClean = cpf.replace(/\D/g, '');
      if (inputClean.length !== 4) {
        return { error: 'Informe apenas os 4 últimos dígitos do CPF' };
      }

      // Buscar perfil ativo pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('situacao', 'ATIVO')
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.log('[AuthContext] Profile query error:', profileError);
      }
      if (!profile) {
        console.log('[AuthContext] Profile not found for email');
        return { error: 'Email ou CPF incorretos ou usuário inativo' };
      }

      console.log('[AuthContext] Found profile:', profile.nome, 'user_id:', profile.user_id);

      // Validar últimos 4 dígitos do CPF cadastrado
      const storedFullCpf = String(profile.cpf || '').replace(/\D/g, '');
      if (!storedFullCpf || !storedFullCpf.endsWith(inputClean)) {
        return { error: 'CPF incorreto' };
      }

      // Se já tem user_id, login direto com o CPF completo como senha
      if (profile.user_id) {
        console.log('[AuthContext] Profile has user_id, attempting direct sign in');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: storedFullCpf,
        });

        if (signInError) {
          console.error('[AuthContext] Direct sign in failed:', signInError);
          return { error: 'Credenciais inválidas' };
        }

        console.log('[AuthContext] Direct sign in successful, user:', signInData.user?.id);
        // Desbloqueia a UI rapidamente
        // O fetchUserProfile complementará se necessário
        return {};
      }

      // Rate limiting simples
      const lastSignUpAttempt = localStorage.getItem('lastSignUpAttempt');
      const now = Date.now();
      if (lastSignUpAttempt) {
        const timeSinceLastAttempt = now - parseInt(lastSignUpAttempt);
        const cooldownTime = 60000; // 1 minuto
        if (timeSinceLastAttempt < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - timeSinceLastAttempt) / 1000);
          return { error: `Aguarde ${remainingTime} segundos antes de tentar novamente` };
        }
      }
      localStorage.setItem('lastSignUpAttempt', now.toString());

      // Criar conta no Supabase Auth usando o CPF completo como senha
      console.log('[AuthContext] Creating new auth account for existing profile');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: storedFullCpf,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: profile.nome,
            cpf: profile.cpf,
            skip_profile_creation: true,
          },
        },
      });

      if (signUpError) {
        console.error('[AuthContext] Sign up error:', signUpError);
        return { error: 'Erro ao criar conta de acesso: ' + signUpError.message };
      }

      if (!signUpData.user) {
        console.error('[AuthContext] No user returned from signUp');
        return { error: 'Erro ao criar usuário' };
      }

      console.log('[AuthContext] SignUp successful, user created:', signUpData.user.id);

      // Agora fazer login para criar a sessão ativa
      console.log('[AuthContext] Now signing in to create active session');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: storedFullCpf,
      });

      if (signInError) {
        console.error('[AuthContext] Sign in after signup failed:', signInError);
        return { error: 'Conta criada mas erro no login: ' + signInError.message };
      }

      console.log('[AuthContext] Sign in after signup successful:', signInData.user?.id);

      // fetchUserProfile fará o vínculo user_id via política RLS após autenticação, se necessário
      toast({
        title: "Login realizado",
        description: `Bem-vindo(a), ${profile.nome}!`,
      });

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signInWithCredentials,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
