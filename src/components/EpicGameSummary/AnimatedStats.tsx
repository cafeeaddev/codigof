import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedStatsProps {
  xp: number;
  totalScore: number;
  profile: string;
  className?: string;
}

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({ 
  xp, 
  totalScore, 
  profile,
  className 
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const xpIncrement = xp / steps;
    const scoreIncrement = totalScore / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedXP(Math.min(Math.round(xpIncrement * currentStep), xp));
      setAnimatedScore(Math.min(parseFloat((scoreIncrement * currentStep).toFixed(2)), totalScore));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, xp, totalScore]);

  const getProfileColor = () => {
    switch (profile.toLowerCase()) {
      case 'ninja': return 'hsl(var(--neon-purple))';
      case 'pro-player': return 'hsl(var(--neon-cyan))';
      case 'explorer': return 'hsl(var(--neon-yellow))';
      case 'beginner +': return 'hsl(var(--neon-green))';
      default: return 'hsl(var(--neon-pink))';
    }
  };

  const profileColor = getProfileColor();

  return (
    <div className={cn("w-full", className)}>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          XP & Levels
        </h2>
        <p className="text-muted-foreground">
          Seu nível de experiência conquistado
        </p>
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6")}>
      {/* XP Card */}
      <Card 
        className={cn(
          "relative overflow-hidden backdrop-blur-md",
          "bg-gradient-to-br from-card/80 to-card/40",
          "border-2 transition-all duration-1000",
          isVisible ? "animate-epic-entry opacity-100" : "opacity-0"
        )}
        style={{
          borderColor: profileColor,
          boxShadow: isVisible ? `0 0 25px ${profileColor}40` : 'none',
          animationDelay: '0.5s'
        }}
      >
        <CardContent className="relative p-6 text-center">
          <div className="absolute inset-0 bg-gradient-neon opacity-5" />
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: profileColor }}
          >
            Total XP
          </h3>
          <div 
            className={cn(
              "text-5xl font-bold mb-2 transition-all duration-300",
              isVisible ? "animate-counter-up" : ""
            )}
            style={{ color: profileColor }}
          >
            {animatedXP.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-sm">
            Experiência conquistada
          </p>
          
          {/* Decorative elements */}
          <div 
            className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: profileColor }}
          />
        </CardContent>
      </Card>

      {/* Score Card */}
      <Card 
        className={cn(
          "relative overflow-hidden backdrop-blur-md",
          "bg-gradient-to-br from-card/80 to-card/40",
          "border-2 transition-all duration-1000",
          isVisible ? "animate-epic-entry opacity-100" : "opacity-0"
        )}
        style={{
          borderColor: profileColor,
          boxShadow: isVisible ? `0 0 25px ${profileColor}40` : 'none',
          animationDelay: '0.7s'
        }}
      >
        <CardContent className="relative p-6 text-center">
          <div className="absolute inset-0 bg-gradient-neon opacity-5" />
           <h3 
             className="text-lg font-semibold mb-4"
             style={{ color: profileColor }}
           >
             Bonus
           </h3>
          <div 
            className={cn(
              "text-5xl font-bold mb-2 transition-all duration-300",
              isVisible ? "animate-counter-up" : ""
            )}
            style={{ color: profileColor }}
          >
            {animatedScore.toFixed(1)}
          </div>
           <p className="text-muted-foreground text-sm">
             Pontos de bonus
           </p>
          
          {/* Decorative elements */}
          <div 
            className="absolute bottom-2 left-2 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: profileColor }}
          />
        </CardContent>
      </Card>
      </div>
    </div>
  );
};