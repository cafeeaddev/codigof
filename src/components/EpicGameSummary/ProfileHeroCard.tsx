import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfileColor } from '@/lib/digitalProfile';
import { cn } from '@/lib/utils';
import { Brain, Zap, Star, Target, ChevronDown, ChevronUp, Medal, Trophy, Award, Check } from 'lucide-react';

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
  className
}) => {
  const profileColor = 'hsl(var(--neon-cyan))'; // Always use neon cyan
  const [isExpanded, setIsExpanded] = useState(false);

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
        className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2"
        style={{
          borderColor: profileColor,
          backgroundColor: 'hsl(240 100% 2%)'
        }}
      >
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            
            {/* Left side - Avatar and announcement */}
            <div className="flex-shrink-0 text-center lg:text-left">
              {/* Avatar Circle */}
              <div className="relative mb-4">
                <div 
                  className="w-28 h-28 mx-auto lg:mx-0 rounded-full flex items-center justify-center relative animate-float-medal overflow-hidden"
                  style={{
                    background: `radial-gradient(circle, ${profileColor}30, ${profileColor}10)`,
                    border: `4px solid ${profileColor}`,
                    boxShadow: `0 0 50px ${profileColor}50`
                  }}
                >
                  {/* Avatar Video */}
                  <video 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-full"
                    style={{
                      filter: `drop-shadow(0 0 20px ${profileColor})`
                    }}
                  >
                    <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                  </video>
                  
                  {/* Orbiting dots */}
                  <div 
                    className="absolute w-3 h-3 rounded-full animate-orbit"
                    style={{ 
                      backgroundColor: profileColor,
                      boxShadow: `0 0 15px ${profileColor}`
                    }}
                  />
                  
                  {/* Pulse ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 animate-ping opacity-20"
                    style={{ borderColor: profileColor }}
                  />
                </div>
              </div>

              {/* Announcement text */}
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-bold" style={{ color: profileColor }}>
                  Parabéns, {userName}!
                </p>
                <p className="text-base md:text-lg text-foreground/90">
                  Chegamos ao final dessa primeira etapa
                </p>
              </div>
            </div>

            {/* Right side - Profile results */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              {/* Profile Achievement */}
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-6 py-3 rounded-full border-2" 
                     style={{ 
                       borderColor: profileColor,
                       backgroundColor: `${profileColor}20`
                     }}>
                  <Trophy size={20} style={{ color: profileColor }} />
                  <span className="text-base font-bold" style={{ color: profileColor }}>
                    Seu Perfil é:
                  </span>
                </div>

                <h2 
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{ 
                    color: profileColor
                  }}
                >
                  {profile}
                </h2>
              </div>

              {/* Completed Missions */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">1</span>
                    </div>
                    <span className="text-foreground font-bold">Missão 1</span>
                  </div>
                  <p className="text-green-300/80 text-sm">Fundamentos Digitais</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                </div>
                
                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">2</span>
                    </div>
                    <span className="text-foreground font-bold">Missão 2</span>
                  </div>
                  <p className="text-green-300/80 text-sm">Exploração Tecnológica</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                </div>
                
                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">3</span>
                    </div>
                    <span className="text-foreground font-bold">Missão 3</span>
                  </div>
                  <p className="text-green-300/80 text-sm">Domínio de Ferramentas</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                </div>
                
                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">4</span>
                    </div>
                    <span className="text-foreground font-bold">Missão 4</span>
                  </div>
                  <p className="text-green-300/80 text-sm">Liderança Digital</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
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