import { useState, useEffect, useRef, useCallback } from 'react';

interface Section {
  id: string;
  element: HTMLElement;
}

export const useInternalScroll = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToSection = useCallback((sectionIndex: number, smooth = true) => {
    if (!containerRef.current || isScrolling) return;
    
    const container = containerRef.current;
    const section = sections[sectionIndex]?.element;
    const targetY = section ? section.offsetTop : sectionIndex * container.clientHeight;
    
    setIsScrolling(true);
    
    if (smooth) {
      container.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
      
      // Reset scrolling state after animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    } else {
      container.scrollTop = targetY;
      setIsScrolling(false);
    }
    
    setCurrentSection(sectionIndex);
  }, [isScrolling, sections]);

  const nextSection = useCallback(() => {
    if (currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1);
    }
  }, [currentSection, sections.length, scrollToSection]);

  const prevSection = useCallback(() => {
    if (currentSection > 0) {
      scrollToSection(currentSection - 1);
    }
  }, [currentSection, scrollToSection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Debounce wheel events
      scrollTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0) {
          nextSection();
        } else {
          prevSection();
        }
      }, 50);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextSection();
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSection();
          break;
        case 'Home':
          e.preventDefault();
          scrollToSection(0);
          break;
        case 'End':
          e.preventDefault();
          scrollToSection(sections.length - 1);
          break;
      }
    };

    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [nextSection, prevSection, isScrolling, sections.length, scrollToSection]);

  // Register sections
  const registerSection = useCallback((id: string, element: HTMLElement) => {
    setSections(prev => {
      const exists = prev.find(s => s.id === id);
      if (exists) return prev;
      return [...prev, { id, element }].sort((a, b) => {
        const aIndex = parseInt(a.element.dataset.sectionIndex || '0');
        const bIndex = parseInt(b.element.dataset.sectionIndex || '0');
        return aIndex - bIndex;
      });
    });
  }, []);

  const unregisterSection = useCallback((id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    containerRef,
    currentSection,
    totalSections: sections.length,
    isScrolling,
    scrollToSection,
    nextSection,
    prevSection,
    registerSection,
    unregisterSection
  };
};