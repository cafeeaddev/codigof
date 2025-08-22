import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, CheckCircle, Circle } from 'lucide-react';

interface MissionProgressProps {
  completedMissions: Set<number>;
  currentMission: number;
  isMission5Eligible: boolean;
  showMission5: boolean;
  className?: string;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({
  completedMissions,
  currentMission,
  isMission5Eligible,
  showMission5,
  className
}) => {
  const missions = [
    {
      id: 1,
      title: "MISSÃO 1",
      subtitle: "Como você encara o digital?",
      description: "Vale 25 XP"
    },
    {
      id: 2,
      title: "MISSÃO 2", 
      subtitle: "O digital no seu dia a dia",
      description: "Vale 25 XP"
    },
    {
      id: 3,
      title: "MISSÃO 3",
      subtitle: "Quando o desafio é maior",
      description: "Vale 25 XP"
    },
    {
      id: 4,
      title: "MISSÃO 4",
      subtitle: "Seu Radar de Ferramentas",
      description: "Vale 25 XP"
    },
    {
      id: 5,
      title: "MISSÃO 5",
      subtitle: "Fast Track Digital",
      description: "Missão Bônus"
    }
  ];

  const getMissionStatus = (missionId: number) => {
    if (completedMissions.has(missionId)) {
      return 'completed';
    }
    if (missionId === currentMission) {
      return 'current';
    }
    if (missionId === 5 && !isMission5Eligible) {
      return 'locked';
    }
    if (missionId < currentMission) {
      return 'available';
    }
    return 'locked';
  };

  const getMissionIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'current':
        return <Circle className="w-6 h-6 text-white" />;
      default:
        return <Lock className="w-6 h-6 text-white/60" />;
    }
  };

  const getMissionStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          card: "bg-gradient-to-br from-neon-pink/90 to-neon-purple/80 border-neon-pink/50",
          progress: "bg-neon-pink w-full",
          text: "text-white"
        };
      case 'current':
        return {
          card: "bg-gradient-to-br from-neon-cyan/90 to-primary/80 border-neon-cyan/50",
          progress: "bg-neon-cyan w-2/3",
          text: "text-white"
        };
      case 'available':
        return {
          card: "bg-gradient-to-br from-secondary/40 to-accent/30 border-secondary/30",
          progress: "bg-secondary/40 w-0",
          text: "text-white/90"
        };
      default:
        return {
          card: "bg-gradient-to-br from-muted/20 to-background/30 border-border/30",
          progress: "bg-muted/20 w-0",
          text: "text-muted-foreground"
        };
    }
  };

  // Filtrar missões baseado na elegibilidade da Missão 5
  const visibleMissions = missions.filter(mission => 
    mission.id <= 4 || (mission.id === 5 && (isMission5Eligible || showMission5))
  );

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {visibleMissions.map((mission) => {
        const status = getMissionStatus(mission.id);
        const styles = getMissionStyles(status);
        
        return (
          <div
            key={mission.id}
            className={cn(
              "relative rounded-lg border p-4 backdrop-blur-sm",
              "transition-all duration-300 hover:scale-105",
              styles.card
            )}
          >
            {/* Header com ícone */}
            <div className="flex items-center justify-between mb-3">
              <div className={cn("font-bold text-sm", styles.text)}>
                {mission.title}
              </div>
              {getMissionIcon(status)}
            </div>

            {/* Conteúdo */}
            <div className="space-y-3">
              <h3 className={cn("font-medium text-sm leading-tight", styles.text)}>
                {mission.subtitle}
              </h3>
              
              <p className={cn("text-xs opacity-80", styles.text)}>
                {mission.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    styles.progress
                  )}
                />
              </div>
            </div>

            {/* Status indicator */}
            {status === 'completed' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MissionProgress;