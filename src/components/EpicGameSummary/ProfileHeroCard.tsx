import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getProfileColor } from '@/lib/digitalProfile';
import { cn } from '@/lib/utils';

interface ProfileHeroCardProps {
  profile: string;
  sublevel: string;
  phrase: string;
  className?: string;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  sublevel,
  phrase,
  className
}) => {
  const profileColor = getProfileColor(profile as any);

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
        
        <CardContent className="relative p-12 text-center">
          {/* Profile Avatar Circle */}
          <div className="mb-8">
            <div 
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center relative animate-float-medal"
              style={{
                background: `radial-gradient(circle, ${profileColor}30, ${profileColor}10)`,
                border: `3px solid ${profileColor}`,
                boxShadow: `0 0 40px ${profileColor}50`
              }}
            >
              <div 
                className="text-6xl font-bold animate-holographic"
                style={{ color: profileColor }}
              >
                {profile.charAt(0)}
              </div>
              
              {/* Orbiting dots */}
              <div 
                className="absolute w-2 h-2 rounded-full animate-orbit"
                style={{ 
                  backgroundColor: profileColor,
                  boxShadow: `0 0 10px ${profileColor}`
                }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 
              className="text-5xl md:text-7xl font-bold mb-4 animate-holographic"
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
            <p 
              className="text-2xl md:text-3xl font-semibold opacity-90"
              style={{ color: profileColor }}
            >
              {sublevel}
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div 
              className="absolute inset-0 rounded-lg opacity-20 blur-sm"
              style={{ 
                background: `linear-gradient(45deg, ${profileColor}40, transparent, ${profileColor}40)` 
              }}
            />
            <p className="relative text-foreground/90 text-xl md:text-2xl leading-relaxed font-medium">
              {phrase}
            </p>
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