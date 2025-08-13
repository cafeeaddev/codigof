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
      {/* Vaporwave Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            background: `
              linear-gradient(90deg, ${profileColor}20 1px, transparent 1px),
              linear-gradient(0deg, ${profileColor}20 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(45deg)',
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      <Card 
        className={cn(
          "relative overflow-hidden backdrop-blur-xl animate-epic-entry",
          "bg-gradient-to-br from-background/90 to-background/60",
          "border-2",
          className
        )}
        style={{
          borderColor: profileColor,
          boxShadow: `
            0 0 50px ${profileColor}30,
            0 0 100px ${profileColor}20,
            inset 0 0 30px ${profileColor}10
          `
        }}
      >
        {/* Animated border effect */}
        <div 
          className="absolute inset-0 rounded-lg opacity-30 animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, ${profileColor}, transparent, ${profileColor})`
          }}
        />
        
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
                    Seu Perfil: {profile}
                  </span>
                </div>

                <h2 
                  className="text-3xl md:text-5xl font-bold mb-2 animate-holographic"
                  style={{ 
                    background: `linear-gradient(45deg, ${profileColor}, ${profileColor}80)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: `drop-shadow(0 0 20px ${profileColor}50)`
                  }}
                >
                  {sublevel}
                </h2>
              </div>

              {/* Missions Completed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/20 rounded-lg p-4 border" style={{ borderColor: `${profileColor}40` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Medal size={20} style={{ color: profileColor }} />
                    <span className="font-semibold" style={{ color: profileColor }}>Medalhas</span>
                  </div>
                  <p className="text-2xl font-bold">{completedMedals}/4</p>
                  <p className="text-sm text-muted-foreground">Conquistas</p>
                </div>

                <div className="bg-background/20 rounded-lg p-4 border" style={{ borderColor: `${profileColor}40` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={20} style={{ color: profileColor }} />
                    <span className="font-semibold" style={{ color: profileColor }}>Total XP</span>
                  </div>
                  <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Experiência</p>
                </div>

                <div className="bg-background/20 rounded-lg p-4 border" style={{ borderColor: `${profileColor}40` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={20} style={{ color: profileColor }} />
                    <span className="font-semibold" style={{ color: profileColor }}>Bonus</span>
                  </div>
                  <p className="text-2xl font-bold">{totalScore.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Level Description */}
          <div className="mt-8 border-t pt-6" style={{ borderColor: `${profileColor}40` }}>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-background/10"
              style={{ color: profileColor }}
            >
              <span className="text-lg font-semibold">
                {sublevel} - Detalhes do Perfil
              </span>
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </Button>
            
            {isExpanded && (
              <div className="mt-4 p-6 rounded-lg bg-background/20 border" 
                   style={{ borderColor: `${profileColor}40` }}>
                <div 
                  className="absolute inset-0 rounded-lg opacity-10 blur-sm"
                  style={{ 
                    background: `linear-gradient(45deg, ${profileColor}40, transparent, ${profileColor}40)` 
                  }}
                />
                <p className="relative text-foreground/90 text-lg leading-relaxed">
                  {phrase}
                </p>
              </div>
            )}
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