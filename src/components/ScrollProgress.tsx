import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  currentSection: number;
  totalSections: number;
  onSectionClick?: (sectionIndex: number) => void;
}

export const ScrollProgress = ({
  currentSection,
  totalSections,
  onSectionClick
}: ScrollProgressProps) => {
  const progress = totalSections > 1 ? (currentSection / (totalSections - 1)) * 100 : 0;

  return (
    <div className="fixed right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col items-center space-y-1 sm:space-y-2">
        {/* Progress bar */}
        <div className="w-0.5 sm:w-1 h-20 sm:h-24 lg:h-32 bg-white/20 rounded-full relative overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ height: `${progress}%` }}
          />
        </div>
        
        {/* Section dots */}
        <div className="flex flex-col space-y-1 sm:space-y-2 mt-2 sm:mt-3 lg:mt-4">
          {Array.from({ length: totalSections }, (_, index) => (
            <button
              key={index}
              onClick={() => onSectionClick?.(index)}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 hover:scale-125",
                index === currentSection
                  ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)] sm:shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                  : "bg-white/30 hover:bg-white/60"
              )}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Section counter */}
        <div className="text-white/70 text-[10px] sm:text-xs font-mono mt-2 sm:mt-3 lg:mt-4">
          {String(currentSection + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};