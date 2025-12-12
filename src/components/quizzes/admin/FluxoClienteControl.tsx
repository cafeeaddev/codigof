import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Users, Download, Eye, Play, Square, Diamond, RotateCcw, ArrowDown } from 'lucide-react';
import { useFluxoCliente, FluxoClienteSubmission, FlowElement, FlowchartData } from '../fluxo-cliente/useFluxoCliente';
import { toast } from 'sonner';

export const FluxoClienteControl = () => {
  const { submissions, totalGroups } = useFluxoCliente();
  const [selectedFlowchart, setSelectedFlowchart] = useState<FluxoClienteSubmission | null>(null);

  const openProjectionScreen = () => {
    window.open('/quiz/fluxo-cliente/screen', '_blank');
  };

  const getElementCounts = (data: FlowchartData) => {
    const elements = data.elements || [];
    return {
      steps: elements.filter(e => e.type === 'step').length,
      decisions: elements.filter(e => e.type === 'decision').length,
      loops: elements.filter(e => e.type === 'loop').length
    };
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast.error('Não há fluxogramas para exportar');
      return;
    }

    const headers = [
      'Nome do Fluxo',
      'Nome do Grupo',
      'Integrantes',
      'Qtd Passos',
      'Qtd Decisões',
      'Qtd Loops',
      'Dados do Fluxograma (JSON)',
      'Data/Hora'
    ];
    
    const rows = submissions.map(sub => {
      const counts = getElementCounts(sub.flowchart_data);
      return [
        sub.flowchart_data.flowName || '',
        sub.group_name,
        sub.group_members || '',
        counts.steps.toString(),
        counts.decisions.toString(),
        counts.loops.toString(),
        JSON.stringify(sub.flowchart_data),
        new Date(sub.created_at).toLocaleString('pt-BR')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fluxo_cliente_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Fluxogramas exportados com sucesso!');
  };

  const renderMiniFlowchart = (data: FlowchartData) => {
    const elements = data.elements || [];
    return (
      <div className="flex flex-col items-center gap-1 py-4">
        {elements.map((element, idx) => {
          if (element.type === 'start') {
            return (
              <div key={element.id} className="flex flex-col items-center">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  INÍCIO
                </div>
                <ArrowDown className="w-3 h-3 text-blue-400 my-1" />
              </div>
            );
          }
          if (element.type === 'step') {
            return (
              <div key={element.id} className="flex flex-col items-center">
                <div className="bg-cyan-900/80 border border-cyan-400 text-cyan-100 px-3 py-2 rounded text-xs max-w-[250px] text-center">
                  {element.text || '(vazio)'}
                </div>
                <ArrowDown className="w-3 h-3 text-blue-400 my-1" />
              </div>
            );
          }
          if (element.type === 'decision') {
            return (
              <div key={element.id} className="flex flex-col items-center">
                <div className="bg-yellow-900/80 border border-yellow-400 text-yellow-100 px-3 py-2 rounded text-xs max-w-[250px] text-center">
                  <Diamond className="w-3 h-3 inline mr-1" />
                  {element.text || '?'}
                </div>
                <ArrowDown className="w-3 h-3 text-blue-400 my-1" />
              </div>
            );
          }
          if (element.type === 'loop') {
            return (
              <div key={element.id} className="flex flex-col items-center">
                <div className="bg-purple-900/80 border border-purple-400 text-purple-100 px-3 py-2 rounded text-xs max-w-[250px] text-center">
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  {element.text || '(loop)'}
                </div>
                <ArrowDown className="w-3 h-3 text-blue-400 my-1" />
              </div>
            );
          }
          if (element.type === 'end') {
            return (
              <div key={element.id} className="flex flex-col items-center">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  FIM
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Fluxo do Cliente
          </CardTitle>
          <CardDescription>
            Atividade de mapeamento de processos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={openProjectionScreen}
              className="flex-1"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Abrir Tela de Projeção
            </Button>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <Download className="mr-2 h-5 w-5" />
              Baixar Fluxogramas
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-3xl font-bold">{totalGroups}</p>
                    <p className="text-sm text-muted-foreground">Grupos Participantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {submissions.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Todos os Fluxogramas ({submissions.length}):
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.map((sub) => {
                  const counts = getElementCounts(sub.flowchart_data);
                  return (
                    <Card 
                      key={sub.id} 
                      className="bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => setSelectedFlowchart(sub)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {sub.flowchart_data.flowName && (
                              <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                                📋 {sub.flowchart_data.flowName}
                              </p>
                            )}
                            <p className={sub.flowchart_data.flowName ? "text-sm text-muted-foreground" : "font-semibold"}>
                              👥 {sub.group_name}
                            </p>
                            {sub.group_members && (
                              <p className="text-xs text-muted-foreground truncate max-w-md">
                                {sub.group_members}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                              {counts.steps}P
                            </span>
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              {counts.decisions}D
                            </span>
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              {counts.loops}L
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sub.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalhes do fluxograma */}
      <Dialog open={!!selectedFlowchart} onOpenChange={(open) => !open && setSelectedFlowchart(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-1">
              {selectedFlowchart?.flowchart_data.flowName && (
                <span className="text-cyan-600 dark:text-cyan-400">
                  📋 {selectedFlowchart.flowchart_data.flowName}
                </span>
              )}
              <span className="text-base font-normal text-muted-foreground">
                👥 {selectedFlowchart?.group_name}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFlowchart && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground border-b pb-3">
                <span>📅 {new Date(selectedFlowchart.created_at).toLocaleString('pt-BR')}</span>
                <div className="flex gap-2">
                  <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    {getElementCounts(selectedFlowchart.flowchart_data).steps} passos
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    {getElementCounts(selectedFlowchart.flowchart_data).decisions} decisões
                  </span>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                    {getElementCounts(selectedFlowchart.flowchart_data).loops} loops
                  </span>
                </div>
              </div>
              
              {selectedFlowchart.group_members && (
                <p className="text-sm text-muted-foreground">
                  👥 Integrantes: {selectedFlowchart.group_members}
                </p>
              )}

              {/* Mini flowchart visualization */}
              <div className="bg-slate-900/50 rounded-lg p-4 border">
                {renderMiniFlowchart(selectedFlowchart.flowchart_data)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
