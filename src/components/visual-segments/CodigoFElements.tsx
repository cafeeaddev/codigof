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
      {/* Binary Rain Background */}
      <BinaryRain />

      {/* Matrix-style Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-accent/30"
              style={{
                animation: `pulse ${2 + (i % 4)}s infinite`,
                animationDelay: `${(i % 12) * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Code Elements */}
      {codeElements.map((element, index) => (
        <CodeElement
          key={index}
          icon={element.icon}
          label={element.label}
          code={element.code}
          delay={element.delay}
          position={element.position}
        />
      ))}

      {/* Central F Logo */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-20 bg-accent/20 rounded-full border-2 border-accent flex items-center justify-center animate-pulse">
          <span className="text-4xl font-bold text-accent">F</span>
        </div>
        
        {/* Orbiting particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full"
            style={{
              animation: `spin 3s linear infinite`,
              animationDelay: `${i * 0.5}s`,
              transformOrigin: '40px 40px',
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 60}deg) translateX(40px)`
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <h3 className="text-2xl font-bold text-accent animate-fade-in">
          Programa Código F
        </h3>
        <p className="text-foreground/80 mt-2 animate-fade-in" style={{ animationDelay: '1s' }}>
          Inteligência coletiva e inovação
        </p>
      </div>
    </div>
  );
};