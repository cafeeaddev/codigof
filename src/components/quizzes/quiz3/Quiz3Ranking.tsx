import { cn } from '@/lib/utils';

interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  total: number;
}

interface Quiz3RankingProps {
  ranking: RankingEntry[];
  className?: string;
}

export const Quiz3Ranking = ({ ranking, className }: Quiz3RankingProps) => {
  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}°`;
    }
  };

  const getStars = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '⭐⭐⭐⭐⭐';
    if (percentage >= 70) return '⭐⭐⭐⭐';
    if (percentage >= 50) return '⭐⭐⭐';
    if (percentage >= 30) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className={cn('w-full max-w-4xl', className)}>
      <h2 className="text-5xl font-bold mb-8 text-center">
        🏆 RANKING FINAL 🏆
      </h2>

      <div className="space-y-4">
        {ranking.map((entry, index) => {
          const position = index + 1;
          const isTopThree = position <= 3;

          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-center justify-between p-6 rounded-2xl transition-all',
                isTopThree 
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400' 
                  : 'bg-white/10 backdrop-blur-md'
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  'text-4xl font-bold',
                  isTopThree ? 'min-w-16' : 'min-w-12'
                )}>
                  {getMedalEmoji(position)}
                </span>
                <div>
                  <div className={cn(
                    'font-bold',
                    isTopThree ? 'text-3xl' : 'text-2xl'
                  )}>
                    {entry.nickname}
                  </div>
                  <div className="text-xl text-white/80">
                    {getStars(entry.score, entry.total)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn(
                  'font-bold',
                  isTopThree ? 'text-4xl' : 'text-3xl'
                )}>
                  {entry.score}/{entry.total}
                </div>
                <div className="text-lg text-white/70">
                  {Math.round((entry.score / entry.total) * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ranking.length === 0 && (
        <div className="text-center text-2xl text-white/70 py-12">
          Nenhum participante ainda
        </div>
      )}
    </div>
  );
};
