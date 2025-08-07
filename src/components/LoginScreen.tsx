import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // Find user in profiles table by email and CPF
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('cpf', cpf)
        .eq('situacao', 'ATIVO')
        .single();

      if (error || !profile) {
        toast({
          title: "Acesso negado",
          description: "Email ou CPF incorretos ou usuário inativo",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Acesso autorizado",
        description: `Bem-vindo(a), ${profile.nome}!`,
      });

      // Pass user data to parent component
      onLogin({
        nome: profile.nome,
        email: profile.email,
        area: profile.area,
        cargo: profile.cargo
      });

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
    <div className="w-full max-w-md">
      <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-8 p-3 bg-muted/50 rounded-lg">
          <div className="w-3 h-3 bg-destructive rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-muted-foreground text-sm ml-2 font-mono">NAVE_TERMINAL_v2.0</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">ACESSO SEGURO</h1>
          <p className="text-muted-foreground text-sm">Acesse com seu usuário da UM</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary flex items-center gap-2">
              <User className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/30 border-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-primary flex items-center gap-2">
              <Lock className="w-4 h-4" />
              CPF
            </Label>
            <Input
              id="cpf"
              type="text"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="bg-muted/30 border-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'CONECTANDO...' : 'INICIALIZAR SISTEMA'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-secondary/30">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <span className="text-xs font-mono">&lt;/&gt;</span>
              </div>
              <span className="text-sm">Faça parte da comunidade que impulsiona a transformação</span>
            </div>
            <div className="text-sm text-foreground">
              digital na <span className="text-primary font-bold">Forvis Mazars</span>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Desenvolvido pela <span className="text-accent">Café EAD</span> - Empresa do Grupo <span className="text-accent font-bold">Café Educacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};