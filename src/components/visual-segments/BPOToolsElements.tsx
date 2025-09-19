import { useEffect, useState } from 'react';
import { Database, Globe, BarChart3, Calculator, Link } from 'lucide-react';

interface ToolCardProps {
  icon: React.ReactNode;
  name: string;
  delay: number;
  position: { x: number; y: number };
}

const ToolCard = ({ icon, name, delay, position }: ToolCardProps) => {
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
      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-4 min-w-[120px] text-center group hover:scale-105 transition-transform">
        <div className="text-3xl text-primary mb-2 group-hover:animate-pulse">
          {icon}
        </div>
        <div className="text-sm font-medium text-foreground">{name}</div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/10 rounded-lg blur-lg group-hover:bg-primary/20 transition-all" />
      </div>
    </div>
  );
};

const FloatingConnection = ({ start, end, delay }: { start: { x: number; y: number }; end: { x: number; y: number }; delay: number }) => {
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
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <line
          x1={`${start.x}%`}
          y1={`${start.y}%`}
          x2={`${end.x}%`}
          y2={`${end.y}%`}
          stroke="url(#connectionGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

export const BPOToolsElements = () => {
  const tools = [
    { icon: <Database />, name: 'CSC Digital', position: { x: 25, y: 25 }, delay: 0 },
    { icon: <Link />, name: 'Integra', position: { x: 75, y: 25 }, delay: 1000 },
    { icon: <BarChart3 />, name: 'Portal Financeiro', position: { x: 25, y: 75 }, delay: 2000 },
    { icon: <Calculator />, name: 'Hubcount', position: { x: 75, y: 75 }, delay: 3000 },
  ];

  const connections = [
    { start: { x: 25, y: 25 }, end: { x: 75, y: 25 }, delay: 1500 },
    { start: { x: 75, y: 25 }, end: { x: 75, y: 75 }, delay: 2500 },
    { start: { x: 75, y: 75 }, end: { x: 25, y: 75 }, delay: 3500 },
    { start: { x: 25, y: 75 }, end: { x: 25, y: 25 }, delay: 4000 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Tool Cards - Simplified Layout */}
      {tools.map((tool, index) => (
        <ToolCard
          key={index}
          icon={tool.icon}
          name={tool.name}
          delay={tool.delay * 0.5}
          position={tool.position}
        />
      ))}

      {/* Central Hub Element */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-24 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary animate-pulse" />
          </div>
          {/* Simple rotating indicators */}
          <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '15s' }}>
            <div className="absolute w-1 h-1 bg-primary/60 rounded-full" style={{ top: '15%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="absolute w-1 h-1 bg-primary/60 rounded-full" style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-16 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
        <h2 className="text-3xl font-bold text-primary mb-2">Ferramentas BPO</h2>
        <p className="text-lg text-foreground/70">CSC Digital • Integra • Portal Financeiro • Hubcount</p>
      </div>
    </div>
  );
};