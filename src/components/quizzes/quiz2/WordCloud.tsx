import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WordCloudData {
  text: string;
  value: number;
  size: number;
}

interface WordCloudProps {
  data: WordCloudData[];
  className?: string;
}

export const WordCloud = ({ data, className }: WordCloudProps) => {
  const colors = ['#FF6B9D', '#C084FC', '#38BDF8', '#34D399', '#FCD34D', '#FB923C'];

  const words = useMemo(() => {
    return data.map((word, index) => ({
      ...word,
      color: colors[index % colors.length],
      fontSize: Math.max(16, Math.min(word.size, 80))
    }));
  }, [data]);

  if (words.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-96', className)}>
        <p className="text-2xl text-muted-foreground">
          Aguardando contribuições...
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-6 p-8', className)}>
      {words.map((word, index) => (
        <span
          key={`${word.text}-${index}`}
          className="font-bold uppercase transition-all duration-300 hover:scale-110"
          style={{
            fontSize: `${word.fontSize}px`,
            color: word.color,
            opacity: 0.9,
            textShadow: `2px 2px 4px rgba(0,0,0,0.2)`
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};
