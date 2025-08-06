
import { Button } from './ui/button';
import { Play } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main content positioned above the terrain */}
        <div className="mb-12">
          {/* Top text */}
          <p className="text-white mb-6 uppercase tracking-wider font-montserrat font-bold break-words" style={{ fontSize: '23.77px' }}>
            SUA JORNADA DIGITAL COMEÇA AQUI!
          </p>

          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/lovable-uploads/89624b0a-ec75-460d-9b68-0a73c6c945eb.png" 
              alt="Código F"
              className="mx-auto w-auto h-24 sm:h-32 lg:h-40"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
