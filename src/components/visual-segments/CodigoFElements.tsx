import { useEffect, useState } from 'react';
import { Code, Binary, GitBranch, Terminal, Layers } from 'lucide-react';

const BinaryRain = () => {
  const [raindrops, setRaindrops] = useState<Array<{ id: number; x: number; y: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRaindrops(prev => {
        const newDrops = [];
        
        // Add new raindrops
        if (Math.random() < 0.3) {
          newDrops.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 100,
            y: -5,
            speed: 1 + Math.random() * 2,
            opacity: 0.3 + Math.random() * 0.7
          });
        }

        // Update existing raindrops
        const updated = prev
          .concat(newDrops)
          .map(drop => ({
            ...drop,
            y: drop.y + drop.speed
          }))
          .filter(drop => drop.y < 105); // Remove drops that fall off screen

        return updated.slice(-50); // Keep only last 50 drops for performance
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {raindrops.map(drop => (
        <div
          key={drop.id}
          className="absolute text-accent font-mono text-sm select-none"
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            opacity: drop.opacity,
            transform: 'translateX(-50%)'
          }}
        >
          {Math.random() > 0.5 ? '1' : '0'}
        </div>
      ))}
    </div>
  );
};

interface CodeElementProps {
  icon: React.ReactNode;
  label: string;
  code: string;
  delay: number;
  position: { x: number; y: number };
}

const CodeElement = ({ icon, label, code, delay, position }: CodeElementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedCode, setDisplayedCode] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsTyping(true);
        // Typing animation
        let index = 0;
        const typingInterval = setInterval(() => {
          setDisplayedCode(code.slice(0, index));
          index++;
          if (index > code.length) {
            clearInterval(typingInterval);
          }
        }, 50);
      }, 500);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, code]);

  return (
    <div
      className={`absolute transition-all duration-1000 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="bg-background/90 backdrop-blur-sm border border-accent/30 rounded-lg p-4 min-w-[200px] max-w-[300px]">
        <div className="flex items-center mb-2">
          <div className="text-2xl text-accent mr-2">
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        
        <div className="bg-background/50 rounded p-2 font-mono text-xs text-accent">
          <span className="text-accent/60">{'> '}</span>
          {displayedCode}
          {isTyping && displayedCode.length < code.length && (
            <span className="animate-pulse">|</span>
          )}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/5 rounded-lg blur-lg" />
      </div>
    </div>
  );
};

export const CodigoFElements = () => {
  const codeElements = [
    {
      icon: <Code />,
      label: 'Desenvolvimento',
      code: 'function inovar() { return true; }',
      position: { x: 20, y: 30 },
      delay: 0
    },
    {
      icon: <GitBranch />,
      label: 'Colaboração',
      code: 'git merge --teamwork',
      position: { x: 80, y: 30 },
      delay: 1500
    },
    {
      icon: <Terminal />,
      label: 'Automação',
      code: 'npm run optimize',
      position: { x: 30, y: 70 },
      delay: 3000
    },
    {
      icon: <Layers />,
      label: 'Arquitetura',
      code: 'class Innovation extends Future',
      position: { x: 70, y: 70 },
      delay: 4500
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtle Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Central Código F Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative animate-fade-in" style={{ animationDuration: '2s' }}>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          
          {/* Logo real do Código F */}
          <img 
            src="/images/d64d427e-c1fe-4135-8b65-708c8fa4fed0.png" 
            alt="Código F Logo" 
            className="w-48 h-48 object-contain relative z-10"
          />
          
          {/* Subtle orbiting dots */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `orbit 8s linear infinite`,
                animationDelay: `${i * 2}s`,
                transformOrigin: `80px 0px`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating code snippets */}
      <div className="absolute top-20 left-20 animate-fade-in opacity-30" style={{ animationDelay: '1s' }}>
        <div className="text-primary/60 font-mono text-sm">
          <div>const futuro = () =&gt; &#123;</div>
          <div>&nbsp;&nbsp;return 'inovação';</div>
          <div>&#125;;</div>
        </div>
      </div>

      <div className="absolute bottom-20 right-20 animate-fade-in opacity-30" style={{ animationDelay: '1.5s' }}>
        <div className="text-primary/60 font-mono text-sm">
          <div>if (conhecimento) &#123;</div>
          <div>&nbsp;&nbsp;transform();</div>
          <div>&#125;</div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-16 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '2.5s' }}>
        <h2 className="text-3xl font-bold text-primary mb-2">Código F</h2>
        <p className="text-lg text-foreground/70">Desenvolvimento & Inteligência Coletiva</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes orbit {
            from {
              transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg);
            }
          }
        `
      }} />
    </div>
  );
};