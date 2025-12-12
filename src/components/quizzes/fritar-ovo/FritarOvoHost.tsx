import { QRCodeSVG } from 'qrcode.react';
import { useFritarOvo } from './useFritarOvo';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText } from 'lucide-react';

const REFERENCE_STEPS = [
  { concept: "Pegar frigideira", keywords: ["frigideira", "panela"], emoji: "🍳" },
  { concept: "Colocar no fogão", keywords: ["fogão", "fogao", "queimador", "boca"], emoji: "🔥" },
  { concept: "Verificar gás", keywords: ["gás", "gaz", "verificar"], emoji: "⛽" },
  { concept: "Ligar o fogo", keywords: ["ligar", "acender", "chama", "fogo"], emoji: "🔥" },
  { concept: "Colocar óleo/manteiga", keywords: ["óleo", "oleo", "manteiga", "azeite", "gordura"], emoji: "🧈" },
  { concept: "Aquecer/esperar", keywords: ["aquecer", "esquentar", "esperar"], emoji: "⏳" },
  { concept: "Pegar o ovo", keywords: ["pegar ovo", "pegue o ovo", "ovo da"], emoji: "🥚" },
  { concept: "Quebrar o ovo", keywords: ["quebrar", "abrir", "casca", "borda"], emoji: "💥" },
  { concept: "Esperar clara cozinhar", keywords: ["clara", "branca", "firme", "cozinhar"], emoji: "⏱️" },
  { concept: "Preferência da gema", keywords: ["gema", "mole", "dura", "ponto"], emoji: "🍳" },
  { concept: "Desligar o fogo", keywords: ["desligar", "apagar"], emoji: "🔌" },
  { concept: "Pegar prato/espátula", keywords: ["prato", "espátula", "espatula", "utensilios"], emoji: "🍽️" },
  { concept: "Servir no prato", keywords: ["tirar", "colocar no prato", "servir", "retirar"], emoji: "✅" }
];

export const FritarOvoHost = () => {
  const { submissions, totalGroups, isLoading } = useFritarOvo();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const participantUrl = `${window.location.origin}/quiz/fritar-ovo`;

  const analysis = useMemo(() => {
    if (submissions.length === 0) return [];
    
    return REFERENCE_STEPS.map(step => {
      const matchCount = submissions.filter(sub => {
        const allText = [
          sub.step_1, sub.step_2, sub.step_3, sub.step_4, sub.step_5,
          sub.step_6, sub.step_7, sub.step_8, sub.step_9, sub.step_10,
          sub.step_11, sub.step_12, sub.step_13, sub.step_14, sub.step_15
        ].join(' ').toLowerCase();
        
        return step.keywords.some(kw => allText.includes(kw.toLowerCase()));
      }).length;
      
      return {
        ...step,
        matchCount,
        percentage: Math.round((matchCount / submissions.length) * 100)
      };
    });
  }, [submissions]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500/20';
    if (percentage >= 40) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  // Auto-select the latest submission
  useEffect(() => {
    if (submissions.length > 0 && !selectedGroup) {
      setSelectedGroup(submissions[0].id);
    }
  }, [submissions, selectedGroup]);

  const selectedSubmission = submissions.find(s => s.id === selectedGroup);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/50 to-slate-900 flex items-center justify-center">
        <div className="text-orange-300 text-2xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/50 to-slate-900 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🍳</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent mb-2">
          Missão: Fritar um OVO
        </h1>
        <p className="text-orange-200 text-xl mb-4">
          Instruções para um robô que nunca viu uma cozinha
        </p>
        
        {/* Toggle Button */}
        {submissions.length > 0 && (
          <Button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {showAnalysis ? (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Ver Receitas
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 mr-2" />
                Ver Análise
              </>
            )}
          </Button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* QR Code Panel */}
        <div className="col-span-3">
          <Card className="bg-orange-950/50 border-orange-500/30 p-6 text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG value={participantUrl} size={180} />
            </div>
            <p className="text-orange-200 text-sm mb-2">Escaneie para participar</p>
            <div className="bg-orange-900/50 rounded-lg p-3 border border-orange-500/30">
              <p className="text-3xl font-bold text-orange-100">{totalGroups}</p>
              <p className="text-orange-300 text-sm">grupos participando</p>
            </div>
          </Card>

          {/* Group List - only show when not in analysis mode */}
          {!showAnalysis && submissions.length > 0 && (
            <Card className="bg-orange-950/50 border-orange-500/30 p-4 mt-4">
              <h3 className="text-orange-200 font-semibold mb-3">Grupos:</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedGroup(sub.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedGroup === sub.id
                        ? 'bg-orange-500/30 border border-orange-400'
                        : 'bg-slate-900/50 border border-transparent hover:bg-orange-900/30'
                    }`}
                  >
                    <p className="text-orange-100 font-medium truncate">{sub.group_name}</p>
                    <p className="text-orange-400 text-xs">
                      {new Date(sub.created_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {showAnalysis ? (
            /* Analysis View */
            <Card className="bg-orange-950/50 border-orange-500/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-orange-100 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" />
                    Análise das Receitas
                  </h2>
                  <p className="text-orange-300">{submissions.length} grupos analisados</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {analysis.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${getProgressBgColor(item.percentage)} border border-orange-500/20 rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-orange-100 font-medium">{item.concept}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-200 text-sm">
                          {item.matchCount}/{submissions.length}
                        </span>
                        <span className={`font-bold text-lg ${
                          item.percentage >= 70 ? 'text-green-400' :
                          item.percentage >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {item.percentage}%
                        </span>
                        {item.percentage < 40 && <span className="text-red-400">⚠️</span>}
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-3">
                      <div
                        className={`${getProgressColor(item.percentage)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Points of attention */}
              {analysis.filter(a => a.percentage < 50).length > 0 && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <h3 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                    ⚠️ Pontos para Discussão
                  </h3>
                  <p className="text-red-200 text-sm">
                    Passos que menos de 50% dos grupos mencionaram:{' '}
                    {analysis.filter(a => a.percentage < 50).map(a => a.concept).join(', ')}
                  </p>
                </div>
              )}
            </Card>
          ) : selectedSubmission ? (
            /* Recipe View */
            <Card className="bg-orange-950/50 border-orange-500/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-orange-100 flex items-center gap-3">
                    <span>🤖</span>
                    {selectedSubmission.group_name}
                  </h2>
                  <p className="text-orange-300">Receita para o robô:</p>
                </div>
                <div className="text-6xl">🍳</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 15 }, (_, i) => {
                  const stepKey = `step_${i + 1}` as keyof typeof selectedSubmission;
                  const stepValue = selectedSubmission[stepKey] as string;
                  return (
                    <div
                      key={i}
                      className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4 hover:border-orange-400/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-orange-400 font-bold text-xl w-8">
                          {i + 1}.
                        </span>
                        <p className="text-orange-100 text-sm leading-relaxed flex-1">
                          {stepValue}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="bg-orange-950/50 border-orange-500/30 p-12 text-center">
              <div className="text-8xl mb-6">🤖</div>
              <h2 className="text-3xl font-bold text-orange-100 mb-4">
                Aguardando Receitas...
              </h2>
              <p className="text-orange-200 text-lg">
                Os grupos estão preparando instruções para o robô fritar um ovo!
              </p>
              <div className="mt-8 flex justify-center gap-4 text-4xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🥚</span>
                <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🍳</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🤖</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
