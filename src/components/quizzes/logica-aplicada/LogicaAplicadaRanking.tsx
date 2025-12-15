import { RankingEntry } from './useLogicaAplicada';
import { Trophy, Medal, Award } from 'lucide-react';

interface LogicaAplicadaRankingProps {
  ranking: RankingEntry[];
  isFinal?: boolean;
  maxShow?: number;
}

export function LogicaAplicadaRanking({ 
  ranking, 
  isFinal = false,
  maxShow = 10 
}: LogicaAplicadaRankingProps) {
  const displayRanking = ranking.slice(0, maxShow);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <span className="w-8 h-8 flex items-center justify-center text-xl font-bold text-emerald-400">{position}°</span>;
    }
  };

  const getRowStyle = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/10 border-yellow-500/50';
    if (position === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
    if (position === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50';
    return 'bg-white/5 border-emerald-500/20';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <h2 className={`text-center font-bold mb-6 ${isFinal ? 'text-4xl' : 'text-2xl'}`}>
        <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
          {isFinal ? '🏆 RANKING FINAL 🏆' : '📊 Ranking Parcial'}
        </span>
      </h2>

      {displayRanking.length === 0 ? (
        <p className="text-center text-white/50">Nenhum participante ainda</p>
      ) : (
        <div className="space-y-2">
          {displayRanking.map((entry, idx) => (
            <div
              key={entry.participant_id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${getRowStyle(entry.position)} 
                ${isFinal && entry.position <= 3 ? 'animate-pulse' : ''}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex-shrink-0">
                {getPositionIcon(entry.position)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${
                  entry.position === 1 ? 'text-yellow-400 text-xl' :
                  entry.position === 2 ? 'text-gray-300 text-lg' :
                  entry.position === 3 ? 'text-amber-500 text-lg' :
                  'text-white'
                }`}>
                  {entry.nickname}
                </p>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <p className={`font-bold ${
                  entry.position === 1 ? 'text-yellow-400 text-2xl' :
                  entry.position === 2 ? 'text-gray-300 text-xl' :
                  entry.position === 3 ? 'text-amber-500 text-xl' :
                  'text-emerald-400 text-lg'
                }`}>
                  {entry.total_points.toLocaleString()} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {ranking.length > maxShow && (
        <p className="text-center text-white/50 text-sm mt-4">
          + {ranking.length - maxShow} participantes
        </p>
      )}
    </div>
  );
}
