import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { LucideIcon } from 'lucide-react';

interface FeatureFoldProps {
  id: string;
  title: string;
  subtitle: string;
  colorClass: string; // e.g., 'bg-neon-cyan'
  Icon: LucideIcon;
  titleClass?: string;
}

export const FeatureFold = ({ id, title, subtitle, colorClass: _colorClass, Icon: _Icon, titleClass = 'text-neon-purple' }: FeatureFoldProps) => {
  const titleReveal = useScrollReveal({ direction: 'left', delay: 0, distance: 100 });
  const circleReveal = useScrollReveal({ direction: 'right', delay: 200, distance: 100 });

  return (
    <section id={id} className="min-h-[100svh] flex items-center px-4 sm:px-6 lg:px-8 pr-6 sm:pr-12 lg:pr-24 py-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 lg:gap-16">
          <div ref={titleReveal.elementRef} style={titleReveal.style}>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 drop-shadow-[0_2px_18px_hsl(var(--background)_/_0.5)] ${titleClass}`}>{title}</h2>
            <div className="flex items-start gap-3">
              <span aria-hidden className="mt-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)_/_0.6)]"></span>
              <p className="text-lg sm:text-xl leading-relaxed max-w-3xl text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div ref={circleReveal.elementRef} style={circleReveal.style} className="flex justify-center md:justify-end md:pr-10 lg:pr-24 xl:pr-36 2xl:pr-48">
            <div className="relative">
              {/* Glowing ring */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow">
                <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl overflow-hidden relative">
                  {circleReveal.isVisible ? (
                    <video 
                      className="w-full h-full object-cover rounded-full"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full rounded-full bg-background/90" aria-hidden />
                  )}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-8 -left-3 w-2 h-2 bg-neon-purple rounded-full opacity-40 animate-pulse delay-500"></div>
              <div className="absolute -bottom-1 left-8 w-3 h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
