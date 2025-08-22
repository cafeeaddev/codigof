import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { getTimeDataReport, fixAllUserTimeData } from '@/utils/adminTimeUtils';

export const TimeDataManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalyzeTime = async () => {
    setIsLoading(true);
    try {
      const timeReport = await getTimeDataReport();
      setReport(timeReport);
      
      if (timeReport.usersWithProblems > 0) {
        toast({
          title: "Problemas Detectados",
          description: `${timeReport.usersWithProblems} usuários com dados de tempo suspeitos encontrados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tudo OK",
          description: "Nenhum problema de tempo detectado.",
        });
      }
    } catch (error) {
      console.error('Error analyzing time data:', error);
      toast({
        title: "Erro",
        description: "Erro ao analisar dados de tempo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixTimeData = async () => {
    setIsLoading(true);
    try {
      const result = await fixAllUserTimeData();
      
      if (result.errors.length > 0) {
        toast({
          title: "Correção Parcial",
          description: `${result.totalFixed} usuários corrigidos, ${result.errors.length} erros.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Correção Completa",
          description: `${result.totalFixed} usuários corrigidos com sucesso.`,
        });
      }
      
      // Refresh report
      handleAnalyzeTime();
    } catch (error) {
      console.error('Error fixing time data:', error);
      toast({
        title: "Erro",
        description: "Erro ao corrigir dados de tempo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Gerenciador de Dados de Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleAnalyzeTime}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Analisar Tempos
          </Button>
          
          {report?.usersWithProblems > 0 && (
            <Button
              onClick={handleFixTimeData}
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Corrigir Problemas
            </Button>
          )}
        </div>

        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Total: {report.totalUsers}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={report.usersWithProblems > 0 ? "destructive" : "secondary"}>
                Problemas: {report.usersWithProblems}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Tempo Médio: {Math.floor(report.averageTime / 60)}min
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Tempo Máximo: {Math.floor(report.maxTime / 60)}min
              </Badge>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Esta ferramenta analisa e corrige dados de tempo de jogo inconsistentes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Detecta tempos negativos ou excessivamente altos (mais de 2 horas)</li>
            <li>Corrige automaticamente dados corrompidos</li>
            <li>Reseta sessões para evitar acúmulo incorreto</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};