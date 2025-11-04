import { cn } from '@/lib/utils';

interface AnswerStats {
  a: number;
  b: number;
  c: number;
  d: number;
  total: number;
}

interface Quiz3StatsProps {
  stats: AnswerStats;
  correctOption: 'A' | 'B' | 'C' | 'D';
  optionTexts: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  className?: string;
}

export const Quiz3Stats = ({ stats, correctOption, optionTexts, className }: Quiz3StatsProps) => {
  const getPercentage = (value: number) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  const options = [
    { key: 'a' as const, label: 'A', text: optionTexts.a, count: stats.a },
    { key: 'b' as const, label: 'B', text: optionTexts.b, count: stats.b },
    { key: 'c' as const, label: 'C', text: optionTexts.c, count: stats.c },
    { key: 'd' as const, label: 'D', text: optionTexts.d, count: stats.d },
  ];

  return (
    <div className={cn('space-y-4 w-full max-w-4xl', className)}>
      {options.map(({ key, label, text, count }) => {
        const percentage = getPercentage(count);
        const isCorrect = label === correctOption;

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{label})</span>
                <span className="text-xl">{text}</span>
                {isCorrect && (
                  <span className="text-green-500 text-xl">✅</span>
                )}
              </div>
              <span className="text-xl font-bold">{percentage}% ({count})</span>
            </div>
            <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 flex items-center justify-end pr-4',
                  isCorrect ? 'bg-green-500' : 'bg-blue-500'
                )}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 10 && (
                  <span className="text-white font-bold">{percentage}%</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="text-center text-muted-foreground text-lg mt-6">
        {stats.total} respostas
      </div>
    </div>
  );
};
