import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, User } from "lucide-react";

interface PersonData {
  userId: string;
  userName: string;
  userEmail: string;
  userArea: string;
  rating: number;
  ratingLabel: string;
}

interface SoftwarePeopleDetailsProps {
  software: string;
  people: PersonData[];
}

const getRatingColor = (rating: number): string => {
  if (rating <= 1) return "text-red-600 dark:text-red-400";
  if (rating <= 2) return "text-orange-600 dark:text-orange-400";
  if (rating <= 3) return "text-yellow-600 dark:text-yellow-400";
  if (rating <= 4) return "text-green-600 dark:text-green-400";
  return "text-green-700 dark:text-green-300";
};

const getRatingBadgeVariant = (rating: number): "default" | "secondary" | "destructive" | "outline" => {
  if (rating <= 1) return "destructive";
  if (rating <= 2) return "secondary";
  if (rating <= 3) return "outline";
  return "default";
};

export const SoftwarePeopleDetails = ({ software, people }: SoftwarePeopleDetailsProps) => {
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());

  // Group people by rating level
  const peopleByLevel = people.reduce((acc, person) => {
    const level = person.ratingLabel;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(person);
    return acc;
  }, {} as Record<string, PersonData[]>);

  const toggleLevel = (level: string) => {
    const newOpenLevels = new Set(openLevels);
    if (newOpenLevels.has(level)) {
      newOpenLevels.delete(level);
    } else {
      newOpenLevels.add(level);
    }
    setOpenLevels(newOpenLevels);
  };

  const levelOrder = ['Expert', 'Avançado', 'Intermediário', 'Básico', 'Iniciante'];
  const sortedLevels = levelOrder.filter(level => peopleByLevel[level]?.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          Detalhes de Competência - {software}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {people.length} pessoas avaliadas
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedLevels.map(level => {
          const levelPeople = peopleByLevel[level];
          const isOpen = openLevels.has(level);
          const sampleRating = levelPeople[0]?.rating || 1;

          return (
            <Collapsible key={level} open={isOpen} onOpenChange={() => toggleLevel(level)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={getRatingBadgeVariant(sampleRating)}
                      className="min-w-[80px] justify-center"
                    >
                      {level}
                    </Badge>
                    <span className="text-sm">
                      {levelPeople.length} {levelPeople.length === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2 pl-4 pr-2">
                {levelPeople.map(person => (
                  <div
                    key={person.userId}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-sm">{person.userName}</div>
                      <div className="text-xs text-muted-foreground">{person.userEmail}</div>
                      {person.userArea && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {person.userArea}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getRatingColor(person.rating)}`}>
                        {person.rating}/5
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {sortedLevels.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma pessoa encontrada para este software.
          </div>
        )}
      </CardContent>
    </Card>
  );
};