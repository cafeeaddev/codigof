import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getProfileColor } from '@/lib/digitalProfile';
import { cn } from '@/lib/utils';
import { Brain, Zap, Star, Target } from 'lucide-react';

interface ProfileHeroCardProps {
  profile: string;
  sublevel: string;
  phrase: string;
  userName: string;
  className?: string;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  sublevel,
  phrase,
  userName,
  className
}) => {
  const profileColor = getProfileColor(profile as any);

  const getProfileIcon = () => {
    switch (profile.toLowerCase()) {
      case 'ninja': return Brain;
      case 'pro-player': return Zap;
      case 'explorer': return Star;
      default: return Target;
    }
  };

  const ProfileIcon = getProfileIcon();

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
                  className="w-40 h-40 mx-auto lg:mx-0 rounded-full flex items-center justify-center relative animate-float-medal"
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
                  Parabéns, {userName}! Chegamos ao final dessa primeira etapa
                </p>
              </div>
            </div>

            {/* Right side - Profile details */}
            <div className="flex-1 text-center lg:text-left">
              {/* Profile badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border-2" 
                   style={{ 
                     borderColor: profileColor,
                     backgroundColor: `${profileColor}20`
                   }}>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: profileColor }}
                />
                <span className="text-sm font-semibold" style={{ color: profileColor }}>
                  {sublevel}
                </span>
              </div>

              {/* Profile title */}
              <h2 
                className="text-4xl md:text-6xl font-bold mb-6 animate-holographic"
                style={{ 
                  background: `linear-gradient(45deg, ${profileColor}, ${profileColor}80)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 0 20px ${profileColor}50)`
                }}
              >
                {profile}
              </h2>
              
              {/* Description */}
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-lg opacity-20 blur-sm"
                  style={{ 
                    background: `linear-gradient(45deg, ${profileColor}40, transparent, ${profileColor}40)` 
                  }}
                />
                <p className="relative text-foreground/90 text-lg md:text-xl leading-relaxed">
                  {phrase}
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