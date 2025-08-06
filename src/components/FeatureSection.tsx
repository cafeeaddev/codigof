import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

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

  const isEven = index % 2 === 0;

  return (
    <section 
      ref={sectionRef}
      id={id}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          isEven ? '' : 'lg:grid-flow-col-dense'
        }`}>
          {/* Content */}
          <div className={`${isEven ? '' : 'lg:col-start-2'} ${
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

          {/* Image/Visual */}
          <div className={`${isEven ? '' : 'lg:col-start-1'} ${
            isVisible ? 'animate-scale-in' : 'opacity-0'
          }`}>
            <div className="relative">
              <div className="bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 rounded-2xl border border-white/10 backdrop-blur-xl p-8 lg:p-12 shadow-glow">
                {/* Placeholder for actual image/demo */}
                <div className="aspect-[4/3] bg-gradient-to-br from-neon-pink/10 to-neon-cyan/10 rounded-xl border border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-neon rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {title} Demo
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-pink/30 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-neon-cyan/30 rounded-full blur-sm animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};