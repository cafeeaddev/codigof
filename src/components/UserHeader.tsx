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

export const UserHeader: React.FC<UserHeaderProps> = ({ name, level, breadcrumb = 'Início', className }) => {
  const levelColor = levelVarMap[level] || 'var(--primary)';

  return (
    <header className={cn("flex flex-col gap-3 mb-8", className)}>
      {/* Saudação como H1 */}
      <h1
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[hsl(var(--neon-pink))] break-words hyphens-auto"
        style={{ wordBreak: 'break-word' }}
      >
        Parabéns, {name}! Sua jornada foi concluída com sucesso!
      </h1>

      {/* Linha secundária: badge do nível + breadcrumb */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="secondary"
          className="text-background font-medium shadow-sm"
          style={{
            background: `hsl(${levelColor})`,
            color: 'hsl(var(--background))',
            borderColor: `hsl(${levelColor})`,
          }}
          aria-label={`Seu Perfil: ${level}`}
        >
          Seu Perfil: {level}
        </Badge>
        <span className="text-sm sm:text-base text-[hsl(var(--lavender))]">
          — {breadcrumb}
        </span>
      </div>
    </header>
  );
};

export default UserHeader;
