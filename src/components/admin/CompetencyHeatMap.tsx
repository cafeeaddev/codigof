import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompetencyData {
  userId: string;
  userName: string;
  userEmail: string;
  userArea: string;
  software: string;
  rating: number;
  ratingLabel: string;
}

interface CompetencyHeatMapProps {
  data: CompetencyData[];
}

export const CompetencyHeatMap = ({ data }: CompetencyHeatMapProps) => {
  const heatMapData = useMemo(() => {
    // Agrupar dados por usuário e software
    const userSoftwareMap = new Map<string, Map<string, number>>();
    const users = new Set<string>();
    const softwares = new Set<string>();

    data.forEach(item => {
      users.add(item.userName);
      softwares.add(item.software);
      
      if (!userSoftwareMap.has(item.userName)) {
        userSoftwareMap.set(item.userName, new Map());
      }
      userSoftwareMap.get(item.userName)!.set(item.software, item.rating);
    });

    return {
      users: Array.from(users).sort(),
      softwares: Array.from(softwares).sort(),
      ratingsMap: userSoftwareMap
    };
  }, [data]);

  const getColorClass = (rating: number | undefined): string => {
    if (!rating) return "bg-muted";
    if (rating <= 1) return "bg-red-200 dark:bg-red-900";
    if (rating <= 2) return "bg-orange-200 dark:bg-orange-900";
    if (rating <= 3) return "bg-yellow-200 dark:bg-yellow-900";
    if (rating <= 4) return "bg-green-200 dark:bg-green-900";
    return "bg-green-400 dark:bg-green-700";
  };

  const getRatingLabel = (rating: number): string => {
    if (rating <= 1) return "Iniciante";
    if (rating <= 2) return "Básico";
    if (rating <= 3) return "Intermediário";
    if (rating <= 4) return "Avançado";
    return "Expert";
  };

  if (heatMapData.users.length === 0 || heatMapData.softwares.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor de Competências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Nenhum dado de competência encontrado com os filtros aplicados.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Competências</CardTitle>
        <div className="text-sm text-muted-foreground">
          Visualização das competências técnicas por usuário e software
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Header com nomes dos softwares */}
            <div className="flex">
              <div className="w-40 p-2 font-medium text-sm">Usuário</div>
              {heatMapData.softwares.map(software => (
                <div key={software} className="w-24 p-2 text-xs font-medium text-center">
                  {software}
                </div>
              ))}
            </div>
            
            {/* Linhas dos usuários */}
            <TooltipProvider>
              {heatMapData.users.map(user => (
                <div key={user} className="flex border-t">
                  <div className="w-40 p-2 text-sm truncate" title={user}>
                    {user}
                  </div>
                  {heatMapData.softwares.map(software => {
                    const rating = heatMapData.ratingsMap.get(user)?.get(software);
                    return (
                      <Tooltip key={`${user}-${software}`}>
                        <TooltipTrigger asChild>
                          <div 
                            className={`w-24 h-12 p-2 text-xs text-center flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80 ${getColorClass(rating)}`}
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {rating ? rating.toFixed(1) : '-'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-medium">{user}</div>
                            <div className="text-sm">{software}</div>
                            {rating ? (
                              <>
                                <div className="text-sm">Nota: {rating.toFixed(1)}/5</div>
                                <div className="text-sm">Nível: {getRatingLabel(rating)}</div>
                              </>
                            ) : (
                              <div className="text-sm">Não avaliado</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Legenda:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"></div>
              <span>Iniciante (1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900 rounded"></div>
              <span>Básico (2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 rounded"></div>
              <span>Intermediário (3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded"></div>
              <span>Avançado (4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 dark:bg-green-700 rounded"></div>
              <span>Expert (5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span>Não avaliado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};