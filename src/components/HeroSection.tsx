
import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { LoginScreen } from './LoginScreen';

export const HeroSection = () => {
  const [showLogin, setShowLogin] = useState(false);
  
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

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

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
            <p className="text-white/70 text-xs sm:text-sm lg:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium mb-4 sm:mb-6 px-4">
              CAPÍTULO 01: TRANSFORMAÇÃO DIGITAL
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-4">
              SUA JORNADA DIGITAL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_20px_rgba(0,128,255,0.8)]">
                COMEÇA AQUI!
              </span>
            </h1>
          </div>

          {/* CTA Button */}
          <div 
            ref={buttonsReveal.elementRef}
            style={buttonsReveal.style}
            className="flex justify-center px-4"
          >
            <Button 
              size="lg" 
              className="bg-white/10 text-white hover:bg-white/20 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-medium backdrop-blur-md rounded-xl shadow-lg border border-white/20 w-full sm:w-auto max-w-xs sm:max-w-none"
              onClick={() => setShowLogin(true)}
            >
              <span className="hidden sm:inline">Sistema de Diagnóstico Ativado</span>
              <span className="sm:hidden">Diagnóstico Ativado</span>
            </Button>
          </div>
        </div>

        {/* Scroll indicator - CONTINUE */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/60 hover:text-white/80 transition-colors duration-300 cursor-pointer">
          <span className="text-xs sm:text-sm font-medium tracking-wider mb-1 sm:mb-2">CONTINUE</span>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-sm sm:max-w-md">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm sm:text-base"
            >
              ✕
            </button>
            <div className="w-full">
              <LoginScreen />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
