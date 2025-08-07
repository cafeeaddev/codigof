import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    delay = 0,
    duration = 600,
    distance = 50,
    direction = 'up',
    threshold = 0.3,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Find the internal scroll container
    const scrollContainer = element.closest('[data-internal-scroll]') as HTMLElement;
    const root = scrollContainer || null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setTimeout(() => {
            setIsVisible(true);
            setHasTriggered(true);
          }, delay);
        } else if (!entry.isIntersecting && !triggerOnce) {
          setIsVisible(false);
        }
      },
      { 
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, threshold, rootMargin, triggerOnce, hasTriggered]);

  const getTransform = () => {
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
    transform: isVisible ? 'translate(0)' : getTransform(),
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return { elementRef, style, isVisible };
};