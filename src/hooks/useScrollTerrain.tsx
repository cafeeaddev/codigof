
import { useEffect, useState } from 'react';

export const useScrollTerrain = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Add validation to prevent division by zero
      if (documentHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const progress = Math.min(Math.max(scrollTop / documentHeight, 0), 1);
      setScrollProgress(progress);
      
      // Debug log
      console.log('Scroll Progress:', progress, 'ScrollTop:', scrollTop, 'DocHeight:', documentHeight);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollProgress;
};
