import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  sectionId: string;
  sectionIndex: number;
  className?: string;
  registerSection?: (id: string, element: HTMLElement) => void;
  unregisterSection?: (id: string) => void;
}

export const SectionContainer = ({
  children,
  sectionId,
  sectionIndex,
  className,
  registerSection,
  unregisterSection
}: SectionContainerProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !registerSection) return;

    element.dataset.sectionIndex = sectionIndex.toString();
    registerSection(sectionId, element);

    return () => {
      if (unregisterSection) {
        unregisterSection(sectionId);
      }
    };
  }, [sectionId, sectionIndex, registerSection, unregisterSection]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "min-h-screen w-full flex-shrink-0 relative",
        className
      )}
      data-section-id={sectionId}
      data-section-index={sectionIndex}
    >
      {children}
    </div>
  );
};