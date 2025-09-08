import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Activity, Database } from 'lucide-react';
import { scalabilityMonitor } from '@/utils/scalabilityMonitor';

export const ScalabilityDashboard = () => {
  const [status, setStatus] = useState({
    concurrentUsers: 0,
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    isOptimized: false,
    recommendations: [] as string[]
  });
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = scalabilityMonitor.getCurrentStatus();
      setStatus(currentStatus);
      setMetrics(scalabilityMonitor.getMetrics().slice(-10));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'critical': return 'CRÍTICO';
      case 'warning': return 'ALERTA';
      default: return 'SAUDÁVEL';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Escalabilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{status.concurrentUsers}</div>
                <div className="text-sm text-muted-foreground">Usuários Simultâneos</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <Badge variant={getStatusColor()}>
                  {getStatusText()}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Status do Sistema</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {status.isOptimized ? 'SIM' : 'NÃO'}
                </div>
                <div className="text-sm text-muted-foreground">Otimizado</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {status.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {status.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Limites de Capacidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Usuários Simultâneos</span>
                <span>{status.concurrentUsers}/300</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    status.concurrentUsers > 250 ? 'bg-destructive' :
                    status.concurrentUsers > 150 ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((status.concurrentUsers / 300) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">0-150</div>
                <div className="text-green-600">Operação Normal</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="font-medium text-amber-800">150-250</div>
                <div className="text-amber-600">Modo Alerta</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800">250+</div>
                <div className="text-red-600">Modo Crítico</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preparação para 891 Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>✅ Auto-save otimizado (5 min)</span>
              <Badge variant="default">Implementado</Badge>
            </div>
            <div className="flex justify-between">
              <span>✅ Renderização 3D reduzida (800 estrelas)</span>
              <Badge variant="default">Implementado</Badge>
            </div>
            <div className="flex justify-between">
              <span>✅ Throttling de conexões</span>
              <Badge variant="default">Implementado</Badge>
            </div>
            <div className="flex justify-between">
              <span>⚠️ Upgrade Supabase Pro necessário</span>
              <Badge variant="secondary">Recomendado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};