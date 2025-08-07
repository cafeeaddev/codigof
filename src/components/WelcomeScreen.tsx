import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';

interface WelcomeScreenProps {
  user: {
    nome: string;
    email: string;
    area?: string;
    cargo?: string;
  };
  onLogout: () => void;
}

export const WelcomeScreen = ({ user, onLogout }: WelcomeScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: "Ocorreu um erro ao fazer logout",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });

      onLogout();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-t-lg">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground text-sm ml-2 font-mono">LOADING_SYSTEM_v2.0</span>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <Loader2 className="w-12 h-12 text-secondary animate-spin" />
              <div className="space-y-2 text-center">
                <h2 className="text-secondary text-xl font-bold tracking-wider">
                  CARREGANDO SISTEMA
                </h2>
                <p className="text-muted-foreground text-sm">
                  Preparando ambiente seguro...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-t-lg">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground text-sm ml-2 font-mono">WELCOME_SYSTEM_v2.0</span>
          </div>

          {/* Welcome content */}
          <div className="text-center space-y-6">
            {/* User icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
                <User className="w-8 h-8 text-secondary" />
              </div>
            </div>

            {/* Welcome message */}
            <div className="space-y-3">
              <h2 className="text-secondary text-2xl font-bold tracking-wider">
                BEM-VINDO
              </h2>
              <div className="space-y-1">
                <p className="text-foreground text-lg font-semibold">
                  {user.nome}
                </p>
                <p className="text-muted-foreground text-sm">
                  {user.email}
                </p>
                {user.area && (
                  <p className="text-muted-foreground text-xs">
                    {user.area} {user.cargo && `• ${user.cargo}`}
                  </p>
                )}
              </div>
            </div>

            {/* Access message */}
            <div className="py-4">
              <p className="text-foreground text-sm leading-relaxed">
                Sistema iniciado com sucesso. 
                <br />
                <span className="text-secondary font-medium">Acesso autorizado.</span>
              </p>
            </div>

            {/* Logout button */}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold py-3 rounded-lg transition-colors duration-200"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  DESCONECTANDO...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  SAIR DO SISTEMA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};