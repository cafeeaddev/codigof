import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  software: string;
  value: number;
  onChange: (value: number) => void;
  legends: Record<number, { text: string; points: number }>;
}

export const StarRating = ({ software, value, onChange, legends }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleStarClick = (starValue: number) => {
    // If clicking the same star that's already selected, deselect it (set to 0)
    if (value === starValue) {
      onChange(0);
    } else {
      onChange(starValue);
    }
  };

  const getDisplayValue = () => {
    return hoverValue !== null ? hoverValue : value;
  };

  const currentLegend = legends[getDisplayValue()];

  return (
    <div className="p-4 border border-secondary/20 rounded-lg bg-background/50">
      <div className="mb-3">
        <h5 className="font-medium text-foreground text-sm">{software}</h5>
      </div>
      
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            type="button"
            className={cn(
              "p-1 rounded transition-colors duration-150",
              "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => setHoverValue(starIndex)}
            onMouseLeave={() => setHoverValue(null)}
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors duration-150",
                starIndex <= getDisplayValue()
                  ? "fill-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            />
          </button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground min-h-[2.5rem]">
        {currentLegend && (
          <span className="leading-relaxed">
            <strong>({getDisplayValue()} estrela{getDisplayValue() !== 1 ? 's' : ''}):</strong> {typeof currentLegend === 'object' ? currentLegend.text : currentLegend}
          </span>
        )}
      </div>
    </div>
  );
};