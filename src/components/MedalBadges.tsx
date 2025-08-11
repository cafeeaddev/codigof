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
}

export const MedalBadges: React.FC<MedalBadgesProps> = ({ completed, size = "md", className }) => {
  const items = [
    { id: 1, label: "Missão 1", done: completed.m1 },
    { id: 2, label: "Missão 2", done: completed.m2 },
    { id: 3, label: "Missão 3", done: completed.m3 },
    { id: 4, label: "Missão 4", done: completed.m4 },
  ];

  const iconSize = size === "sm" ? 16 : 20;
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const gap = size === "sm" ? "gap-2" : "gap-3";
  const pad = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <TooltipProvider>
      <div className={cn("flex items-center", gap, className)} aria-label="Insígnias de missões">
        {items.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <div
                role="img"
                aria-label={`${item.label} ${item.done ? "concluída" : "pendente"}`}
                className={cn(
                  "rounded-full border inline-flex items-center justify-center transition-colors",
                  pad,
                  item.done
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/30 border-border text-muted-foreground"
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Medal size={iconSize} strokeWidth={2} />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 rounded-full",
                      dotSize,
                      item.done ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {item.label}: {item.done ? "Concluída" : "Pendente"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default MedalBadges;
