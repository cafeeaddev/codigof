import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
}

export const CelebrationParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'hsl(var(--neon-pink))',
      'hsl(var(--neon-cyan))',
      'hsl(var(--neon-purple))',
      'hsl(var(--neon-yellow))',
      'hsl(var(--neon-green))'
    ];

    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3000, // 0-3s delay
        duration: 2000 + Math.random() * 2000 // 2-4s duration
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute w-2 h-2 rounded-full opacity-80",
            "animate-meteor-shower"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
            boxShadow: `0 0 10px ${particle.color}`
          }}
        />
      ))}
      
      {/* Additional floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`float-${i}`}
          className="absolute w-1 h-1 rounded-full animate-pulse"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 30}%`,
            backgroundColor: `hsl(${i * 45} 100% 60%)`,
            animationDelay: `${i * 0.5}s`,
            boxShadow: `0 0 8px hsl(${i * 45} 100% 60%)`
          }}
        />
      ))}
    </div>
  );
};