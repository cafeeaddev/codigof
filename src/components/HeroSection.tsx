
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface HeroSectionProps {
  onLoginClick?: () => void;
  onContinueClick?: () => void;
}

export const HeroSection = ({ onLoginClick, onContinueClick }: HeroSectionProps) => {
  // Scroll reveal for hero elements
  const titleReveal = useScrollReveal({ 
    direction: 'up', 
    delay: 0,
    distance: 50
  });
  const buttonsReveal = useScrollReveal({ 
    direction: 'up', 
    delay: 300,
    distance: 30
  });

  return (
    <section className="min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Main content positioned above the terrain */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {/* Chapter/Section indicator - like spaace.io */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="mb-6 sm:mb-8 lg:mb-12"
          >
            {/* CÓDIGO F - moved here and made larger */}
            <div className="mb-4 sm:mb-6 flex justify-center">
              <img 
                src="/lovable-uploads/afeabae2-dbef-4355-b942-f2a770f98af5.png" 
                alt="Código F" 
                className="h-8 sm:h-12 lg:h-16 w-auto"
              />
            </div>
            
          <p className="text-white text-xs sm:text-sm lg:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium mb-4 sm:mb-6 px-4 drop-shadow-[0_2px_10px_hsl(var(--background)_/_0.9)]">
            SCANNER DIGITAL
          </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-4 drop-shadow-[0_2px_18px_hsl(var(--background)_/_0.85)]">
              SUA JORNADA DIGITAL<br />
              <span className="text-secondary">COMEÇA AQUI!</span>
            </h1>
          </div>

          {/* Status Indicator - fundo transparente com bordas coloridas */}
          <div 
            ref={buttonsReveal.elementRef}
            style={buttonsReveal.style}
            className="flex justify-center px-4"
          >
            <div className="relative bg-transparent backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl inline-flex items-center justify-center max-w-full pointer-events-none mx-auto">
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-purple p-[2px] pulse">
                <div className="w-full h-full rounded-xl bg-black/80 backdrop-blur-md"></div>
              </div>
              
              <div className="relative z-10">
                <span className="text-white text-sm sm:text-base lg:text-lg font-semibold drop-shadow-[0_2px_10px_hsl(var(--background)_/_0.9)] whitespace-normal">
                  Sistema de Diagnóstico Ativado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - CONTINUE */}
        <div onClick={() => onContinueClick?.()} className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/60 hover:text-white/80 transition-colors duration-300 cursor-pointer">
          <span className="text-xs sm:text-sm font-medium tracking-wider mb-1 sm:mb-2">CONTINUE</span>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
