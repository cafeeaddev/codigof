import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Trophy, Medal } from 'lucide-react';

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
      icon: null,
      customIcon: "/lovable-uploads/437ccd6a-15f4-45cb-b6cc-cdad65d9594a.png",
      title: "4 MISSÕES",
      subtitle: "Desafios interativos",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "XP & LEVELS", 
      subtitle: "Pontuação e progresso",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Medal,
      title: "MEDALHAS",
      subtitle: "Perfis de habilidade", 
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id={id}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-4xl mx-auto">
        {/* Content Only */}
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-neon text-black font-medium hover:opacity-90 transition-opacity"
              >
                Learn more
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
              >
                View demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};