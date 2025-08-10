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
    <section id={id} className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div ref={titleReveal.elementRef} style={titleReveal.style}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground text-lg mb-10">{subtitle}</p>
        </div>

        <div ref={circleReveal.elementRef} style={circleReveal.style} className="flex items-center justify-center">
          {/* Glowing ring */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan p-1 shadow-glow">
            <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl flex items-center justify-center">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${colorClass} flex items-center justify-center shadow-lg`}>
                <Icon className="w-12 h-12 text-background" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
