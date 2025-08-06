
import { useEffect, useState } from 'react';

export const useScrollTerrain = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      ) - window.innerHeight;
      
      // Ensure we have valid values
      if (documentHeight <= 0) {
        console.log('useScrollTerrain: Document height invalid, setting progress to 0');
        setScrollProgress(0);
        return;
      }
      
      const progress = Math.min(Math.max(scrollTop / documentHeight, 0), 1);
      setScrollProgress(progress);
      
      // Debug log with throttling
      if (Math.floor(Date.now() / 1000) % 2 === 0) {
        console.log('useScrollTerrain - ScrollTop:', scrollTop, 'DocHeight:', documentHeight, 'Progress:', progress.toFixed(3));
      }
    };
    
    // Add passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollProgress;
};
