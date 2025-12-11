import { QRCodeSVG } from 'qrcode.react';
import { useFritarOvo } from './useFritarOvo';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export const FritarOvoHost = () => {
  const { submissions, totalGroups, isLoading } = useFritarOvo();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const participantUrl = `${window.location.origin}/quiz/fritar-ovo`;

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
        <p className="text-orange-200 text-xl">
          Instruções para um robô que nunca viu uma cozinha
        </p>
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

          {/* Group List */}
          {submissions.length > 0 && (
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
          {selectedSubmission ? (
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
