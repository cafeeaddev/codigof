/**
 * Componente para otimizar experiência das missões
 * Reduz abandonos e melhora performance
 */

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MissionOptimizerProps {
  missionId: number;
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  onOptimizationTip?: (tip: string) => void;
}

export const MissionOptimizer = ({ 
  missionId, 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions,
  onOptimizationTip 
}: MissionOptimizerProps) => {
  const [startTime] = useState(Date.now());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const newProgress = (answeredQuestions / totalQuestions) * 100;
    setProgress(newProgress);
  }, [answeredQuestions, totalQuestions]);

  const getProgressColor = () => {
    if (progress < 25) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getProgressMessage = () => {
    if (progress < 25) return 'Começando bem!';
    if (progress < 50) return 'Progredindo!';
    if (progress < 75) return 'Quase lá!';
    return 'Finalizando!';
  };

  const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 mb-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Missão {missionId}</span>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeSpent}min
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{getProgressMessage()}</span>
          <span>{answeredQuestions}/{totalQuestions}</span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2"
        />
      </div>

      {progress > 80 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>Quase concluído! Continue assim!</span>
        </div>
      )}

      {timeSpent > 10 && progress < 50 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-yellow-600">
          <AlertCircle className="w-3 h-3" />
          <span>Precisa de ajuda? Todas as questões têm dicas visuais.</span>
        </div>
      )}
    </div>
  );
};