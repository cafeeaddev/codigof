
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const HeroSection = () => {
  // Scroll reveal for hero elements - keep always visible like spaace.io
  const titleReveal = useScrollReveal({ 
    direction: 'fade', 
    delay: 0,
    stayVisible: true
  });
  const logoReveal = useScrollReveal({ 
    direction: 'fade', 
    delay: 200,
    stayVisible: true
  });
  const buttonsReveal = useScrollReveal({ 
    direction: 'fade', 
    delay: 400,
    stayVisible: true
  });

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main content positioned above the terrain */}
        <div className="mb-12">
          {/* Chapter/Section indicator - like spaace.io */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="mb-8"
          >
            <p className="text-white/70 text-sm sm:text-base uppercase tracking-[0.2em] font-medium mb-6">
              CAPÍTULO 01: TRANSFORMAÇÃO DIGITAL
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              SUA JORNADA DIGITAL<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                COMEÇA AQUI!
              </span>
            </h1>
          </div>

          {/* CTA Button */}
          <div 
            ref={buttonsReveal.elementRef}
            style={buttonsReveal.style}
            className="flex justify-center"
          >
            <Button 
              size="lg" 
              className="bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-lg font-medium backdrop-blur-md rounded-xl shadow-lg border border-white/20"
            >
              Sistema de Diagnóstico Ativado
            </Button>
          </div>
        </div>

        {/* Scroll indicator - CONTINUE */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/60 hover:text-white/80 transition-colors duration-300 cursor-pointer">
          <span className="text-sm font-medium tracking-wider mb-2">CONTINUE</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
