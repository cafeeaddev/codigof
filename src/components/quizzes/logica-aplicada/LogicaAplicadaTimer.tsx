import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft(totalSeconds);
      return;
    }

    const startTime = new Date(startedAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0 && onTimeUp) {
        onTimeUp();
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

  const getColor = () => {
    if (timeLeft > 20) return 'stroke-emerald-500';
    if (timeLeft > 10) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={`transition-all duration-100 ${getColor()}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-white ${textClasses[size]} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
}
