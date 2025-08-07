
import { useState, useEffect } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Find the internal scroll container
      const scrollContainer = document.querySelector('[data-internal-scroll="true"]') as HTMLElement;
      if (!scrollContainer) return;
      
      const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const currentScroll = scrollContainer.scrollTop;
      const progress = totalHeight > 0 ? Math.min(currentScroll / totalHeight, 1) : 0;
      setScrollProgress(progress);
    };

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Find the internal scroll container and add listener
    const scrollContainer = document.querySelector('[data-internal-scroll="true"]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', throttledHandleScroll);
      handleScroll(); // Initial call
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', throttledHandleScroll);
      }
    };
  }, []);

  return scrollProgress;
};
