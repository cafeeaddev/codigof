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
      <div className="max-w-6xl mx-auto">
        <div className={`${
          isVisible ? 'animate-fade-in' : 'opacity-0'
        }`}>
          {/* Main content card */}
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-8 lg:p-12 shadow-neon mb-8">
            <div className="flex items-start gap-6 lg:gap-8">
              {/* Avatar/Video section */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Content section */}
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Sou a <span className="text-secondary">Cody</span>, sua IA mentora.
                </h2>
                <h3 className="text-lg sm:text-xl mb-4">
                  Pronto(a) para ativar seu modo <span className="text-neon-pink font-bold">Ninja digital</span>?
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <p className="text-muted-foreground text-lg">
                    {description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">Posso te contar um segredo?</span>
                  <span className="text-xs">🤫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <div 
                key={feature.title}
                className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/30 p-6 text-center hover:bg-card/80 transition-all duration-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 ${feature.color} rounded-full flex items-center justify-center`}>
                  {feature.customIcon ? (
                    <img src={feature.customIcon} alt={feature.title} className="w-8 h-8" />
                  ) : (
                    <feature.icon className="w-8 h-8 text-background" />
                  )}
                </div>
                
                <h4 className="text-foreground font-bold text-lg mb-2">
                  {feature.title}
                </h4>
                
                <p className="text-muted-foreground text-sm">
                  {feature.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};