import { useState, useEffect, useRef } from 'react';

interface LogicaAplicadaTimerProps {
  startedAt: string | null;
  totalSeconds?: number;
  onTimeUp?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function LogicaAplicadaTimer({ 
  startedAt, 
  totalSeconds = 30, 
  onTimeUp,
  size = 'md'
}: LogicaAplicadaTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft(totalSeconds);
      hasCalledTimeUp.current = false; // Reset when new question starts
      return;
    }

    const startTime = new Date(startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      
      // Only call onTimeUp once, with 1 second delay for suspense
      if (remaining <= 0 && onTimeUp && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        setTimeout(() => {
          onTimeUp();
        }, 1000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [startedAt, totalSeconds, onTimeUp]);

  const percentage = (timeLeft / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  // Neon colors based on time remaining
  const getColors = () => {
    if (timeLeft > 20) {
      return {
        stroke: 'hsl(var(--neon-cyan))',
        glow: 'hsl(var(--neon-cyan))',
        text: 'text-[hsl(var(--neon-cyan))]'
      };
    }
    if (timeLeft > 10) {
      return {
        stroke: 'hsl(60 100% 70%)',
        glow: 'hsl(60 100% 70%)',
        text: 'text-[hsl(60_100%_70%)]'
      };
    }
    return {
      stroke: 'hsl(var(--neon-pink))',
      glow: 'hsl(var(--neon-pink))',
      text: 'text-[hsl(var(--neon-pink))]'
    };
  };

  const colors = getColors();
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer glow ring */}
      <div 
        className={`absolute inset-0 rounded-full ${isUrgent ? 'animate-pulse' : ''}`}
        style={{
          boxShadow: `0 0 ${isUrgent ? '25px' : '15px'} ${colors.glow}`,
          opacity: isUrgent ? 0.6 : 0.4
        }}
      />
      
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle with neon border */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--neon-purple) / 0.2)"
          strokeWidth="6"
        />
        
        {/* Outer decorative ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="hsl(var(--neon-cyan) / 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Progress circle with neon glow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke={colors.stroke}
          className="transition-all duration-100"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            filter: `drop-shadow(0 0 ${isUrgent ? '10px' : '6px'} ${colors.glow})`
          }}
        />
        
        {/* Inner decorative circle */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="hsl(var(--neon-pink) / 0.2)"
          strokeWidth="1"
        />
      </svg>
      
      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className={`font-bold ${textClasses[size]} ${colors.text} transition-all duration-100 ${isCritical ? 'animate-pulse scale-110' : ''}`}
          style={{
            textShadow: `0 0 ${isUrgent ? '15px' : '10px'} ${colors.glow}`
          }}
        >
          {Math.ceil(timeLeft)}
        </span>
      </div>
      
      {/* Corner accents for larger sizes */}
      {size === 'lg' && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[hsl(var(--neon-pink))]" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[hsl(var(--neon-pink))]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[hsl(var(--neon-cyan))]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[hsl(var(--neon-cyan))]" />
        </>
      )}
    </div>
  );
}
