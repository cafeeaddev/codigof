import React, { useEffect, useState } from 'react';
import { Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Medal {
  id: string | number;
  title: string;
  done?: boolean;
}

interface FloatingMedalsProps {
  medals: Medal[];
  className?: string;
}

export const FloatingMedals: React.FC<FloatingMedalsProps> = ({ medals, className }) => {
  const [animatedMedals, setAnimatedMedals] = useState<boolean[]>(new Array(medals.length).fill(false));

  useEffect(() => {
    medals.forEach((medal, index) => {
      if (medal.done) {
        setTimeout(() => {
          setAnimatedMedals(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 400 + 1000); // Staggered animation starting after 1s
      }
    });
  }, [medals]);

  const getMedalColor = (index: number) => {
    const colors = [
      'hsl(var(--neon-cyan))',
      'hsl(var(--neon-purple))', 
      'hsl(var(--neon-yellow))',
      'hsl(var(--neon-green))'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={cn("relative w-full h-80 mb-8", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {medals.map((medal, index) => {
            const angle = (index * 90) - 45; // 90 degrees apart, starting at -45 degrees
            const radius = 100;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const color = getMedalColor(index);

            return (
              <div
                key={medal.id}
                className={cn(
                  "absolute w-16 h-16 rounded-full flex items-center justify-center",
                  "transition-all duration-1000 transform-gpu",
                  "border-2 backdrop-blur-sm",
                  animatedMedals[index] && medal.done 
                    ? "animate-float-medal opacity-100" 
                    : "opacity-30 scale-75"
                )}
                style={{
                  left: `calc(50% + ${x}px - 2rem)`,
                  top: `calc(50% + ${y}px - 2rem)`,
                  backgroundColor: medal.done ? `${color}20` : 'hsl(var(--muted))',
                  borderColor: medal.done ? color : 'hsl(var(--border))',
                  boxShadow: medal.done && animatedMedals[index]
                    ? `0 0 30px ${color}60, 0 0 15px ${color}40`
                    : 'none',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <Medal 
                  size={28} 
                  style={{ 
                    color: medal.done ? color : 'hsl(var(--muted-foreground))',
                    filter: medal.done && animatedMedals[index] 
                      ? `drop-shadow(0 0 8px ${color})` 
                      : 'none'
                  }}
                />
                
                {/* Medal title */}
                <div 
                  className={cn(
                    "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
                    "text-xs font-semibold text-center whitespace-nowrap",
                    "transition-all duration-500",
                    animatedMedals[index] && medal.done ? "opacity-100" : "opacity-0"
                  )}
                  style={{ color: medal.done ? color : 'hsl(var(--muted-foreground))' }}
                >
                  {medal.title}
                </div>
              </div>
            );
          })}
          
          {/* Center glow effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary))20 0%, transparent 70%)'
            }}
          />
        </div>
      </div>
    </div>
  );
};