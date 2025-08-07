import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  startOffset?: number; // When to start the animation (0-1, where 0.5 = middle of viewport)
  endOffset?: number;   // When to complete the animation
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    delay = 0,
    duration = 800,
    distance = 50,
    direction = 'up',
    startOffset = 0.8, // Start animation when element is 80% into viewport
    endOffset = 0.2     // Complete when element is 20% into viewport
  } = options;

  const [progress, setProgress] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate element position relative to viewport
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate scroll progress for this element
      const startPoint = windowHeight * startOffset;
      const endPoint = windowHeight * endOffset;
      
      // Calculate progress (0 to 1)
      let scrollProgress = 0;
      
      if (elementTop <= startPoint && elementTop >= endPoint - elementHeight) {
        const totalDistance = startPoint - endPoint + elementHeight;
        const currentDistance = startPoint - elementTop;
        scrollProgress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);
      } else if (elementTop < endPoint - elementHeight) {
        scrollProgress = 1;
      }
      
      // Apply delay
      const delayedProgress = Math.max(0, scrollProgress - (delay / 1000));
      setProgress(Math.min(delayedProgress * (1000 / (1000 - delay)), 1));
    };

    // Throttled scroll handler for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [delay, startOffset, endOffset]);

  const getTransform = () => {
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    const moveDistance = distance * (1 - easedProgress);
    
    switch (direction) {
      case 'up':
        return `translateY(${moveDistance}px)`;
      case 'down':
        return `translateY(-${moveDistance}px)`;
      case 'left':
        return `translateX(${moveDistance}px)`;
      case 'right':
        return `translateX(-${moveDistance}px)`;
      default:
        return `translateY(${moveDistance}px)`;
    }
  };

  const style = {
    opacity: Math.pow(progress, 0.5), // Slightly ease opacity
    transform: getTransform(),
    transition: `none`, // Remove transitions for smooth scroll-based animation
  };

  return { elementRef, style, progress };
};