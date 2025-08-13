import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfileColor } from '@/lib/digitalProfile';
import { cn } from '@/lib/utils';
import { Brain, Zap, Star, Target, ChevronDown, ChevronUp, Medal, Trophy, Award } from 'lucide-react';

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
  const profileColor = getProfileColor(profile as any);
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
        className={cn(
          "relative overflow-hidden animate-epic-entry",
          "bg-background/95 backdrop-blur-sm",
          "border-2",
          className
        )}
        style={{
          borderColor: profileColor,
          backgroundColor: 'hsl(240 100% 2%)'
        }}
      >
        <CardContent className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Left side - Avatar and announcement */}
            <div className="flex-shrink-0 text-center lg:text-left">
              {/* Avatar Circle */}
              <div className="relative mb-6">
                <div 
                  className="w-40 h-40 mx-auto lg:mx-0 rounded-full flex items-center justify-center relative animate-float-medal overflow-hidden"
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
              <div className="space-y-3">
                <p className="text-xl md:text-2xl font-bold" style={{ color: profileColor }}>
                  Parabéns, {userName}!
                </p>
                <p className="text-lg md:text-xl text-foreground/90">
                  Chegamos ao final dessa primeira etapa
                </p>
              </div>
            </div>

            {/* Right side - Profile results */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Profile Achievement */}
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-6 py-3 rounded-full border-2" 
                     style={{ 
                       borderColor: profileColor,
                       backgroundColor: `${profileColor}20`
                     }}>
                  <Trophy size={20} style={{ color: profileColor }} />
                  <span className="text-lg font-bold" style={{ color: profileColor }}>
                    Seu Perfil é:
                  </span>
                </div>

                <h2 
                  className="text-3xl md:text-5xl font-bold mb-2"
                  style={{ 
                    color: profileColor
                  }}
                >
                  {profile}
                </h2>
              </div>

              {/* Profile Description */}
              <div className="mt-8 p-6 rounded-lg border" 
                   style={{ 
                     borderColor: `${profileColor}40`,
                     backgroundColor: 'hsl(240 100% 2%)'
                   }}>
                <p className="text-foreground/90 text-lg leading-relaxed">
                  🟠 Nível 2 – Transição para Ninja • Seu domínio técnico vem acompanhado de visão de contexto. Você pensa no impacto coletivo e contribui para soluções além do seu escopo. Rumo ao protagonismo na transformação digital.
                </p>
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