import { cn } from '@/lib/utils';

interface AnswerStats {
  mito: number;
  verdade: number;
  total: number;
}

interface Quiz1StatsProps {
  stats: AnswerStats;
  correctAnswer: 'MITO' | 'VERDADE';
  className?: string;
}

export const Quiz1Stats = ({ stats, correctAnswer, className }: Quiz1StatsProps) => {
  const mitoPercentage = stats.total > 0 ? Math.round((stats.mito / stats.total) * 100) : 0;
  const verdadePercentage = stats.total > 0 ? Math.round((stats.verdade / stats.total) * 100) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        {/* MITO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">MITO</span>
              {correctAnswer === 'MITO' && (
                <span className="text-green-500 text-xl">✅</span>
              )}
            </div>
            <span className="text-xl font-bold">{mitoPercentage}% ({stats.mito})</span>
          </div>
          <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 flex items-center justify-end pr-4',
                correctAnswer === 'MITO' ? 'bg-green-500' : 'bg-red-500'
              )}
              style={{ width: `${mitoPercentage}%` }}
            >
              {mitoPercentage > 10 && (
                <span className="text-white font-bold">{mitoPercentage}%</span>
              )}
            </div>
          </div>
        </div>

        {/* VERDADE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">VERDADE</span>
              {correctAnswer === 'VERDADE' && (
                <span className="text-green-500 text-xl">✅</span>
              )}
            </div>
            <span className="text-xl font-bold">{verdadePercentage}% ({stats.verdade})</span>
          </div>
          <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 flex items-center justify-end pr-4',
                correctAnswer === 'VERDADE' ? 'bg-green-500' : 'bg-red-500'
              )}
              style={{ width: `${verdadePercentage}%` }}
            >
              {verdadePercentage > 10 && (
                <span className="text-white font-bold">{verdadePercentage}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-muted-foreground text-lg">
        {stats.total} respostas
      </div>
    </div>
  );
};
