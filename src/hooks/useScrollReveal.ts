import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  startOffset?: number;
  endOffset?: number;
  stayVisible?: boolean; // Keep element always visible like spaace.io
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    delay = 0,
    duration = 800,
    distance = 30, // Reduced distance for subtle effect
    direction = 'fade',
    startOffset = 0.8,
    endOffset = 0.2,
    stayVisible = true // Default to always stay visible like spaace.io
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
      
      // For spaace.io effect - calculate when element is in center area
      const centerArea = windowHeight * 0.5; // Middle 50% of screen
      const elementCenter = elementTop + elementHeight / 2;
      
      let scrollProgress = 0;
      
      if (stayVisible) {
        // Always visible mode - just fade in when near center
        if (elementCenter <= windowHeight * 0.7 && elementCenter >= windowHeight * 0.3) {
          scrollProgress = 1;
        } else {
          // Gradual fade based on distance from center
          const distanceFromCenter = Math.abs(elementCenter - windowHeight * 0.5);
          const maxDistance = windowHeight * 0.3;
          scrollProgress = Math.max(0, 1 - (distanceFromCenter / maxDistance));
        }
      } else {
        // Original behavior for elements that should move off-screen
        const startPoint = windowHeight * startOffset;
        const endPoint = windowHeight * endOffset;
        
        if (elementTop <= startPoint && elementTop >= endPoint - elementHeight) {
          const totalDistance = startPoint - endPoint + elementHeight;
          const currentDistance = startPoint - elementTop;
          scrollProgress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);
        } else if (elementTop < endPoint - elementHeight) {
          scrollProgress = 1;
        }
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
  }, [delay, startOffset, endOffset, stayVisible]);

  const getTransform = () => {
    if (direction === 'fade') return 'translate(0)';
    
    const easedProgress = 1 - Math.pow(1 - progress, 2); // Gentler easing
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
        return 'translate(0)';
    }
  };

  const style = {
    opacity: Math.pow(progress, 0.3), // Very gentle opacity curve
    transform: getTransform(),
    transition: 'none',
  };

  return { elementRef, style, progress };
};