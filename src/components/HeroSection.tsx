
import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-neon bg-clip-text text-transparent">
            Código F
          </span>
          <br />
          <span className="text-white">
            Vaporwave
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          A visual experience that levels up as you explore. Vaporwave streamlines 
          aesthetic processes including retro visualization and ambient soundscapes. 
          Customize your experience with animated workflows and nostalgic integrations.
        </p>

        {/* Companies */}
        <p className="text-sm text-white/60 mb-8">
          Trusted by creative teams at innovative companies
        </p>

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
