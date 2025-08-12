import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LevelName = 'Beginner' | 'Beginner +' | 'Explorer' | 'Pro-Player' | 'Ninja';

interface UserHeaderProps {
  name: string;
  level: LevelName;
  breadcrumb?: string;
  className?: string;
}

const levelVarMap: Record<LevelName, string> = {
  'Beginner': 'var(--level-beginner)',
  'Beginner +': 'var(--level-beginner)',
  'Explorer': 'var(--level-explorer)',
  'Pro-Player': 'var(--level-pro-player)',
  'Ninja': 'var(--level-ninja)',
};

export const UserHeader: React.FC<UserHeaderProps> = ({ name, level, className }) => {
  const levelColor = levelVarMap[level] || 'var(--primary)';

  return (
    <header className={cn("flex flex-col items-center text-center gap-4 mb-10 py-8", className)}>
      {/* Título principal com gradiente neon animado */}
      <h1
        className="text-[28px] sm:text-[36px] md:text-[56px] leading-tight font-extrabold text-neon-gradient text-glow-subtle break-words hyphens-none"
        style={{ wordBreak: 'break-word' }}
      >
        Parabéns, {name}! Sua jornada foi concluída com sucesso!
      </h1>

      {/* Badge de perfil destacado */}
      <div className="mt-2">
        <div
          className="inline-flex items-center justify-center rounded-[28px] px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 text-[16px] sm:text-[18px] md:text-[20px] font-bold shadow-lg hover:animate-[pulse_2.5s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{
            background: `hsl(${levelColor})`,
            color: `hsl(var(--on-level))`,
            boxShadow: `0 0 24px hsl(${levelColor} / 0.45)`,
            border: `1px solid hsl(${levelColor})`,
          }}
          aria-label={`Seu Perfil: ${level}`}
        >
          Seu Perfil: {level}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
