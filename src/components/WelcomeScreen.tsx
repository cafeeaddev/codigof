import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    onLogout();
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
    <>
      {/* CSS global para esconder scrollbars */}
      <style>{`
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
        }
        .welcome-screen * {
          overflow: hidden !important;
        }
      `}</style>
      
      <div 
        className="fixed inset-0 bg-background z-[9999] welcome-screen" 
        style={{ 
          height: '100vh', 
          width: '100vw',
          pointerEvents: 'auto',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-secondary/50 p-4 relative z-10" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-secondary text-xl font-bold tracking-wider">
                  {user.nome}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {user.area} {user.cargo && `• ${user.cargo}`}
                </p>
              </div>
            </div>
            
            {/* Estatísticas no Header */}
            <div className="flex items-center gap-6 ml-8">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">1,250</div>
                <div className="text-muted-foreground text-xs">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">15</div>
                <div className="text-muted-foreground text-xs">Missões</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">8</div>
                <div className="text-muted-foreground text-xs">Desafios</div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            SAIR
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-5rem)] overflow-hidden p-6 relative z-10">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 gap-6 h-full">
            <div className="h-full overflow-hidden">
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Missões Diárias - 2 colunas (menor) */}
                <div className="col-span-2 h-full overflow-hidden">
                  <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-primary text-sm font-mono font-bold">MISSÕES DIÁRIAS</span>
                    </div>

                    <div className="space-y-4 overflow-hidden flex-1">
                      {[
                        { title: "Completar 3 treinamentos", progress: 2, total: 3, xp: 150 },
                        { title: "Participar de 1 reunião de equipe", progress: 0, total: 1, xp: 200 },
                        { title: "Revisar documentação técnica", progress: 1, total: 1, xp: 100 }
                      ].map((mission, index) => (
                        <div key={index} className="bg-muted/30 rounded-lg p-4 border border-secondary/30">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-foreground font-medium text-sm">{mission.title}</h3>
                            <span className="text-accent text-xs font-bold">+{mission.xp} XP</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-secondary/20 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {mission.progress}/{mission.total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desafios Semanais - 3 colunas (maior para quiz) */}
                <div className="col-span-3 h-full overflow-hidden">
                  <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <span className="text-accent text-sm font-mono font-bold">DESAFIOS SEMANAIS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                      {[
                        { title: "Quiz de Segurança", status: "Disponível", difficulty: "Fácil" },
                        { title: "Projeto Colaborativo", status: "Em Progresso", difficulty: "Médio" },
                        { title: "Avaliação Técnica", status: "Bloqueado", difficulty: "Difícil" },
                        { title: "Workshop Prático", status: "Disponível", difficulty: "Médio" }
                      ].map((challenge, index) => (
                        <div key={index} className="bg-muted/30 rounded-lg p-4 border border-secondary/30 hover:border-secondary/60 transition-colors cursor-pointer">
                          <h3 className="text-foreground font-medium mb-2">{challenge.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              challenge.status === 'Disponível' ? 'bg-primary/20 text-primary' :
                              challenge.status === 'Em Progresso' ? 'bg-accent/20 text-accent' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {challenge.status}
                            </span>
                            <span className="text-muted-foreground text-xs">{challenge.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};