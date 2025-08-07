import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuizDigital } from './QuizDigital';
import { MissaoDois } from './MissaoDois';

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
  const [currentMission, setCurrentMission] = useState<1 | 2>(1);

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
      <div className="bg-card/90 backdrop-blur-xl border-b border-secondary/50 p-3 md:p-4 relative z-10" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
              <User className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-secondary text-sm md:text-xl font-bold tracking-wider truncate">
                {user.nome}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm truncate">
                {user.area} {user.cargo && `• ${user.cargo}`}
              </p>
            </div>
            
            {/* Estatísticas no Header - Apenas Desktop */}
            <div className="hidden md:flex items-center gap-6 ml-8">
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
            size="sm"
            className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">SAIR</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas Mobile - Abaixo do Header */}
      <div className="block md:hidden bg-card/80 backdrop-blur-xl border-b border-secondary/30 px-4 py-3">
        <div className="flex items-center justify-center gap-8 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">1,250</div>
            <div className="text-muted-foreground text-xs">XP Total</div>
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

      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden p-3 md:p-6 relative z-10">
        <div className="max-w-7xl mx-auto h-full">
          
          {/* Layout Mobile: Apenas a missão ativa em tela cheia */}
          <div className="block md:hidden h-full">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon h-full overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-accent text-sm font-mono font-bold">
                    {currentMission === 1 ? 'MISSÃO 1 ATIVADA' : 'MISSÃO 2 ATIVADA'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMission(currentMission === 1 ? 2 : 1)}
                  className="text-xs"
                >
                  Ver Missão {currentMission === 1 ? '2' : '1'}
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                {currentMission === 1 ? (
                  <QuizDigital onClose={() => setCurrentMission(2)} />
                ) : (
                  <MissaoDois onComplete={() => {
                    toast({
                      title: "Missão 2 concluída!",
                      description: "Parabéns! Continue evoluindo.",
                    });
                  }} />
                )}
              </div>
            </div>
          </div>

          {/* Layout Desktop: Grid com sidebar de missões */}
          <div className="hidden md:block h-full">
            <div className="grid grid-cols-5 gap-6 h-full">
              {/* Missões Diárias - 2 colunas (menor) */}
              <div className="col-span-2 h-full overflow-hidden">
                <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-primary text-sm font-mono font-bold">MISSÕES DO CÓDIGO F</span>
                  </div>

                  <div className="space-y-4 overflow-hidden flex-1">
                    {[
                      { title: currentMission === 1 ? "MISSÃO 1 – Como você encara o digital?" : "MISSÃO 2 – O digital no seu dia a dia", progress: currentMission === 1 ? 0 : 3, total: currentMission === 1 ? 4 : 3, xp: 150, active: true },
                      { title: "MISSÃO 3 – Quando o desafio é maior", progress: 0, total: 1, xp: 200, active: false },
                      { title: "MISSÃO 4 – Ferramentas Avançadas", progress: 1, total: 1, xp: 100, active: false },
                      { title: "Missão 5 – Seu Radar de Ferramentas", progress: 0, total: 2, xp: 250, active: false }
                    ].map((mission, index) => (
                      <div 
                        key={index} 
                        className={`bg-muted/30 rounded-lg p-4 border transition-all cursor-pointer ${
                          mission.active 
                            ? 'border-primary/50 bg-primary/10' 
                            : 'border-secondary/30 hover:border-secondary/50'
                        }`}
                        onClick={() => mission.active && setCurrentMission(index === 0 ? (currentMission === 1 ? 2 : 1) : currentMission)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-foreground font-medium text-sm">{mission.title}</h3>
                          <span className="text-accent text-xs font-bold">+{mission.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-secondary/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                mission.active ? 'bg-primary' : 'bg-secondary'
                              }`}
                              style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {mission.progress}/{mission.total}
                          </span>
                        </div>
                        {mission.active && (
                          <div className="mt-2 text-xs text-primary font-medium">
                            ● ATIVA
                          </div>
                        )}
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
                    <span className="text-accent text-sm font-mono font-bold">
                      {currentMission === 1 ? 'MISSÃO 1 ATIVADA' : 'MISSÃO 2 ATIVADA'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {currentMission === 1 ? (
                      <QuizDigital onClose={() => setCurrentMission(2)} />
                    ) : (
                      <MissaoDois onComplete={() => {
                        toast({
                          title: "Missão 2 concluída!",
                          description: "Parabéns! Continue evoluindo.",
                        });
                      }} />
                    )}
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