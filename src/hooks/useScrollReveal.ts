import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    delay = 0,
    duration = 600,
    distance = 50,
    direction = 'up'
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, isVisible]);

  const getInitialStyle = () => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: 'translate(0, 0)',
        transition: `all ${duration}ms ease-out`
      };
    }

    let transform = '';
    switch (direction) {
      case 'up':
        transform = `translateY(${distance}px)`;
        break;
      case 'down':
        transform = `translateY(-${distance}px)`;
        break;
      case 'left':
        transform = `translateX(${distance}px)`;
        break;
      case 'right':
        transform = `translateX(-${distance}px)`;
        break;
      case 'fade':
        transform = 'translate(0, 0)';
        break;
      default:
        transform = `translateY(${distance}px)`;
    }

    return {
      opacity: 0,
      transform,
      transition: `all ${duration}ms ease-out`
    };
  };

  return { 
    elementRef, 
    style: getInitialStyle(), 
    isVisible 
  };
};