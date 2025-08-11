
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
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Main content positioned above the terrain */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {/* Chapter/Section indicator - like spaace.io */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="mb-6 sm:mb-8 lg:mb-12"
          >
            <p className="text-neon-pink text-xs sm:text-sm lg:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium mb-4 sm:mb-6 px-4 drop-shadow-[0_2px_10px_hsl(var(--background)_/_0.9)]">
              CAPÍTULO 01: TRANSFORMAÇÃO DIGITAL
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-4 drop-shadow-[0_2px_18px_hsl(var(--background)_/_0.85)]">
              SUA JORNADA DIGITAL<br />
              <span className="text-secondary">COMEÇA AQUI!</span>
            </h1>
          </div>

          {/* Status Indicator - não clicável */}
          <div 
            ref={buttonsReveal.elementRef}
            style={buttonsReveal.style}
            className="flex justify-center px-4"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-xl border border-white/20 shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none pointer-events-none">
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-lg shadow-neon-cyan/50"></div>
                <span className="text-neon-cyan text-xs sm:text-sm font-medium tracking-wide">ATIVO</span>
              </div>
              
              {/* Separator */}
              <div className="w-px h-4 bg-white/30"></div>
              
              {/* Diagnostic text */}
              <span className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                <span className="hidden sm:inline">Sistema de Diagnóstico Ativado</span>
                <span className="sm:hidden">Diagnóstico Ativado</span>
              </span>
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
