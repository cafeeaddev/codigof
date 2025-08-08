import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Session timeout constants
const SESSION_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const WARNING_TIME = 15 * 60 * 1000; // 15 minutes before timeout
const LAST_ACTIVITY_KEY = 'lastActivity';

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

    // Check for timeout on mount
    handleSessionTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity, true);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (timeoutWarningRef.current) clearTimeout(timeoutWarningRef.current);
    };
  }, [user, updateLastActivity, scheduleSessionWarning, handleSessionTimeout]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'session:', session, 'user:', session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          updateLastActivity(); // Set activity on login
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session, 'user:', session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check timeout on existing session
        if (checkSessionTimeout()) {
          supabase.auth.signOut();
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou após 3 horas de inatividade.",
            duration: 5000,
          });
        } else {
          fetchUserProfile(session.user.id);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [updateLastActivity, checkSessionTimeout]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signInWithCredentials = async (email: string, cpf: string): Promise<{ error?: string }> => {
    try {
      // First, validate user exists and is active
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('cpf', cpf)
        .eq('situacao', 'ATIVO')
        .single();

      if (profileError || !profile) {
        return { error: 'Email ou CPF incorretos ou usuário inativo' };
      }

      // Check if user already has an auth account
      let authResult;
      
      // Try to sign in first (if account exists)
      console.log('Attempting sign in with:', email);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: cpf, // Using CPF as password for simplicity
      });

      console.log('Sign in result:', signInData, 'error:', signInError);

      if (signInError) {
        // If sign in fails, try to create account
        console.log('Sign in failed, attempting sign up...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: cpf,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              nome: profile.nome,
              cpf: profile.cpf
            }
          }
        });

        console.log('Sign up result:', signUpData, 'error:', signUpError);

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          return { error: 'Erro ao criar conta de acesso: ' + signUpError.message };
        }

        authResult = signUpData;
      } else {
        authResult = signInData;
      }

      // Update profile with user_id if needed
      if (authResult.user && !profile.user_id) {
        await supabase
          .from('profiles')
          .update({ user_id: authResult.user.id })
          .eq('id', profile.id);
      }

      toast({
        title: "Acesso autorizado",
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