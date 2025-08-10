import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { LucideIcon } from 'lucide-react';

interface FeatureFoldProps {
  id: string;
  title: string;
  subtitle: string;
  colorClass: string; // e.g., 'bg-neon-cyan'
  Icon: LucideIcon;
}

export const FeatureFold = ({ id, title, subtitle, colorClass, Icon }: FeatureFoldProps) => {
  const titleReveal = useScrollReveal({ direction: 'up', delay: 0, distance: 60 });
  const circleReveal = useScrollReveal({ direction: 'up', delay: 150, distance: 60 });

  return (
    <section id={id} className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pr-6 sm:pr-12 lg:pr-24 py-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid items-center gap-10 md:gap-12 lg:gap-16 md:grid-cols-2">
          <div ref={titleReveal.elementRef} style={titleReveal.style}>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{title}</h2>
            <p className="text-xl sm:text-2xl leading-relaxed max-w-3xl text-neon-pink/80">{subtitle}</p>
          </div>

          <div ref={circleReveal.elementRef} style={circleReveal.style} className="flex justify-center md:justify-end">
            <div className="relative">
              {/* Glowing ring */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan p-1 shadow-glow">
                <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl flex items-center justify-center">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${colorClass} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-12 h-12 text-background" />
                  </div>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-8 -left-3 w-2 h-2 bg-neon-pink rounded-full opacity-40 animate-pulse delay-500"></div>
              <div className="absolute -bottom-1 left-8 w-3 h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
