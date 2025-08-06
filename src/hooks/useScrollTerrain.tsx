
import { useEffect, useState } from 'react';

export const useScrollTerrain = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || window.pageYOffset || 0;
          const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          ) - window.innerHeight;
          
          if (documentHeight <= 0) {
            console.log('useScrollTerrain: Document height invalid, setting progress to 0');
            setScrollProgress(0);
            ticking = false;
            return;
          }
          
          const progress = Math.min(Math.max(scrollTop / documentHeight, 0), 1);
          setScrollProgress(progress);
          
          // Enhanced debug logging for mountains
          if (Math.floor(Date.now() / 2000) % 3 === 0) {
            console.log('🏔️ Mountain Scroll - Top:', scrollTop, 'Progress:', (progress * 100).toFixed(1) + '%', 'Altitude:', Math.round(progress * 3000) + 'm');
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Optimized scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollProgress;
};
