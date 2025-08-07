
import { Button } from './ui/button';
import { Play } from 'lucide-react';
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

          {/* CTA Buttons */}
          <div 
            ref={buttonsReveal.elementRef}
            style={buttonsReveal.style}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-lg font-medium backdrop-blur-md rounded-xl shadow-lg"
              style={{ outline: '1.96px white solid', outlineOffset: '0px' }}
            >
              Sistema de Diagnóstico Ativado
            </Button>
            
            <Button 
              size="lg"
              style={{ backgroundColor: '#442C77', borderColor: '#E04AD8' }}
              className="text-white hover:opacity-90 px-8 py-4 text-lg font-medium rounded-lg transition-opacity border-2"
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              INICIAR
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
