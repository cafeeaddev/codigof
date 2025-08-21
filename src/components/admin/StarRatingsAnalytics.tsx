import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CompetencyHeatMap } from "./CompetencyHeatMap";
import { SoftwareCompetencyChart } from "./SoftwareCompetencyChart";
import { AreaCompetencyCards } from "./AreaCompetencyCards";

interface StarRatingsAnalyticsProps {
  responses: any[];
  questions: any[];
  profiles: any[];
}

export const StarRatingsAnalytics = ({ responses, questions, profiles }: StarRatingsAnalyticsProps) => {
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedSoftware, setSelectedSoftware] = useState<string>("all");

  const competencyData = useMemo(() => {
    console.log('Processing competency data...');
    console.log('Responses:', responses);
    console.log('Profiles:', profiles);
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('No responses data available');
      return [];
    }

    const data = responses.flatMap(response => {
      if (!response.respostas?.starRatings) {
        console.log('No starRatings for response:', response.nome);
        return [];
      }

      const starRatings = response.respostas.starRatings;
      const userProfile = profiles.find(p => p.email === response.email);
      
      // Processar star ratings aninhados por pergunta
      const ratings = [];
      Object.values(starRatings).forEach((questionRatings: any) => {
        if (typeof questionRatings === 'object') {
          Object.entries(questionRatings).forEach(([software, rating]) => {
            ratings.push({
              userId: response.user_id,
              userName: response.nome,
              userEmail: response.email,
              userArea: userProfile?.area || 'Não informado',
              software: software,
              rating: Number(rating),
              ratingLabel: getRatingLabel(Number(rating))
            });
          });
        }
      });

      return ratings;
    });

    console.log('Processed competency data:', data);
    return data;
  }, [responses, questions, profiles]);

  const softwareList = useMemo(() => {
    const softwares = new Set(competencyData.map(item => item.software));
    return Array.from(softwares).sort();
  }, [competencyData]);

  const areaList = useMemo(() => {
    const areas = new Set(competencyData.map(item => item.userArea));
    return Array.from(areas).sort();
  }, [competencyData]);

  const filteredData = useMemo(() => {
    return competencyData.filter(item => {
      const areaMatch = selectedArea === "all" || item.userArea === selectedArea;
      const softwareMatch = selectedSoftware === "all" || item.software === selectedSoftware;
      return areaMatch && softwareMatch;
    });
  }, [competencyData, selectedArea, selectedSoftware]);

  const overallStats = useMemo(() => {
    if (filteredData.length === 0) return { average: 0, total: 0, distribution: {} };

    const total = filteredData.length;
    const sum = filteredData.reduce((acc, item) => acc + (item.rating || 0), 0);
    const average = total > 0 ? sum / total : 0;

    const distribution = filteredData.reduce((acc, item) => {
      const label = item.ratingLabel;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Overall stats:', { average, total, distribution });
    return { average, total, distribution };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Competências Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Área</label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {areaList.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Software</label>
            <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um software" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os softwares</SelectItem>
                {softwareList.map(software => (
                  <SelectItem key={software} value={software}>{software}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{overallStats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Avaliações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{overallStats.average.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Média Geral</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{softwareList.length}</div>
            <div className="text-sm text-muted-foreground">Softwares Avaliados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{areaList.length}</div>
            <div className="text-sm text-muted-foreground">Áreas Representadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Competências */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Competências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
             {Object.entries(overallStats.distribution).map(([level, count]) => (
               <Badge key={level} variant="outline" className="text-sm">
                 {level}: {Number(count)} ({overallStats.total > 0 ? ((Number(count) / overallStats.total) * 100).toFixed(1) : 0}%)
               </Badge>
             ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Visualizações */}
      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
          <TabsTrigger value="software">Por Software</TabsTrigger>
          <TabsTrigger value="areas">Por Área</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heatmap" className="space-y-4">
          <CompetencyHeatMap data={filteredData} />
        </TabsContent>
        
        <TabsContent value="software" className="space-y-4">
          <SoftwareCompetencyChart data={filteredData} />
        </TabsContent>
        
        <TabsContent value="areas" className="space-y-4">
          <AreaCompetencyCards data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function getRatingLabel(rating: number): string {
  if (rating <= 1) return "Iniciante";
  if (rating <= 2) return "Básico";
  if (rating <= 3) return "Intermediário";
  if (rating <= 4) return "Avançado";
  return "Expert";
}