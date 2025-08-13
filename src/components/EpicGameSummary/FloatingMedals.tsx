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

  const medalDescriptions = [
    "Primeira missão concluída! Você descobriu os fundamentos do universo digital.",
    "Segunda conquista desbloqueada! Explorou novos territórios digitais.",
    "Terceira medalha conquistada! Brilha como uma estrela no cosmos digital.",
    "Medalha final! Você alcançou o status de uma galáxia completa."
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-holographic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Medalhas Conquistadas
        </h2>
        <p className="text-muted-foreground text-lg">
          Suas conquistas épicas nesta jornada digital
        </p>
      </div>

      {/* Medals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {medals.map((medal, index) => {
          const color = getMedalColor(index);
          
          return (
            <div
              key={medal.id}
              className={cn(
                "relative overflow-hidden rounded-lg p-6",
                "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md",
                "border-2 transition-all duration-1000",
                "text-center group hover:scale-105",
                animatedMedals[index] && medal.done 
                  ? "animate-epic-entry opacity-100" 
                  : "opacity-60"
              )}
              style={{
                borderColor: medal.done ? color : 'hsl(var(--border))',
                boxShadow: medal.done && animatedMedals[index]
                  ? `0 0 25px ${color}40`
                  : 'none',
                animationDelay: `${index * 0.3 + 2}s`
              }}
            >
              {/* Background glow */}
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`
                }}
              />
              
              {/* Medal Icon */}
              <div className="relative mb-4">
                <div 
                  className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                    "border-2 transition-all duration-500",
                    medal.done ? "animate-float-medal" : "grayscale"
                  )}
                  style={{
                    backgroundColor: medal.done ? `${color}20` : 'hsl(var(--muted))',
                    borderColor: medal.done ? color : 'hsl(var(--border))',
                  }}
                >
                  <Medal 
                    size={32} 
                    style={{ 
                      color: medal.done ? color : 'hsl(var(--muted-foreground))',
                      filter: medal.done 
                        ? `drop-shadow(0 0 8px ${color})` 
                        : 'none'
                    }}
                  />
                </div>
              </div>
              
              {/* Medal Title */}
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: medal.done ? color : 'hsl(var(--muted-foreground))' }}
              >
                {medal.title}
              </h3>
              
              {/* Medal Description */}
              <p className={cn(
                "text-sm leading-relaxed transition-all duration-500",
                medal.done ? "text-foreground/80" : "text-muted-foreground/60"
              )}>
                {medalDescriptions[index]}
              </p>
              
              {/* Status Badge */}
              <div className="mt-4">
                <span 
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                    medal.done ? "bg-green-500/20 text-green-400" : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {medal.done ? "✓ Conquistada" : "Bloqueada"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};