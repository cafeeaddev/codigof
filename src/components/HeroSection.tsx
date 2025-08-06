import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-neon">
            <div className="w-12 h-12 bg-gradient-neon rounded-lg"></div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
          <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
        </div>

        {/* Main Title - removed */}

        {/* Subtitle - removed */}

        {/* Companies - removed */}

        {/* CTA Buttons - removed */}

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