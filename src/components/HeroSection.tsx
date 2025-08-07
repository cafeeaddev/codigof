
import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { LoginScreen } from './LoginScreen';

interface HeroSectionProps {
  onLogin?: (userData: any) => void;
}

export const HeroSection = ({ onLogin }: HeroSectionProps) => {
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

  const handleLoginSuccess = (userData: any) => {
    setShowLogin(false);
    onLogin?.(userData);
  };

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_20px_rgba(0,128,255,0.8)]">
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
              onClick={() => setShowLogin(true)}
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

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
            <div className="max-w-md">
              <LoginScreen onLogin={handleLoginSuccess} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
