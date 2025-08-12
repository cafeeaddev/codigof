import React from "react";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Achievement {
  id: string | number;
  title: string;
  done?: boolean;
}

interface AchievementCardProps {
  title: string;
  done?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ title, done }) => {
  return (
    <div
      tabIndex={0}
      className={cn(
        "rounded-2xl border backdrop-blur-sm p-4 sm:p-5 transition duration-200",
        "bg-[hsl(var(--background)/0.3)]",
        "border-[hsl(var(--neon-green)/0.15)]",
        "hover:scale-[1.03] hover:border-[hsl(var(--neon-green))] focus:outline-none",
        "focus:ring-2 focus:ring-[hsl(var(--neon-green))] motion-reduce:transform-none motion-reduce:transition-none"
      )}
      role="group"
      aria-label={`Conquista: ${title}${done ? ' — concluída' : ''}`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <Medal
          size={28}
          className="text-[hsl(var(--neon-green))]"
          style={{ filter: 'drop-shadow(0 0 12px hsl(var(--neon-green)))' }}
          aria-hidden
        />
        <span className="text-[hsl(var(--lavender))] text-sm sm:text-base font-semibold group-hover:text-[hsl(var(--neon-green))] transition-colors">
          {title}
        </span>
      </div>
    </div>
  );
};

interface AchievementListProps {
  achievements: Achievement[];
  className?: string;
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements, className }) => {
  return (
    <section aria-label="Conquistas" className={cn("mb-6", className)}>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((a) => (
          <AchievementCard key={a.id} title={a.title} done={a.done} />
        ))}
      </div>
    </section>
  );
};

export default AchievementList;
