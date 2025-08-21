import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedXPProps {
  startValue: number;
  endValue: number;
  duration?: number;
  triggerAnimation?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export const AnimatedXP: React.FC<AnimatedXPProps> = ({
  startValue,
  endValue,
  duration = 2000,
  triggerAnimation = false,
  onAnimationComplete,
  className
}) => {
  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!triggerAnimation || startValue === endValue) {
      setCurrentValue(endValue);
      return;
    }

    setIsAnimating(true);
    const difference = endValue - startValue;
    const steps = 60;
    const increment = difference / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = startValue + (increment * currentStep);
      
      if (currentStep >= steps) {
        setCurrentValue(endValue);
        setIsAnimating(false);
        clearInterval(timer);
        onAnimationComplete?.();
      } else {
        setCurrentValue(Math.round(newValue));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [startValue, endValue, duration, triggerAnimation, onAnimationComplete]);

  return (
    <span className={cn(
      "transition-all duration-300",
      isAnimating && "text-[hsl(var(--neon-cyan))] scale-110",
      className
    )}>
      {currentValue.toLocaleString()} Xps
    </span>
  );
};