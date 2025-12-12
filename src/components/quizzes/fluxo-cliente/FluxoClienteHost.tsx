import { QRCodeSVG } from 'qrcode.react';
import { useFluxoCliente, FlowElement, FlowchartData } from './useFluxoCliente';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, Play, Square, Diamond, RotateCcw, ArrowDown, ArrowRight } from 'lucide-react';

export const FluxoClienteHost = () => {
  const { submissions, totalGroups, isLoading } = useFluxoCliente();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const participantUrl = `${window.location.origin}/quiz/fluxo-cliente`;

  useEffect(() => {
    if (submissions.length > 0 && !selectedGroup) {
      setSelectedGroup(submissions[0].id);
    }
  }, [submissions, selectedGroup]);

  const selectedSubmission = submissions.find(s => s.id === selectedGroup);

  const selectRandomGroup = () => {
    if (submissions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * submissions.length);
    setSelectedGroup(submissions[randomIndex].id);
  };

  const renderFlowchartElement = (element: FlowElement, index: number) => {
    switch (element.type) {
      case 'start':
        return (
          <div key={element.id} className="flex flex-col items-center">
            <div className="bg-green-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-green-500/30">
              <Play className="w-4 h-4" />
              INÍCIO
            </div>
            <ArrowDown className="w-5 h-5 text-blue-400 my-2" />
          </div>
        );

      case 'step':
        return (
          <div key={element.id} className="flex flex-col items-center">
            <div className="bg-cyan-900/80 border-2 border-cyan-400 text-cyan-100 px-6 py-3 rounded-lg max-w-md text-center shadow-lg shadow-cyan-500/20">
              <span className="text-cyan-400 text-xs font-bold block mb-1">PASSO {index}</span>
              {element.text || '(vazio)'}
            </div>
            <ArrowDown className="w-5 h-5 text-blue-400 my-2" />
          </div>
        );

      case 'decision':
        return (
          <div key={element.id} className="flex flex-col items-center">
            <div className="relative">
              <div className="bg-yellow-900/80 border-2 border-yellow-400 text-yellow-100 px-6 py-4 transform rotate-0 max-w-md text-center shadow-lg shadow-yellow-500/20"
                   style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-yellow-100 text-sm font-medium px-8">
                {element.text || '?'}
              </div>
            </div>
            <div className="flex items-center gap-8 mt-2">
              <div className="flex items-center text-green-400 text-sm">
                <span className="font-bold">SIM</span>
                <ArrowDown className="w-4 h-4 ml-1" />
              </div>
              {element.noTarget && (
                <div className="flex items-center text-red-400 text-sm">
                  <span className="font-bold">NÃO</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                  <span className="ml-2 text-red-300 text-xs bg-red-900/50 px-2 py-1 rounded">
                    {element.noTarget}
                  </span>
                </div>
              )}
            </div>
            <ArrowDown className="w-5 h-5 text-blue-400 my-2" />
          </div>
        );

      case 'loop':
        return (
          <div key={element.id} className="flex flex-col items-center">
            <div className="bg-purple-900/80 border-2 border-purple-400 text-purple-100 px-6 py-3 rounded-lg max-w-md text-center shadow-lg shadow-purple-500/20">
              <span className="text-purple-400 text-xs font-bold flex items-center justify-center gap-1 mb-1">
                <RotateCcw className="w-3 h-3" /> LOOP
              </span>
              {element.text || '(vazio)'}
              {element.loopTarget && (
                <div className="text-xs text-purple-300 mt-2 border-t border-purple-500/30 pt-2">
                  ↩️ Volta para: {element.loopTarget}
                </div>
              )}
            </div>
            <ArrowDown className="w-5 h-5 text-blue-400 my-2" />
          </div>
        );

      case 'end':
        return (
          <div key={element.id} className="flex flex-col items-center">
            <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-500/30">
              <Square className="w-4 h-4" />
              FIM
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 flex items-center justify-center">
        <div className="text-blue-300 text-2xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent mb-2">
          Mapeamento de Processos
        </h1>
        <p className="text-blue-200 text-xl mb-4">
          Visualização dos fluxogramas enviados
        </p>
        
        {submissions.length > 0 && (
          <Button
            onClick={selectRandomGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Sortear Grupo
          </Button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* QR Code Panel */}
        <div className="col-span-3">
          <Card className="bg-blue-950/50 border-blue-500/30 p-6 text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG value={participantUrl} size={180} />
            </div>
            <p className="text-blue-200 text-sm mb-2">Escaneie para participar</p>
            <div className="bg-blue-900/50 rounded-lg p-3 border border-blue-500/30">
              <p className="text-3xl font-bold text-blue-100">{totalGroups}</p>
              <p className="text-blue-300 text-sm">grupos participando</p>
            </div>
          </Card>

          {/* Group List */}
          {submissions.length > 0 && (
            <Card className="bg-blue-950/50 border-blue-500/30 p-4 mt-4">
              <h3 className="text-blue-200 font-semibold mb-3">Grupos:</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {submissions.map((sub) => {
                  const elements = sub.flowchart_data.elements || [];
                  const stepCount = elements.filter(e => e.type === 'step').length;
                  const decisionCount = elements.filter(e => e.type === 'decision').length;
                  const loopCount = elements.filter(e => e.type === 'loop').length;
                  
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedGroup(sub.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedGroup === sub.id
                          ? 'bg-blue-500/30 border border-blue-400'
                          : 'bg-slate-900/50 border border-transparent hover:bg-blue-900/30'
                      }`}
                    >
                      <p className="text-blue-100 font-medium truncate">{sub.group_name}</p>
                      {sub.flowchart_data.flowName && (
                        <p className="text-cyan-300 text-sm truncate">📋 {sub.flowchart_data.flowName}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-cyan-400">{stepCount}P</span>
                        <span className="text-xs text-yellow-400">{decisionCount}D</span>
                        <span className="text-xs text-purple-400">{loopCount}L</span>
                      </div>
                      <p className="text-blue-400 text-xs mt-1">
                        {new Date(sub.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content - Flowchart Display */}
        <div className="col-span-9">
          {selectedSubmission ? (
            <Card className="bg-blue-950/50 border-blue-500/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  {selectedSubmission.flowchart_data.flowName && (
                    <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-3 mb-1">
                      <span>📋</span>
                      {selectedSubmission.flowchart_data.flowName}
                    </h2>
                  )}
                  <p className="text-blue-100 text-xl flex items-center gap-2">
                    <span>👥</span>
                    {selectedSubmission.group_name}
                  </p>
                  {selectedSubmission.group_members && (
                    <p className="text-blue-300 text-sm mt-1">
                      {selectedSubmission.group_members}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="bg-cyan-900/50 px-3 py-1 rounded text-cyan-200">
                    {selectedSubmission.flowchart_data.elements.filter(e => e.type === 'step').length} passos
                  </span>
                  <span className="bg-yellow-900/50 px-3 py-1 rounded text-yellow-200">
                    {selectedSubmission.flowchart_data.elements.filter(e => e.type === 'decision').length} decisões
                  </span>
                  <span className="bg-purple-900/50 px-3 py-1 rounded text-purple-200">
                    {selectedSubmission.flowchart_data.elements.filter(e => e.type === 'loop').length} loops
                  </span>
                </div>
              </div>

              {/* Flowchart Visualization */}
              <div className="flex flex-col items-center py-8 overflow-y-auto max-h-[600px]">
                {selectedSubmission.flowchart_data.elements.map((element, index) => {
                  // Calculate step number for display
                  let stepIndex = 0;
                  for (let i = 0; i <= index; i++) {
                    if (selectedSubmission.flowchart_data.elements[i].type === 'step') {
                      stepIndex++;
                    }
                  }
                  return renderFlowchartElement(element, element.type === 'step' ? stepIndex : index);
                })}
              </div>
            </Card>
          ) : (
            <Card className="bg-blue-950/50 border-blue-500/30 p-12 text-center">
              <div className="text-8xl mb-6">📊</div>
              <h2 className="text-3xl font-bold text-blue-100 mb-4">
                Aguardando Fluxogramas...
              </h2>
              <p className="text-blue-200 text-lg">
                Os grupos estão criando seus fluxogramas!
              </p>
              <div className="mt-8 flex justify-center gap-4 text-4xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>📈</span>
                <span className="animate-bounce" style={{ animationDelay: '100ms' }}>📊</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>📉</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
