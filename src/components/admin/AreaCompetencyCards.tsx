import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Award, ChevronDown, ChevronRight, BarChart3, Star } from "lucide-react";

interface CompetencyData {
  userId: string;
  userName: string;
  userEmail: string;
  userArea: string;
  software: string;
  rating: number;
  ratingLabel: string;
}

interface AreaCompetencyCardsProps {
  data: CompetencyData[];
}

export const AreaCompetencyCards = ({ data }: AreaCompetencyCardsProps) => {
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const areaStats = useMemo(() => {
    if (!data.length) return [];

    const areaMap = new Map<string, CompetencyData[]>();

    data.forEach(item => {
      if (!areaMap.has(item.userArea)) {
        areaMap.set(item.userArea, []);
      }
      areaMap.get(item.userArea)!.push(item);
    });

    const stats = Array.from(areaMap.entries()).map(([area, items]) => {
      const ratings = items.map(item => item.rating);
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      const totalUsers = new Set(items.map(item => item.userId)).size;
      const totalEvaluations = items.length;

      // Top softwares desta área
      const softwareMap = new Map<string, number[]>();
      items.forEach(item => {
        if (!softwareMap.has(item.software)) {
          softwareMap.set(item.software, []);
        }
        softwareMap.get(item.software)!.push(item.rating);
      });

      const softwareStats = Array.from(softwareMap.entries())
        .map(([software, softwareRatings]) => ({
          software,
          average: softwareRatings.reduce((sum, rating) => sum + rating, 0) / softwareRatings.length,
          count: softwareRatings.length
        }))
        .sort((a, b) => b.average - a.average);

      const topSoftware = softwareStats[0];
      const weakestSoftware = softwareStats[softwareStats.length - 1];

      // Distribuição de competências
      const distribution = ratings.reduce((acc, rating) => {
        if (rating <= 1) acc.iniciante++;
        else if (rating <= 2) acc.basico++;
        else if (rating <= 3) acc.intermediario++;
        else if (rating <= 4) acc.avancado++;
        else acc.expert++;
        return acc;
      }, { iniciante: 0, basico: 0, intermediario: 0, avancado: 0, expert: 0 });

      const expertPercentage = ((distribution.expert + distribution.avancado) / totalEvaluations) * 100;

      return {
        area,
        average,
        totalUsers,
        totalEvaluations,
        topSoftware,
        weakestSoftware,
        distribution,
        expertPercentage,
        percentage: (average / 5) * 100,
        softwareCount: softwareStats.length
      };
    });

    return stats.sort((a, b) => b.average - a.average);
  }, [data]);

  const getPerformanceColor = (average: number): string => {
    if (average <= 2) return "text-red-600 dark:text-red-400";
    if (average <= 3) return "text-yellow-600 dark:text-yellow-400";
    if (average <= 4) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  if (areaStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competências por Área</CardTitle>
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
      <div className="text-lg font-semibold">Competências por Área</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areaStats.map((stat, index) => {
          const isExpanded = expandedArea === stat.area;
          
          return (
            <Card key={stat.area} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{stat.area}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Média geral */}
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(stat.average)}`}>
                    {stat.average.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Média da área
                  </div>
                  <Progress value={stat.percentage} className="mt-2 h-2" />
                </div>

                {/* Estatísticas básicas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users size={14} />
                      <span>Usuários</span>
                    </div>
                    <div className="font-semibold">{stat.totalUsers}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Award size={14} />
                      <span>Avaliações</span>
                    </div>
                    <div className="font-semibold">{stat.totalEvaluations}</div>
                  </div>
                </div>

                {/* Performance destaque */}
                <div className="space-y-2">
                  {stat.topSoftware && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="text-muted-foreground">Melhor:</span>
                      <span className="font-medium">{stat.topSoftware.software}</span>
                      <Badge variant="outline" className="text-xs text-green-600">
                        {stat.topSoftware.average.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                  
                  {stat.weakestSoftware && stat.weakestSoftware !== stat.topSoftware && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown size={14} className="text-red-600" />
                      <span className="text-muted-foreground">Oportunidade:</span>
                      <span className="font-medium">{stat.weakestSoftware.software}</span>
                      <Badge variant="outline" className="text-xs text-red-600">
                        {stat.weakestSoftware.average.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Percentual de expertise */}
                <div className="border-t pt-3">
                  <div className="text-sm text-muted-foreground">
                    Expertise (Avançado + Expert)
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={stat.expertPercentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium">
                      {stat.expertPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Distribuição resumida */}
                <div className="flex flex-wrap gap-1 text-xs">
                  {stat.distribution.expert > 0 && (
                    <Badge variant="outline" className="text-green-700">
                      Expert: {stat.distribution.expert}
                    </Badge>
                  )}
                  {stat.distribution.avancado > 0 && (
                    <Badge variant="outline" className="text-green-600">
                      Avançado: {stat.distribution.avancado}
                    </Badge>
                  )}
                  {stat.distribution.intermediario > 0 && (
                    <Badge variant="outline" className="text-yellow-600">
                      Inter: {stat.distribution.intermediario}
                    </Badge>
                  )}
                  {stat.distribution.iniciante > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      Iniciante: {stat.distribution.iniciante}
                    </Badge>
                  )}
                </div>

                {/* Botão de detalhes */}
                <div className="border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedArea(isExpanded ? null : stat.area)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Detalhes da Distribuição
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Seção expandida com detalhes */}
                {isExpanded && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/10 space-y-4">
                    <h5 className="font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Análise Detalhada - {stat.area}
                    </h5>

                    {/* Distribuição detalhada */}
                    <div>
                      <h6 className="font-medium mb-3 text-sm">Distribuição por Nível de Competência</h6>
                      <div className="space-y-2">
                        {[
                          { level: 5, label: 'Expert', count: stat.distribution.expert, color: 'text-green-700' },
                          { level: 4, label: 'Avançado', count: stat.distribution.avancado, color: 'text-green-600' },
                          { level: 3, label: 'Intermediário', count: stat.distribution.intermediario, color: 'text-yellow-600' },
                          { level: 2, label: 'Básico', count: stat.distribution.basico, color: 'text-orange-600' },
                          { level: 1, label: 'Iniciante', count: stat.distribution.iniciante, color: 'text-red-600' }
                        ].map(({ level, label, count, color }) => {
                          const percentage = stat.totalEvaluations > 0 ? (count / stat.totalEvaluations) * 100 : 0;
                          
                          return (
                            <div key={level} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= level 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className={`font-medium ${color}`}>{label}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {count} ({percentage.toFixed(0)}%)
                                </Badge>
                              </div>
                              <Progress value={percentage} className="h-1" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top 5 softwares da área */}
                    <div>
                      <h6 className="font-medium mb-2 text-sm flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        Top 5 Softwares da Área
                      </h6>
                      <div className="space-y-1">
                        {(() => {
                          const areaItems = data.filter(item => item.userArea === stat.area);
                          const softwareMap = new Map<string, number[]>();
                          
                          areaItems.forEach(item => {
                            if (!softwareMap.has(item.software)) {
                              softwareMap.set(item.software, []);
                            }
                            softwareMap.get(item.software)!.push(item.rating);
                          });

                          return Array.from(softwareMap.entries())
                            .map(([software, ratings]) => ({
                              software,
                              average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
                              count: ratings.length
                            }))
                            .sort((a, b) => b.average - a.average)
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div key={idx} className="text-sm flex items-center justify-between py-1 px-2 bg-background rounded">
                                <span>{item.software}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {item.average.toFixed(1)}/5
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.count} avaliações
                                  </Badge>
                                </div>
                              </div>
                            ));
                        })()}
                      </div>
                    </div>

                    {/* Estatísticas adicionais */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {stat.softwareCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Softwares avaliados
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {(stat.totalEvaluations / stat.totalUsers).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avaliações por usuário
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo global */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Global por Áreas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {areaStats[0]?.area || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                Área com melhor performance
              </div>
              {areaStats[0] && (
                <div className="text-lg font-semibold text-green-600">
                  {areaStats[0].average.toFixed(1)}/5
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {areaStats.reduce((sum, stat) => sum + stat.totalUsers, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de usuários avaliados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {areaStats.reduce((sum, stat) => sum + stat.totalEvaluations, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de avaliações
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};