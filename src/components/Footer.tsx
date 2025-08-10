
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wifi, User, Lock, Building2, Code2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomeScreen } from './WelcomeScreen';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, signInWithCredentials, signOut } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signInWithCredentials(email, cpf);
      
      if (result.error) {
        toast({
          title: "Erro de autenticação",
          description: result.error,
          variant: "destructive",
        });
      }
      // Success is handled by the AuthContext and onAuthStateChange
    } catch (error) {
      console.error('[Footer] Login error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout Footer chamado');
    await signOut();
    setEmail('');
    setCpf('');
    console.log('Estado limpo - voltando para login');
  };

  // Show welcome screen if user is authenticated
  if (user && profile) {
    return (
      <WelcomeScreen 
        user={profile} 
        userId={user.id}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 pb-[env(safe-area-inset-bottom)] mb-48 sm:mb-64">
      <div className="max-w-md mx-auto">
        <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-t-lg">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground text-sm ml-2 font-mono">NAVE_TERMINAL_v2.0</span>
          </div>

          {/* Wifi icon and title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Wifi className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-secondary text-xl font-bold mb-2">ACESSO SEGURO</h2>
            
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-secondary" />
                <Label htmlFor="email" className="text-secondary text-sm font-medium">
                  Email
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-secondary/50 rounded-lg"
                required
              />
            </div>

            {/* CPF field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                <Label htmlFor="cpf" className="text-secondary text-sm font-medium">
                  CPF (4 últimos dígitos)
                </Label>
              </div>
              <Input
                id="cpf"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={cpf}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Digite os 4 últimos dígitos do seu CPF"
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-secondary/50 rounded-lg"
                required
              />
            </div>

            {/* Login button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'AUTENTICANDO...' : 'INICIALIZAR SISTEMA'}
            </Button>
          </form>

          {/* Community and Developer section */}
          <div className="mt-8 pt-6 border-t border-border/30 space-y-6">
            {/* Community section */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-2">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-foreground text-sm font-medium leading-relaxed">
                Faça parte da comunidade que impulsiona a transformação digital na{' '}
                <span className="text-secondary font-bold">Forvis Mazars</span>
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent w-full max-w-xs"></div>
            </div>

            {/* Developer section */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <Code2 className="w-5 h-5 text-accent" />
              </div>
              <p className="text-muted-foreground text-xs">
                Desenvolvido pela{' '}
                <span className="text-accent font-semibold">Café EAD</span>
                {' '}- Empresa do Grupo{' '}
                <span className="text-accent font-semibold">Café Educacional</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
