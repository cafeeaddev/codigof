import { useEffect, useRef, useState } from 'react';
import SecretFAQDialog from './SecretFAQDialog';

import { useScrollReveal } from '@/hooks/useScrollReveal';

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  index: number;
  hideInlineSecret?: boolean;
}

export const FeatureSection = ({ 
  id, 
  title, 
  subtitle, 
  description, 
  image, 
  index,
  hideInlineSecret
}: FeatureSectionProps) => {
  // Scroll reveal hooks with proper animations
  const titleReveal = useScrollReveal({ 
    direction: 'left',
    delay: 0,
    distance: 100
  });
  const videoReveal = useScrollReveal({ 
    direction: 'right',
    delay: 200,
    distance: 100
  });
  const cardsReveal = useScrollReveal({ 
    direction: 'up', 
    delay: 400, 
    distance: 80
  });

  // Only show the first feature section as our missions/xp/medals section
  if (index !== 0) return null;

 

  return (
    <section 
      id={id}
      className="min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main content section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 mb-16">
          {/* Left side - Content */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="flex-1"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-neon-purple/90 mb-4">
              Sou a <span className="text-secondary/80">Cody</span>, sua IA mentora.
            </h2>
            <h3 className="text-base sm:text-lg mb-6 text-neon-purple/90 font-semibold">
              Pronto(a) para ativar seu modo Ninja digital?
            </h3>
            
            <p className="text-neon-purple/80 text-base sm:text-lg mb-6">
              {description}
            </p>

            {!hideInlineSecret && (
              <SecretFAQDialog>
                <div className="text-secondary cursor-pointer story-link">
                  <span className="font-medium">Quer um spoiler?</span>
                </div>
              </SecretFAQDialog>
            )}
          </div>

          {/* Right side - Video with circular design */}
          <div 
            ref={videoReveal.elementRef}
            style={videoReveal.style}
            className="flex-shrink-0 relative mt-8 lg:mt-0"
          >
            {/* Glowing circle border */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow">
              <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl overflow-hidden relative">
                {videoReveal.isVisible ? (
                  <video 
                    className="w-full h-full object-cover rounded-full"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full rounded-full bg-background/90" aria-hidden />
                )}
                {/* Additional glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
              </div>
            </div>
            {/* Floating particles effect */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-8 -left-3 w-2 h-2 bg-neon-purple rounded-full opacity-40 animate-pulse delay-500"></div>
            <div className="absolute -bottom-1 left-8 w-3 h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>
          </div>
        </div>

{/* Cards removidos conforme solicitação */}
      </div>
    </section>
  );
};