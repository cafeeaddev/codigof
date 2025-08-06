
import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Companies text moved up */}
        <p className="text-sm text-white/60 mb-4">
          Trusted by creative teams at innovative companies
        </p>

        {/* Main Title */}
        <div className="mb-6 -mt-8 flex items-center justify-center gap-8">
          <img 
            src="/lovable-uploads/89624b0a-ec75-460d-9b68-0a73c6c945eb.png" 
            alt="Código F"
            className="w-auto h-20 sm:h-24 lg:h-32"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            SUA JORNADA DIGITAL<br />COMEÇA AQUI!
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-medium"
          >
            Get started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="text-white hover:bg-white/10 px-8 py-3 text-lg font-medium border border-white/20 backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch demo
          </Button>
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
