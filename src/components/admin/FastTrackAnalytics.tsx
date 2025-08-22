import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TrendingUp, Users, Clock, Target, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FastTrackResponse {
  id: string;
  user_id: string;
  accepted_terms: boolean;
  interest_level: string;
  time_commitment: string;
  main_objective: string;
  other_objective: string;
  created_at: string;
}

interface AnalyticsData {
  totalResponses: number;
  acceptedTerms: number;
  interestDistribution: Record<string, number>;
  timeCommitmentDistribution: Record<string, number>;
  objectiveDistribution: Record<string, number>;
}

const FastTrackAnalytics: React.FC = () => {
  const [responses, setResponses] = useState<FastTrackResponse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fast_track_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
      calculateAnalytics(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do Fast Track",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (data: FastTrackResponse[]) => {
    const totalResponses = data.length;
    const acceptedTerms = data.filter(r => r.accepted_terms).length;

    const interestDistribution: Record<string, number> = {};
    const timeCommitmentDistribution: Record<string, number> = {};
    const objectiveDistribution: Record<string, number> = {};

    data.forEach(response => {
      // Interest distribution
      if (response.interest_level) {
        interestDistribution[response.interest_level] = 
          (interestDistribution[response.interest_level] || 0) + 1;
      }

      // Time commitment distribution
      if (response.time_commitment) {
        timeCommitmentDistribution[response.time_commitment] = 
          (timeCommitmentDistribution[response.time_commitment] || 0) + 1;
      }

      // Objective distribution
      if (response.main_objective) {
        objectiveDistribution[response.main_objective] = 
          (objectiveDistribution[response.main_objective] || 0) + 1;
      }
    });

    setAnalytics({
      totalResponses,
      acceptedTerms,
      interestDistribution,
      timeCommitmentDistribution,
      objectiveDistribution
    });
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const csvData = responses.map(response => ({
        'User ID': response.user_id,
        'Termos Aceitos': response.accepted_terms ? 'Sim' : 'Não',
        'Nível de Interesse': getInterestLabel(response.interest_level),
        'Tempo Disponível': getTimeCommitmentLabel(response.time_commitment),
        'Objetivo Principal': getObjectiveLabel(response.main_objective),
        'Outro Objetivo': response.other_objective || 'N/A',
        'Data de Resposta': new Date(response.created_at).toLocaleDateString('pt-BR')
      }));

      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fast-track-responses-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getInterestLabel = (value: string) => {
    const labels: Record<string, string> = {
      'muito-interessado': 'Muito interessado(a)',
      'interessado-sem-tempo': 'Interessado(a) mas sem tempo',
      'sem-interesse': 'Sem interesse'
    };
    return labels[value] || value;
  };

  const getTimeCommitmentLabel = (value: string) => {
    const labels: Record<string, string> = {
      'menos-1h': 'Menos de 1 hora',
      '1-2h': '1 a 2 horas',
      '3-4h': '3 a 4 horas',
      'mais-4h': 'Mais de 4 horas'
    };
    return labels[value] || value;
  };

  const getObjectiveLabel = (value: string) => {
    const labels: Record<string, string> = {
      'habilidades-tecnicas': 'Melhorar habilidades técnicas',
      'acelerar-carreira': 'Acelerar carreira na empresa',
      'inovacao-trabalho': 'Aplicar inovação no trabalho',
      'novas-ferramentas': 'Conhecer novas ferramentas',
      'outro': 'Outro'
    };
    return labels[value] || value;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Analytics do Fast Track</h3>
            <p className="text-sm text-muted-foreground">
              Análise das respostas e interesse no programa
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportData} disabled={isExporting} size="sm">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
                <p className="text-sm text-muted-foreground">Total de Respostas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.acceptedTerms}</p>
                <p className="text-sm text-muted-foreground">Termos Aceitos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {analytics.totalResponses > 0 
                    ? Math.round((analytics.acceptedTerms / analytics.totalResponses) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="responses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="analytics">Distribuições</TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <Card>
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Usuário {response.user_id.slice(0, 8)}</h4>
                          <Badge variant={response.accepted_terms ? "default" : "destructive"}>
                            {response.accepted_terms ? 'Aceitou' : 'Recusou'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>User ID:</strong> {response.user_id}</p>
                          </div>
                          <div>
                            <p><strong>Interesse:</strong> {getInterestLabel(response.interest_level)}</p>
                            <p><strong>Tempo:</strong> {getTimeCommitmentLabel(response.time_commitment)}</p>
                            <p><strong>Objetivo:</strong> {getObjectiveLabel(response.main_objective)}</p>
                          </div>
                        </div>
                        {response.other_objective && (
                          <p className="text-sm"><strong>Outro objetivo:</strong> {response.other_objective}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(response.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Nível de Interesse</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.interestDistribution).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm">{getInterestLabel(key)}</span>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Tempo Disponível</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.timeCommitmentDistribution).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm">{getTimeCommitmentLabel(key)}</span>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Objetivo Principal</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.objectiveDistribution).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm">{getObjectiveLabel(key)}</span>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FastTrackAnalytics;