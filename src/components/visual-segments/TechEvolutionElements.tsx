import { useEffect, useState } from 'react';
import { Monitor, Cpu, Bot, Zap, Wifi } from 'lucide-react';

interface TechIconProps {
  icon: React.ReactNode;
  label: string;
  delay: number;
  position: { x: number; y: number };
}

const TechIcon = ({ icon, label, delay, position }: TechIconProps) => {
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
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative group">
        <div className="text-6xl text-accent animate-pulse">
          {icon}
        </div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-medium text-foreground/80 bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
            {label}
          </span>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 text-6xl text-accent/30 animate-ping group-hover:animate-none">
          {icon}
        </div>
      </div>
    </div>
  );
};

const ConnectionLine = ({ from, to, delay }: { from: { x: number; y: number }; to: { x: number; y: number }; delay: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return (
    <div
      className={`absolute transition-all duration-1000 ${
        isVisible ? 'opacity-60 scale-x-100' : 'opacity-0 scale-x-0'
      }`}
      style={{
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${length * 0.8}px`,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, hsl(var(--accent)), transparent)',
        transformOrigin: 'left center',
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
};

export const TechEvolutionElements = () => {
  const techIcons = [
    { icon: <Monitor />, label: 'Computadores', position: { x: 20, y: 30 }, delay: 0 },
    { icon: <Cpu />, label: 'Processamento', position: { x: 50, y: 20 }, delay: 1500 },
    { icon: <Wifi />, label: 'Conectividade', position: { x: 80, y: 30 }, delay: 3000 },
    { icon: <Bot />, label: 'Inteligência Artificial', position: { x: 35, y: 60 }, delay: 4500 },
    { icon: <Zap />, label: 'Inovação', position: { x: 65, y: 70 }, delay: 6000 },
  ];

  const connections = [
    { from: { x: 20, y: 30 }, to: { x: 50, y: 20 }, delay: 2000 },
    { from: { x: 50, y: 20 }, to: { x: 80, y: 30 }, delay: 3500 },
    { from: { x: 50, y: 20 }, to: { x: 35, y: 60 }, delay: 5000 },
    { from: { x: 35, y: 60 }, to: { x: 65, y: 70 }, delay: 6500 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Connection Lines */}
      {connections.map((connection, index) => (
        <ConnectionLine
          key={index}
          from={connection.from}
          to={connection.to}
          delay={connection.delay}
        />
      ))}

      {/* Tech Icons */}
      {techIcons.map((tech, index) => (
        <TechIcon
          key={index}
          icon={tech.icon}
          label={tech.label}
          delay={tech.delay}
          position={tech.position}
        />
      ))}

      {/* Title */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <h3 className="text-2xl font-bold text-accent animate-fade-in">
          Evolução Tecnológica
        </h3>
        <p className="text-foreground/80 mt-2 animate-fade-in" style={{ animationDelay: '1s' }}>
          Do passado ao futuro da tecnologia
        </p>
      </div>
    </div>
  );
};