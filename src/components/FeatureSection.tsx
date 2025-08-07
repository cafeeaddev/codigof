import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Trophy, Medal, Target } from 'lucide-react';

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  index: number;
}

export const FeatureSection = ({ 
  id, 
  title, 
  subtitle, 
  description, 
  image, 
  index 
}: FeatureSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only show the first feature section as our missions/xp/medals section
  if (index !== 0) return null;

  const features = [
    {
      icon: Target,
      customIcon: null,
      title: "4 MISSÕES",
      subtitle: "Desafios interativos",
      color: "bg-neon-cyan"
    },
    {
      icon: Trophy,
      title: "XP & LEVELS", 
      subtitle: "Pontuação e progresso",
      color: "bg-neon-purple"
    },
    {
      icon: Medal,
      title: "MEDALHAS",
      subtitle: "Perfis de habilidade", 
      color: "bg-neon-pink"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id={id}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className={`${
            isVisible ? 'animate-fade-in' : 'opacity-0'
          }`}>
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 lg:p-12 shadow-neon">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                  {title}
                </h2>
                <h3 className="text-lg sm:text-xl text-neon-cyan font-medium mb-6">
                  {subtitle}
                </h3>
              </div>
              
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                {description}
              </p>

            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className={`${
            isVisible ? 'animate-scale-in' : 'opacity-0'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={feature.title}
                  className="bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 p-6 text-center shadow-neon hover:shadow-glow transition-all duration-300"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 ${feature.color} rounded-full flex items-center justify-center`}>
                    {feature.customIcon ? (
                      <img src={feature.customIcon} alt={feature.title} className="w-8 h-8" />
                    ) : (
                      <feature.icon className="w-8 h-8 text-background" />
                    )}
                  </div>
                  
                  <h4 className="text-foreground font-bold text-sm mb-2">
                    {feature.title}
                  </h4>
                  
                  <p className="text-muted-foreground text-xs">
                    {feature.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};