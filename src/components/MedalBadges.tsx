import React from "react";
import { Medal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface MedalBadgesProps {
  completed: {
    m1: boolean;
    m2: boolean;
    m3: boolean;
    m4: boolean;
  };
  size?: "sm" | "md";
  className?: string;
  medalNames?: string[]; // [m1, m2, m3, m4]
  showNames?: boolean; // exibe os nomes abaixo dos ícones
  showTitle?: boolean; // exibe "Medalhas" acima das medalhas
}

export const MedalBadges: React.FC<MedalBadgesProps> = ({ completed, size = "md", className, medalNames, showNames = false, showTitle = false }) => {
  const defaultMedalNames = [
    "Satélite",
    "Planeta", 
    "Estrela",
    "Galáxia",
  ];
  
  const medalDescriptions = [
    "Você lançou seu primeiro satélite. A jornada começou!",
    "Você conquistou um planeta. Espaço ampliado!",
    "Você dominou uma estrela. Brilho de um verdadeiro mestre!",
    "Você explorou uma galáxia inteira. Imensidão sob controle!"
  ];
  
  const names = medalNames && medalNames.length === 4 ? medalNames : defaultMedalNames;
  const items = [
    { id: 1, label: "Missão 1", done: completed.m1, medalName: names[0], description: medalDescriptions[0] },
    { id: 2, label: "Missão 2", done: completed.m2, medalName: names[1], description: medalDescriptions[1] },
    { id: 3, label: "Missão 3", done: completed.m3, medalName: names[2], description: medalDescriptions[2] },
    { id: 4, label: "Missão 4", done: completed.m4, medalName: names[3], description: medalDescriptions[3] },
  ];

  const iconSize = size === "sm" ? 16 : 20;
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const gap = size === "sm" ? "gap-2" : "gap-3";
  const pad = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("flex flex-col items-center relative z-[100] pointer-events-auto", className)} aria-label="Insígnias de missões">
        {showTitle && (
          <div className="text-xs text-muted-foreground mb-2 font-medium">Medalhas</div>
        )}
        <div className={cn("flex items-center", gap)}>
          {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  role="img"
                  aria-label={`${item.label} ${item.done ? "concluída" : "pendente"}`}
                  className={cn(
                    "rounded-full border inline-flex items-center justify-center transition-colors pointer-events-auto",
                    pad,
                    item.done
                      ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan ring-1 ring-neon-cyan/40"
                      : "bg-muted/30 border-border text-muted-foreground"
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <Medal size={iconSize} strokeWidth={2} />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 rounded-full",
                        dotSize,
                        item.done ? "bg-neon-cyan" : "bg-border"
                      )}
                      aria-hidden
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{item.medalName}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
            {showNames && (
              <span className="mt-1 text-xs text-foreground text-center">{item.medalName}</span>
            )}
          </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MedalBadges;
