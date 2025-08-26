import { Lock, CheckCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  completedMissions: Set<number>;
  currentMission: number;
  extraMissionState: string;
  onMissionSelect: (missionId: number) => void;
}

export const MobileNavigation = ({ 
  completedMissions, 
  currentMission, 
  extraMissionState,
  onMissionSelect 
}: MobileNavigationProps) => {
  // Determinar se deve mostrar missão extra
  const shouldShowExtraMission = completedMissions.size === 4 && extraMissionState !== 'hidden';
  const missions = shouldShowExtraMission ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

  const getMissionStatus = (missionId: number) => {
    const isCompleted = completedMissions.has(missionId);
    const isCurrent = currentMission === missionId;
    const isExtraMission = missionId === 5;
    const isExtraMissionAvailable = extraMissionState === 'available';
    const isExtraMissionCompleted = extraMissionState === 'completed';
    const isExtraMissionDeclined = extraMissionState === 'declined';
    
    if (isExtraMission) {
      if (isExtraMissionCompleted) return 'completed';
      if (isExtraMissionDeclined) return 'declined';
      if (isExtraMissionAvailable) return 'available';
      return 'locked';
    }
    
    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    if (missionId > currentMission && !isCompleted) return 'locked';
    return 'available';
  };

  const getMissionStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/20 border-primary text-primary';
      case 'current':
        return 'bg-accent/20 border-accent text-accent ring-2 ring-accent/30';
      case 'available':
        return 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse';
      case 'declined':
        return 'bg-muted/20 border-muted-foreground/20 text-muted-foreground opacity-70';
      case 'locked':
      default:
        return 'bg-muted/30 border-muted-foreground/30 text-muted-foreground opacity-60';
    }
  };

  const getMissionIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'current':
      case 'available':
        return <Play className="w-4 h-4" />;
      case 'declined':
      case 'locked':
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const isMissionClickable = (status: string) => {
    return status !== 'locked' && status !== 'declined';
  };

  return (
    <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-3 shadow-neon mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-accent text-sm font-bold tracking-wider">
            NAVEGAÇÃO DE MISSÕES
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto">
        {missions.map((missionId) => {
          const status = getMissionStatus(missionId);
          const isClickable = isMissionClickable(status);
          const isExtraMission = missionId === 5;
          
          return (
            <div
              key={missionId}
              className={cn(
                'flex-shrink-0 flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300 min-w-[70px]',
                getMissionStyles(status),
                isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
              )}
              onClick={() => {
                if (isClickable) {
                  onMissionSelect(missionId);
                }
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {getMissionIcon(status)}
                <span className="text-xs font-bold">
                  {isExtraMission ? 'M5' : `M${missionId}`}
                </span>
                {isExtraMission && (
                  <span className="text-[10px] opacity-80">
                    {status === 'available' ? 'Disponível' : 
                     status === 'completed' ? 'Completa' :
                     status === 'declined' ? 'Recusada' : 'Bloqueada'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          Toque em uma missão para navegar
        </p>
      </div>
    </div>
  );
};