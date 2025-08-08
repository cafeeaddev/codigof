
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, Wifi } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e CPF",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signInWithCredentials(email, cpf);
      
      if (error) {
        toast({
          title: "Acesso negado",
          description: error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao sistema. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 sm:p-6 lg:p-8 shadow-neon">
        {/* Terminal header */}
        <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 p-2 sm:p-3 bg-muted/50 rounded-lg">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-destructive rounded-full"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
          <span className="text-muted-foreground text-xs sm:text-sm ml-1 sm:ml-2 font-mono">NAVE_TERMINAL_v2.0</span>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Wifi className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary mb-2">ACESSO SEGURO</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Acesse com seu usuário da UM</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-primary flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/30 border-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary text-sm sm:text-base h-10 sm:h-12"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="cpf" className="text-primary flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              CPF (4 últimos dígitos)
            </Label>
            <Input
              id="cpf"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="Digite os 4 últimos dígitos do seu CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="bg-muted/30 border-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary text-sm sm:text-base h-10 sm:h-12"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 sm:py-3 text-base sm:text-lg h-10 sm:h-12"
            disabled={isLoading}
          >
            {isLoading ? 'CONECTANDO...' : 'INICIALIZAR SISTEMA'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-secondary/30">
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-primary">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/20 rounded flex items-center justify-center">
                <span className="text-xs font-mono">&lt;/&gt;</span>
              </div>
              <span className="text-xs sm:text-sm text-center">Faça parte da comunidade que impulsiona a transformação</span>
            </div>
            <div className="text-xs sm:text-sm text-foreground">
              digital na <span className="text-primary font-bold">Forvis Mazars</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-4">
              Desenvolvido pela <span className="text-accent">Café EAD</span> - Empresa do Grupo <span className="text-accent font-bold">Café Educacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
