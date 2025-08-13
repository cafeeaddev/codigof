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
    <Card 
      className={cn(
        "relative overflow-hidden backdrop-blur-md animate-epic-entry",
        "bg-gradient-to-br from-card/80 to-card/40",
        "border-2 animate-pulse-glow",
        className
      )}
      style={{
        borderColor: profileColor,
        boxShadow: `0 0 30px ${profileColor}40, inset 0 0 20px ${profileColor}20`
      }}
    >
      <div className="absolute inset-0 bg-gradient-neon opacity-10 animate-pulse" />
      
      <CardContent className="relative p-8 text-center">
        <div className="mb-6">
          <h2 
            className="text-4xl md:text-6xl font-bold mb-2 animate-holographic"
            style={{ color: profileColor }}
          >
            {profile}
          </h2>
          <p 
            className="text-xl md:text-2xl font-semibold opacity-80"
            style={{ color: profileColor }}
          >
            {sublevel}
          </p>
        </div>
        
        <div className="relative">
          <div 
            className="absolute inset-0 bg-gradient-to-r opacity-20 blur-sm rounded-lg"
            style={{ 
              background: `linear-gradient(45deg, ${profileColor}40, transparent, ${profileColor}40)` 
            }}
          />
          <p className="relative text-foreground/90 text-lg md:text-xl leading-relaxed font-medium">
            {phrase}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse-glow" style={{ backgroundColor: profileColor }} />
        <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: profileColor }} />
        <div className="absolute top-1/2 left-2 w-1 h-8 rounded-full opacity-60" style={{ backgroundColor: profileColor }} />
        <div className="absolute top-1/2 right-2 w-1 h-8 rounded-full opacity-60" style={{ backgroundColor: profileColor }} />
      </CardContent>
    </Card>
  );
};