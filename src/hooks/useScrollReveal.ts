import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    delay = 0,
    duration = 800,
    distance = 50,
    direction = 'up',
    threshold = 0.1
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      console.log('useScrollReveal: No element found');
      return;
    }

    console.log('useScrollReveal: Setting up observer for direction:', direction);

    // Check if element is already in viewport on mount
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      console.log('Initial visibility check:', { isInViewport, direction });
      
      if (isInViewport && !hasBeenVisible) {
        console.log('Element already in viewport, triggering animation for:', direction);
        setTimeout(() => {
          setIsVisible(true);
          setHasBeenVisible(true);
        }, delay);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('useScrollReveal: Intersection observed', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          direction,
          hasBeenVisible
        });
        
        if (entry.isIntersecting && !hasBeenVisible) {
          console.log('useScrollReveal: Element is intersecting, applying delay:', delay);
          setTimeout(() => {
            console.log('useScrollReveal: Setting visible to true for direction:', direction);
            setIsVisible(true);
            setHasBeenVisible(true);
          }, delay);
        }
      },
      { 
        threshold,
        rootMargin: '0px 0px -50px 0px' // Less restrictive
      }
    );

    // Initial check
    checkInitialVisibility();
    
    observer.observe(element);
    console.log('useScrollReveal: Observer set up successfully for direction:', direction);

    return () => {
      console.log('useScrollReveal: Cleaning up observer for direction:', direction);
      observer.disconnect();
    };
  }, [threshold, delay, direction, hasBeenVisible]);

  console.log('useScrollReveal render:', { direction, isVisible, hasBeenVisible, delay });

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'fade':
        return 'translate(0)';
      default:
        return `translateY(${distance}px)`;
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0)' : getInitialTransform(),
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return { elementRef, style, isVisible };
};