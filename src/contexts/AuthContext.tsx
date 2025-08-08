import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: cpf, // Using CPF as password for simplicity
      });

      if (signInError) {
        // If sign in fails, try to create account
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

        if (signUpError) {
          return { error: 'Erro ao criar conta de acesso' };
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