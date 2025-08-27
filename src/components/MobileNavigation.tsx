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

  const getMissionStyles = (status: string, isClickable: boolean) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/20 border-primary text-primary';
      case 'current':
        return 'bg-accent/20 border-accent text-accent ring-2 ring-accent/30';
      case 'available':
        return `bg-cyan-500/20 border-cyan-400 text-cyan-400 ${isClickable ? 'animate-pulse' : ''}`;
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
    <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-2.5 shadow-neon mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
        <span className="text-accent text-xs font-bold tracking-wider">
          MISSÕES
        </span>
      </div>
      
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {missions.map((missionId) => {
          const status = getMissionStatus(missionId);
          const isClickable = isMissionClickable(status);
          const isExtraMission = missionId === 5;
          
          return (
            <div
              key={missionId}
              className={cn(
                'flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 min-w-[85px] min-h-[90px] relative',
                getMissionStyles(status, isClickable),
                isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'
              )}
              onClick={() => {
                if (isClickable) {
                  onMissionSelect(missionId);
                }
              }}
            >
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                {getMissionIcon(status)}
                <span className="text-sm font-bold">
                  {isExtraMission ? 'M5' : `M${missionId}`}
                </span>
                
                {/* Status integrado */}
                <div className="text-center">
                  <span className="text-[9px] font-semibold uppercase tracking-wider leading-none">
                    {status === 'completed' && 'COMPLETA'}
                    {status === 'current' && 'ATIVA'}
                    {status === 'available' && (isExtraMission ? 'DISPONÍVEL' : 'DESBLOQUEADA')}
                    {status === 'declined' && 'RECUSADA'}
                    {status === 'locked' && 'BLOQUEADA'}
                  </span>
                </div>
              </div>
              
              {/* Background decoration para missão atual */}
              {status === 'current' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/10 to-transparent"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};