import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CompetencyData {
  userId: string;
  userName: string;
  userEmail: string;
  userArea: string;
  software: string;
  rating: number;
  ratingLabel: string;
}

interface SoftwareCompetencyChartProps {
  data: CompetencyData[];
}

export const SoftwareCompetencyChart = ({ data }: SoftwareCompetencyChartProps) => {
  const softwareStats = useMemo(() => {
    if (!data.length) return [];

    const softwareMap = new Map<string, number[]>();

    data.forEach(item => {
      if (!softwareMap.has(item.software)) {
        softwareMap.set(item.software, []);
      }
      softwareMap.get(item.software)!.push(item.rating);
    });

    const stats = Array.from(softwareMap.entries()).map(([software, ratings]) => {
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      const total = ratings.length;
      
      // Distribuição por nível
      const distribution = ratings.reduce((acc, rating) => {
        if (rating <= 1) acc.iniciante++;
        else if (rating <= 2) acc.basico++;
        else if (rating <= 3) acc.intermediario++;
        else if (rating <= 4) acc.avancado++;
        else acc.expert++;
        return acc;
      }, { iniciante: 0, basico: 0, intermediario: 0, avancado: 0, expert: 0 });

      return {
        software,
        average,
        total,
        distribution,
        percentage: (average / 5) * 100
      };
    });

    return stats.sort((a, b) => b.average - a.average);
  }, [data]);

  const getAverageColor = (average: number): string => {
    if (average <= 1) return "text-red-600 dark:text-red-400";
    if (average <= 2) return "text-orange-600 dark:text-orange-400";
    if (average <= 3) return "text-yellow-600 dark:text-yellow-400";
    if (average <= 4) return "text-green-600 dark:text-green-400";
    return "text-green-700 dark:text-green-300";
  };

  const getProgressColor = (average: number): string => {
    if (average <= 1) return "bg-red-600";
    if (average <= 2) return "bg-orange-600";
    if (average <= 3) return "bg-yellow-600";
    if (average <= 4) return "bg-green-600";
    return "bg-green-700";
  };

  if (softwareStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competências por Software</CardTitle>
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Competências por Software</CardTitle>
          <div className="text-sm text-muted-foreground">
            Média de competência ordenada por performance
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {softwareStats.map((stat, index) => (
            <div key={stat.software} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <h4 className="font-medium">{stat.software}</h4>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getAverageColor(stat.average)}`}>
                    {stat.average.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.total} avaliações
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={stat.percentage} 
                  className="h-2"
                />
                
                {/* Distribuição detalhada */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {stat.distribution.iniciante > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      Iniciante: {stat.distribution.iniciante}
                    </Badge>
                  )}
                  {stat.distribution.basico > 0 && (
                    <Badge variant="outline" className="text-orange-600">
                      Básico: {stat.distribution.basico}
                    </Badge>
                  )}
                  {stat.distribution.intermediario > 0 && (
                    <Badge variant="outline" className="text-yellow-600">
                      Intermediário: {stat.distribution.intermediario}
                    </Badge>
                  )}
                  {stat.distribution.avancado > 0 && (
                    <Badge variant="outline" className="text-green-600">
                      Avançado: {stat.distribution.avancado}
                    </Badge>
                  )}
                  {stat.distribution.expert > 0 && (
                    <Badge variant="outline" className="text-green-700">
                      Expert: {stat.distribution.expert}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top 3 e Bottom 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Top 3 Softwares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {softwareStats.slice(0, 3).map((stat, index) => (
                <div key={stat.software} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{stat.software}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {stat.average.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Maiores Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {softwareStats.slice(-3).reverse().map((stat, index) => (
                <div key={stat.software} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      {softwareStats.length - 2 + index}
                    </Badge>
                    <span className="text-sm">{stat.software}</span>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {stat.average.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};