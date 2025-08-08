import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuizDigital } from './QuizDigital';
import { MissaoDois } from './MissaoDois';
import { MissaoTres } from './MissaoTres';
import { MissaoQuatro } from './MissaoQuatro';

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
  const [currentMission, setCurrentMission] = useState<1 | 2 | 3 | 4>(1);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({ total_xp: 0, completedMissionsCount: 0 });

  // Função para atualizar progresso localmente
  const updateProgress = (missionId: number) => {
    if (!completedMissions.has(missionId)) {
      setUserProgress(prev => ({
        total_xp: prev.total_xp + 25,
        completedMissionsCount: prev.completedMissionsCount + 1
      }));
    }
  };

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (progress) {
            setUserProgress({ 
              total_xp: progress.total_xp, 
              completedMissionsCount: [
                progress.missao_1_completed,
                progress.missao_2_completed,
                progress.missao_3_completed,
                progress.missao_4_completed
              ].filter(Boolean).length
            });
            
            // Set completed missions
            const completed = new Set<number>();
            if (progress.missao_1_completed) completed.add(1);
            if (progress.missao_2_completed) completed.add(2);
            if (progress.missao_3_completed) completed.add(3);
            if (progress.missao_4_completed) completed.add(4);
            setCompletedMissions(completed);
          }
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadUserProgress();
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
            <div className="hidden md:flex items-center gap-6 ml-20 mr-8">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{userProgress.total_xp}</div>
                <div className="text-muted-foreground text-xs">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{userProgress.completedMissionsCount}</div>
                <div className="text-muted-foreground text-xs">Concluídas</div>
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
            <div className="text-lg font-bold text-primary">{userProgress.total_xp}</div>
            <div className="text-muted-foreground text-xs">XP Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">{userProgress.completedMissionsCount}</div>
            <div className="text-muted-foreground text-xs">Concluídas</div>
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
                  <span className="text-accent text-sm font-bold tracking-wider">
                    MISSÃO {currentMission} ATIVADA
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMission(currentMission >= 4 ? 1 : (currentMission + 1) as 1 | 2 | 3 | 4)}
                  className="text-xs"
                >
                  Próxima Missão
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                {currentMission === 1 && !completedMissions.has(1) ? (
                  <QuizDigital onClose={() => {
                    updateProgress(1);
                    setCompletedMissions(prev => new Set([...prev, 1]));
                    setCurrentMission(2);
                  }} />
                ) : currentMission === 2 && !completedMissions.has(2) ? (
                  <MissaoDois onComplete={() => {
                    updateProgress(2);
                    setCompletedMissions(prev => new Set([...prev, 2]));
                    setCurrentMission(3);
                    toast({
                      title: "Missão 2 concluída! +25 XP",
                      description: "Missão 3 desbloqueada! Continue evoluindo.",
                    });
                  }} />
                ) : currentMission === 3 && !completedMissions.has(3) ? (
                  <MissaoTres onComplete={() => {
                    updateProgress(3);
                    setCompletedMissions(prev => new Set([...prev, 3]));
                    setCurrentMission(4);
                    toast({
                      title: "Missão 3 concluída! +25 XP",
                      description: "Missão 4 desbloqueada! Continue evoluindo.",
                    });
                  }} />
                ) : currentMission === 4 && !completedMissions.has(4) ? (
                  <MissaoQuatro onComplete={() => {
                    updateProgress(4);
                    setCompletedMissions(prev => new Set([...prev, 4]));
                    toast({
                      title: "Missão 4 concluída! +25 XP",
                      description: "Parabéns! Todas as missões foram concluídas.",
                    });
                  }} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-primary mb-1">
                        Missões Completadas!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Aguarde novas missões em breve.
                      </p>
                    </div>
                  </div>
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
                    <span className="text-primary text-sm font-bold tracking-wider">MISSÕES DO CÓDIGO F</span>
                  </div>

                  <div className="space-y-4 overflow-hidden flex-1">
                    {[
                      { id: 1, title: "MISSÃO 1 – Como você encara o digital?", progress: completedMissions.has(1) ? 4 : 0, total: 4, xp: 25 },
                      { id: 2, title: "MISSÃO 2 – O digital no seu dia a dia", progress: completedMissions.has(2) ? 3 : 0, total: 3, xp: 25 },
                      { id: 3, title: "MISSÃO 3 – Quando o desafio é maior", progress: completedMissions.has(3) ? 1 : 0, total: 1, xp: 25 },
                      { id: 4, title: "MISSÃO 4 - Seu Radar de Ferramentas", progress: completedMissions.has(4) ? 10 : 0, total: 10, xp: 25 }
                    ].map((mission) => {
                      const isCompleted = completedMissions.has(mission.id);
                      const isActive = mission.id === currentMission && !isCompleted;
                      return (
                        <div 
                          key={mission.id} 
                          className={`bg-muted/30 rounded-lg p-4 border transition-all ${
                            isCompleted
                              ? 'border-primary/50 bg-primary/5 opacity-80' 
                              : isActive 
                                ? 'border-primary/50 bg-primary/10 cursor-pointer' 
                                : 'border-secondary/30'
                          }`}
                          onClick={() => isActive && setCurrentMission(mission.id as 1 | 2 | 3 | 4)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <h3 className={`font-medium text-sm ${
                                isCompleted ? 'text-primary line-through' : 'text-foreground'
                              }`}>{mission.title}</h3>
                            </div>
                            <span className="text-accent text-xs font-bold">+{mission.xp} XP</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-secondary/20 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-primary' : isActive ? 'bg-primary' : 'bg-secondary'
                                }`}
                                style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {mission.progress}/{mission.total}
                            </span>
                          </div>
                          {isCompleted && (
                            <div className="mt-2 text-xs text-primary font-medium">
                              ✓ CONCLUÍDA
                            </div>
                          )}
                          {isActive && (
                            <div className="mt-2 text-xs text-primary font-medium">
                              ● ATIVA
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Desafios Semanais - 3 colunas (maior para quiz) */}
              <div className="col-span-3 h-full overflow-hidden">
                <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-accent text-sm font-bold tracking-wider">
                      MISSÃO {currentMission} ATIVADA
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {currentMission === 1 && !completedMissions.has(1) ? (
                      <QuizDigital onClose={() => {
                        updateProgress(1);
                        setCompletedMissions(prev => new Set([...prev, 1]));
                        setCurrentMission(2);
                      }} />
                    ) : currentMission === 2 && !completedMissions.has(2) ? (
                      <MissaoDois onComplete={() => {
                        updateProgress(2);
                        setCompletedMissions(prev => new Set([...prev, 2]));
                        setCurrentMission(3);
                        toast({
                          title: "Missão 2 concluída! +25 XP",
                          description: "Missão 3 desbloqueada! Continue evoluindo.",
                        });
                      }} />
                    ) : currentMission === 3 && !completedMissions.has(3) ? (
                      <MissaoTres onComplete={() => {
                        updateProgress(3);
                        setCompletedMissions(prev => new Set([...prev, 3]));
                        setCurrentMission(4);
                        toast({
                          title: "Missão 3 concluída! +25 XP",
                          description: "Missão 4 desbloqueada! Continue evoluindo.",
                        });
                      }} />
                    ) : currentMission === 4 && !completedMissions.has(4) ? (
                      <MissaoQuatro onComplete={() => {
                        updateProgress(4);
                        setCompletedMissions(prev => new Set([...prev, 4]));
                        toast({
                          title: "Missão 4 concluída! +25 XP",
                          description: "Parabéns! Todas as missões foram concluídas.",
                        });
                      }} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-primary mb-1">
                            Missões Completadas!
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Aguarde novas missões em breve.
                          </p>
                        </div>
                      </div>
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