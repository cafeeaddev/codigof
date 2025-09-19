import { useEffect, useState } from 'react';
import { Building2, Users, Trophy, Target, Zap } from 'lucide-react';

interface GlowingLogoProps {
  delay: number;
}

const GlowingLogo = ({ delay }: GlowingLogoProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
    >
      <div className="relative">
        {/* Main Logo */}
        <div className="w-32 h-32 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-full flex items-center justify-center border-4 border-primary/50 animate-pulse">
          <Building2 className="w-16 h-16 text-white" />
        </div>
        
        {/* Glow Rings */}
        <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary/30 animate-ping" />
        <div className="absolute inset-0 w-32 h-32 rounded-full border border-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 w-32 h-32 rounded-full border border-primary/10 animate-ping" style={{ animationDelay: '1s' }} />
        
        {/* Light Rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-20 bg-gradient-to-t from-primary/60 to-transparent"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '50% 50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
              animation: `pulse 2s infinite`,
              animationDelay: `${i * 0.25}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  position: { x: number; y: number };
}

const ValueCard = ({ icon, title, description, delay, position }: ValueCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`absolute transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-4 w-48 text-center group hover:scale-105 transition-transform">
        <div className="text-3xl text-primary mb-2 group-hover:animate-bounce">
          {icon}
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
        <p className="text-xs text-foreground/70">{description}</p>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/5 rounded-lg blur-lg group-hover:bg-primary/10 transition-all" />
      </div>
    </div>
  );
};

export const ForvisMazarsElements = () => {
  const values = [
    {
      icon: <Users />,
      title: 'Colaboradores',
      description: 'Capacitação e desenvolvimento',
      position: { x: 20, y: 20 },
      delay: 1000
    },
    {
      icon: <Trophy />,
      title: 'Excelência',
      description: 'Qualidade em cada interação',
      position: { x: 80, y: 20 },
      delay: 2000
    },
    {
      icon: <Target />,
      title: 'Foco no Cliente',
      description: 'Superando expectativas',
      position: { x: 20, y: 80 },
      delay: 3000
    },
    {
      icon: <Zap />,
      title: 'Inovação',
      description: 'Transformação digital',
      position: { x: 80, y: 80 },
      delay: 4000
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Central Forvis Mazars Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
          {/* Premium glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl rounded-full animate-pulse" />
          
          {/* Simple elegant logo representation */}
          <div className="relative w-64 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-1">FORVIS MAZARS</h1>
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-full"></div>
              <p className="text-sm text-foreground/70 mt-1 tracking-widest">EXCELLENCE</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle floating elements */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
      
      {/* Company Tagline */}
      <div className="absolute bottom-16 left-0 right-0 text-center animate-fade-in" style={{animationDelay: '2s'}}>
        <p className="text-xl text-foreground/80">Otimização de Processos & Impacto Significativo</p>
      </div>
    </div>
  );
};