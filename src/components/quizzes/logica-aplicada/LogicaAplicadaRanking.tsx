import { RankingEntry } from './useLogicaAplicada';
import { Trophy, Medal, Award, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  // Animate scores counting up on final ranking
  useEffect(() => {
    if (isFinal) {
      displayRanking.forEach((entry, idx) => {
        const duration = 1500;
        const steps = 30;
        const stepValue = entry.total_points / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += stepValue;
          if (current >= entry.total_points) {
            current = entry.total_points;
            clearInterval(timer);
          }
          setAnimatedScores(prev => ({ ...prev, [entry.participant_id]: Math.round(current) }));
        }, duration / steps);
        
        return () => clearInterval(timer);
      });
    } else {
      // For partial ranking, show scores immediately
      const scores: Record<string, number> = {};
      displayRanking.forEach(entry => {
        scores[entry.participant_id] = entry.total_points;
      });
      setAnimatedScores(scores);
    }
  }, [displayRanking, isFinal]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />;
      case 2:
        return <Medal className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />;
      default:
        return (
          <span className="w-8 h-8 flex items-center justify-center text-xl font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
            {position}°
          </span>
        );
    }
  };

  const getCardStyles = (position: number) => {
    if (position === 1) {
      return 'border-yellow-400/80 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 shadow-[0_0_30px_rgba(250,204,21,0.4),inset_0_0_20px_rgba(250,204,21,0.1)]';
    }
    if (position === 2) {
      return 'border-cyan-400/80 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-cyan-500/20 shadow-[0_0_25px_rgba(0,255,255,0.3),inset_0_0_15px_rgba(0,255,255,0.1)]';
    }
    if (position === 3) {
      return 'border-orange-400/80 bg-gradient-to-r from-orange-500/20 via-orange-400/10 to-orange-500/20 shadow-[0_0_25px_rgba(251,146,60,0.3),inset_0_0_15px_rgba(251,146,60,0.1)]';
    }
    return 'border-neon-pink/40 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10 hover:border-neon-cyan/60 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]';
  };

  const getNameStyles = (position: number) => {
    if (position === 1) return 'text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]';
    if (position === 2) return 'text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]';
    if (position === 3) return 'text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]';
    return 'text-white';
  };

  const getScoreStyles = (position: number) => {
    if (position === 1) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]';
    if (position === 2) return 'text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,1)]';
    if (position === 3) return 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,1)]';
    return 'text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.6)]';
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Outer decorative frame */}
      <div className="absolute -inset-2 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan rounded-3xl opacity-30 blur-xl animate-pulse" />
      
      {/* Double border container */}
      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-neon-pink via-fuchsia-500 to-neon-pink shadow-[0_0_40px_rgba(255,0,255,0.4)]">
        <div className="p-1 rounded-xl bg-gradient-to-br from-neon-cyan via-cyan-400 to-neon-cyan">
          <div className="bg-[#0a0a0f] rounded-lg p-6 relative overflow-hidden">
            
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-cyan opacity-60" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon-pink opacity-60" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon-pink opacity-60" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-cyan opacity-60" />

            {/* Floating decorative dots */}
            <div className="absolute top-8 left-1/4 w-2 h-2 bg-neon-pink rounded-full opacity-40 animate-pulse" />
            <div className="absolute top-12 right-1/3 w-1.5 h-1.5 bg-neon-cyan rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-16 left-1/3 w-2 h-2 bg-neon-purple rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <div className="relative z-10 text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-neon-cyan animate-pulse" />
                <h2 className={`font-bold tracking-wider ${isFinal ? 'text-4xl' : 'text-2xl'}`}>
                  <span className="bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">
                    {isFinal ? 'RANKING FINAL' : 'RANKING PARCIAL'}
                  </span>
                </h2>
                <Zap className="w-6 h-6 text-neon-pink animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              
              {/* Decorative line under title */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-neon-pink to-neon-cyan" />
                <div className="w-2 h-2 bg-neon-cyan rotate-45" />
                <div className="h-0.5 w-16 bg-gradient-to-r from-neon-cyan via-neon-pink to-transparent" />
              </div>
            </div>

            {/* Column headers */}
            <div className="relative z-10 flex items-center gap-4 mb-4 px-4">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 border border-neon-cyan/50 rounded bg-neon-cyan/10 text-neon-cyan text-sm font-semibold tracking-wider">
                  PARTICIPANTE
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="inline-block px-4 py-1 border border-neon-pink/50 rounded bg-neon-pink/10 text-neon-pink text-sm font-semibold tracking-wider">
                  PONTOS
                </div>
              </div>
            </div>

            {/* Ranking list */}
            <div className="relative z-10 space-y-3">
              {displayRanking.length === 0 ? (
                <p className="text-center text-white/50 py-8">Nenhum participante ainda</p>
              ) : (
                displayRanking.map((entry, idx) => (
                  <div
                    key={entry.participant_id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500
                      ${getCardStyles(entry.position)}
                      ${isFinal && entry.position <= 3 ? 'animate-pulse' : ''}
                    `}
                    style={{ 
                      animationDelay: `${idx * 100}ms`,
                      animation: isFinal ? `fadeSlideIn 0.5s ease-out ${idx * 0.1}s both` : undefined
                    }}
                  >
                    {/* Position icon */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10">
                      {getPositionIcon(entry.position)}
                    </div>
                    
                    {/* Name with underline effect */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate text-lg ${getNameStyles(entry.position)}`}>
                        {entry.nickname}
                      </p>
                      <div className={`h-0.5 w-3/4 mt-1 ${
                        entry.position === 1 ? 'bg-gradient-to-r from-yellow-400 to-transparent' :
                        entry.position === 2 ? 'bg-gradient-to-r from-cyan-400 to-transparent' :
                        entry.position === 3 ? 'bg-gradient-to-r from-orange-400 to-transparent' :
                        'bg-gradient-to-r from-neon-pink/50 to-transparent'
                      }`} />
                    </div>
                    
                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <p className={`font-black text-2xl tracking-tight ${getScoreStyles(entry.position)}`}>
                        {(animatedScores[entry.participant_id] || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-white/40 tracking-widest">PTS</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* More participants indicator */}
            {ranking.length > maxShow && (
              <div className="relative z-10 text-center mt-6 pt-4 border-t border-white/10">
                <p className="text-neon-cyan/60 text-sm tracking-wider">
                  + {ranking.length - maxShow} participantes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
