import React from 'react';
import { Button } from '@/components/ui/button';
import { QuizDigital } from './QuizDigital';
import { MissaoDois } from './MissaoDois';
import { MissaoTres } from './MissaoTres';
import { MissaoQuatro } from './MissaoQuatro';

import { useGameProgress } from '@/hooks/useGameProgress';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  user: any;
  onLogout: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onLogout }) => {
  const { 
    currentMission, 
    completedMissions, 
    totalXp, 
    isLoading, 
    startMission, 
    completeMission
  } = useGameProgress();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userProgress = {
    total_xp: totalXp,
    completed_count: completedMissions.length
  };

  const handleLogout = () => {
    onLogout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const handleMissionComplete = async (missionNumber: number, responses?: any) => {
    await completeMission(missionNumber, responses);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-card/90 backdrop-blur-xl border-b border-secondary/50 p-3 md:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
                <User className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-secondary text-sm md:text-xl font-bold tracking-wider truncate">
                  {user?.nome || 'Usuário'}
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm truncate">
                  {user?.area} {user?.cargo && `• ${user.cargo}`}
                </p>
              </div>
              
              {/* Estatísticas no Header - Apenas Desktop */}
              <div className="hidden md:flex items-center gap-6 ml-20 mr-8">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{userProgress.total_xp}</div>
                  <div className="text-muted-foreground text-xs">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{userProgress.completed_count}</div>
                  <div className="text-muted-foreground text-xs">Concluídas</div>
                </div>
              </div>
            </div>
            
            {/* Admin Button */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin')}
                className="mr-2"
              >
                ADMIN
              </Button>
            )}
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400"
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
              <div className="text-lg font-bold text-accent">{userProgress.completed_count}</div>
              <div className="text-muted-foreground text-xs">Concluídas</div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-8rem)] overflow-hidden p-3 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            
            {/* Layout Mobile: Missão ativa em tela cheia */}
            <div className="block md:hidden h-full">
              <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon h-full overflow-hidden flex flex-col">
                <div className="flex items-center justify-center mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-accent text-sm font-bold tracking-wider">
                      MISSÃO {currentMission} ATIVADA
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {currentMission === 1 && !completedMissions.includes(1) ? (
                    <QuizDigital onClose={() => handleMissionComplete(1)} />
                  ) : currentMission === 2 && !completedMissions.includes(2) ? (
                    <MissaoDois onComplete={() => handleMissionComplete(2)} />
                  ) : currentMission === 3 && !completedMissions.includes(3) ? (
                    <MissaoTres onComplete={() => handleMissionComplete(3)} />
                  ) : currentMission === 4 && !completedMissions.includes(4) ? (
                    <MissaoQuatro onComplete={() => handleMissionComplete(4)} />
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
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold"
                        onClick={() => {
                          if (currentMission <= 4) {
                            startMission(currentMission);
                          }
                        }}
                      >
                        {currentMission === 1 ? 'INICIAR PRIMEIRA MISSÃO' : 
                         currentMission === 5 ? 'MISSÕES COMPLETADAS!' : 
                         `CONTINUAR MISSÃO ${currentMission}`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Layout Desktop: Grid com sidebar de missões */}
            <div className="hidden md:block h-full">
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Missões Diárias - 2 colunas */}
                <div className="col-span-2 h-full overflow-hidden">
                  <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-primary text-sm font-bold tracking-wider">MISSÕES DO CÓDIGO F</span>
                    </div>

                    <div className="space-y-4 overflow-hidden flex-1">
                      {[
                        { id: 1, title: "MISSÃO 1 – Como você encara o digital?", progress: completedMissions.includes(1) ? 4 : 0, total: 4, xp: 50 },
                        { id: 2, title: "MISSÃO 2 – O digital no seu dia a dia", progress: completedMissions.includes(2) ? 3 : 0, total: 3, xp: 50 },
                        { id: 3, title: "MISSÃO 3 – Quando o desafio é maior", progress: completedMissions.includes(3) ? 1 : 0, total: 1, xp: 50 },
                        { id: 4, title: "MISSÃO 4 - Seu Radar de Ferramentas", progress: completedMissions.includes(4) ? 10 : 0, total: 10, xp: 50 }
                      ].map((mission) => {
                        const isCompleted = completedMissions.includes(mission.id);
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
                            onClick={() => {
                              if (isActive) {
                                startMission(mission.id);
                              }
                            }}
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

                {/* Área da Missão Ativa - 3 colunas */}
                <div className="col-span-3 h-full overflow-hidden">
                  <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-6 shadow-neon h-full overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <span className="text-accent text-sm font-bold tracking-wider">
                        MISSÃO {currentMission} ATIVADA
                      </span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {currentMission === 1 && !completedMissions.includes(1) ? (
                        <QuizDigital onClose={() => handleMissionComplete(1)} />
                      ) : currentMission === 2 && !completedMissions.includes(2) ? (
                        <MissaoDois onComplete={() => handleMissionComplete(2)} />
                      ) : currentMission === 3 && !completedMissions.includes(3) ? (
                        <MissaoTres onComplete={() => handleMissionComplete(3)} />
                      ) : currentMission === 4 && !completedMissions.includes(4) ? (
                        <MissaoQuatro onComplete={() => handleMissionComplete(4)} />
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
    </div>
  );
};