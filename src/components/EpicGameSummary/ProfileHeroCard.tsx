import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfileColor } from '@/lib/digitalProfile';
import { cn } from '@/lib/utils';
import { Brain, Zap, Star, Target, ChevronDown, ChevronUp, Medal, Trophy, Award, Check } from 'lucide-react';
import { ShareActions } from './ShareActions';

interface Medal {
  id: string | number;
  title: string;
  done?: boolean;
}

interface ProfileHeroCardProps {
  profile: string;
  sublevel: string;
  phrase: string;
  userName: string;
  medals: Medal[];
  xp: number;
  totalScore: number;
  timeBonus?: number;
  className?: string;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  sublevel,
  phrase,
  userName,
  medals,
  xp,
  totalScore,
  timeBonus = 0,
  className
}) => {
  const profileColor = 'hsl(var(--neon-cyan))'; // Always use neon cyan
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCardReady, setIsCardReady] = useState(false);

  // Garante que o cardRef está pronto antes de passar para ShareActions
  useEffect(() => {
    if (cardRef.current) {
      // Aguarda o próximo frame para garantir que o DOM está estável
      requestAnimationFrame(() => {
        setIsCardReady(true);
      });
    }
  }, []);

  const getProfileIcon = () => {
    switch (profile.toLowerCase()) {
      case 'ninja': return Brain;
      case 'pro-player': return Zap;
      case 'explorer': return Star;
      default: return Target;
    }
  };

  const ProfileIcon = getProfileIcon();
  const completedMedals = medals.filter(medal => medal.done).length;

  return (
    <div className={cn("relative", className)}>

      <Card 
        ref={cardRef}
        className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2"
        style={{
          borderColor: profileColor,
          backgroundColor: 'hsl(240 100% 2%)'
        }}
      >
        <CardContent className="relative p-6 md:p-8">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Wireframe grid background */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={profileColor} strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Flowing lines */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" className="absolute inset-0">
                <path 
                  d="M0,100 Q150,50 300,80 T600,60" 
                  stroke={profileColor} 
                  strokeWidth="2" 
                  fill="none" 
                  opacity="0.3"
                  className="animate-pulse"
                />
                <path 
                  d="M0,80 Q200,120 400,100 T800,90" 
                  stroke={profileColor} 
                  strokeWidth="1" 
                  fill="none" 
                  opacity="0.2"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
            
            {/* Enhanced Cody Avatar - Responsive sizes */}
            <div className="flex-shrink-0 text-center lg:text-left">
              {/* Large Avatar Circle with FeatureSection styling - Responsive */}
              <div className="relative mb-6">
                {/* Glowing circle border - responsive sizes */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow mx-auto lg:mx-0">
                  <div className="w-full h-full rounded-full bg-background/20 backdrop-blur-xl overflow-hidden relative">
                    <video 
                      className="w-full h-full object-cover rounded-full"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    >
                      <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                    </video>
                    {/* Additional glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
                  </div>
                </div>
                
                {/* Floating particles effect - responsive positioning */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-6 -left-2 sm:top-8 sm:-left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-neon-purple rounded-full opacity-40 animate-pulse delay-500"></div>
                <div className="absolute -bottom-0.5 left-6 sm:-bottom-1 sm:left-8 w-2 h-2 sm:w-3 sm:h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>
              </div>

              {/* Enhanced announcement text - responsive */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide" style={{ 
                  color: profileColor,
                  textShadow: `0 0 20px ${profileColor}50`
                }}>
                  Parabéns, {userName}!
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl text-foreground/90 font-medium">
                  Chegamos ao final dessa primeira etapa
                </p>
                
                {/* Mensagem de bônus por agilidade */}
                {timeBonus > 0 && (
                  <div className="bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-neon-cyan text-center">
                      🚀 Você ganhou {timeBonus} XPs Bonus por agilidade
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile results with enhanced styling - responsive */}
            <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
            {/* Profile Achievement - responsive */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2" 
                   style={{ 
                     borderColor: profileColor,
                     backgroundColor: `${profileColor}20`
                   }}>
                <Trophy size={16} className="sm:w-5 sm:h-5" style={{ color: profileColor }} />
                <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold" style={{ color: profileColor }}>
                  Seu Level é: {profile}
                </span>
              </div>
              
              {/* Share Actions */}
              <div className="mt-4">
                <ShareActions 
                  phrase={phrase}
                  profile={profile}
                  sublevel={sublevel}
                />
              </div>
            </div>
            </div>
          </div>
          
          {/* Decorative neon lines */}
          <div className="absolute top-0 left-1/2 w-24 h-1 transform -translate-x-1/2" style={{ backgroundColor: profileColor, boxShadow: `0 0 10px ${profileColor}` }} />
          <div className="absolute bottom-0 left-1/2 w-24 h-1 transform -translate-x-1/2" style={{ backgroundColor: profileColor, boxShadow: `0 0 10px ${profileColor}` }} />
          <div className="absolute top-1/2 left-0 w-1 h-24 transform -translate-y-1/2" style={{ backgroundColor: profileColor, boxShadow: `0 0 10px ${profileColor}` }} />
          <div className="absolute top-1/2 right-0 w-1 h-24 transform -translate-y-1/2" style={{ backgroundColor: profileColor, boxShadow: `0 0 10px ${profileColor}` }} />
        </CardContent>
      </Card>
    </div>
  );
};