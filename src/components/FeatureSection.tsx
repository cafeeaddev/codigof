import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Trophy, Medal, Target } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  index: number;
}

export const FeatureSection = ({ 
  id, 
  title, 
  subtitle, 
  description, 
  image, 
  index 
}: FeatureSectionProps) => {
  // Scroll reveal hooks for staggered animations
  const titleReveal = useScrollReveal({ 
    direction: 'left', 
    delay: 0, 
    distance: 100,
    startOffset: 0.9,
    endOffset: 0.3
  });
  const videoReveal = useScrollReveal({ 
    direction: 'right', 
    delay: 200, 
    distance: 120,
    startOffset: 0.8,
    endOffset: 0.2
  });
  const cardsReveal = useScrollReveal({ 
    direction: 'up', 
    delay: 400, 
    distance: 80,
    startOffset: 0.7,
    endOffset: 0.1
  });

  // Only show the first feature section as our missions/xp/medals section
  if (index !== 0) return null;

  const features = [
    {
      icon: Target,
      customIcon: null,
      title: "4 MISSÕES",
      subtitle: "Desafios interativos",
      color: "bg-neon-cyan"
    },
    {
      icon: Trophy,
      title: "XP & LEVELS", 
      subtitle: "Pontuação e progresso",
      color: "bg-neon-purple"
    },
    {
      icon: Medal,
      title: "MEDALHAS",
      subtitle: "Perfis de habilidade", 
      color: "bg-neon-pink"
    }
  ];

  return (
    <section 
      id={id}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main content section */}
        <div className="flex items-center justify-between gap-8 lg:gap-16 mb-16">
          {/* Left side - Content */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="flex-1"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Sou a <span className="text-secondary">Cody</span>, sua IA mentora.
            </h2>
            <h3 className="text-xl sm:text-2xl mb-6">
              Pronto(a) para ativar seu modo <span className="text-neon-pink font-bold">Ninja digital</span>?
            </h3>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <p className="text-muted-foreground text-lg">
                {description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Posso te contar um segredo?</span>
              <span className="text-xs">🤫</span>
            </div>
          </div>

          {/* Right side - Video with circular design */}
          <div 
            ref={videoReveal.elementRef}
            style={videoReveal.style}
            className="flex-shrink-0 relative"
          >
            {/* Glowing circle border */}
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan p-1 shadow-glow">
              <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl overflow-hidden relative">
                <video 
                  className="w-full h-full object-cover rounded-full"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                </video>
                {/* Additional glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
              </div>
            </div>
            {/* Floating particles effect */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-8 -left-3 w-2 h-2 bg-neon-pink rounded-full opacity-40 animate-pulse delay-500"></div>
            <div className="absolute -bottom-1 left-8 w-3 h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Feature cards row */}
        <div 
          ref={cardsReveal.elementRef}
          style={cardsReveal.style}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature, idx) => (
            <div 
              key={feature.title}
              className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/30 p-6 text-center hover:bg-card/80 transition-all duration-300"
              style={{
                transitionDelay: `${idx * 100}ms`
              }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 ${feature.color} rounded-full flex items-center justify-center`}>
                {feature.customIcon ? (
                  <img src={feature.customIcon} alt={feature.title} className="w-8 h-8" />
                ) : (
                  <feature.icon className="w-8 h-8 text-background" />
                )}
              </div>
              
              <h4 className="text-foreground font-bold text-lg mb-2">
                {feature.title}
              </h4>
              
              <p className="text-muted-foreground text-sm">
                {feature.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};