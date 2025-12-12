import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePseudoCodigo } from './usePseudoCodigo';
import { QRCodeSVG } from 'qrcode.react';
import { Code, Users } from 'lucide-react';

export const PseudoCodigoHost = () => {
  const { submissions, isLoading } = usePseudoCodigo();
  const participantUrl = `${window.location.origin}/quiz/pseudo-codigo/play`;

  // Keywords to highlight
  const highlightKeywords = (text: string) => {
    const keywords = ['INÍCIO', 'FIM', 'SE', 'ENTÃO', 'SENÃO', 'FIM SE', 'ENQUANTO', 'FIM ENQUANTO', 'PARA', 'FIM PARA', 'REPITA', 'ATÉ'];
    let result = text;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(regex, `<span class="text-fuchsia-400 font-bold">${kw}</span>`);
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
          🧠 Mini Missão – Pseudo-código
        </h1>
        <p className="text-violet-300 text-lg">
          Transformando decisões em código estruturado
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* QR Code Section */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="bg-black/40 border-violet-500/30 backdrop-blur-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-300 text-center text-lg">
                Escaneie para participar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={participantUrl} size={160} />
              </div>
              <div className="text-center">
                <p className="text-violet-400 text-xs break-all">{participantUrl}</p>
              </div>
              <div className="flex items-center gap-2 bg-violet-600/30 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-violet-300" />
                <span className="text-2xl font-bold text-white">{submissions.length}</span>
                <span className="text-violet-300">grupos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Grid */}
        <div className="col-span-12 lg:col-span-9">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
          ) : submissions.length === 0 ? (
            <Card className="bg-black/40 border-violet-500/30 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Code className="w-16 h-16 text-violet-500/50 mb-4" />
                <p className="text-violet-300 text-xl">Aguardando submissões...</p>
                <p className="text-violet-400/60 text-sm mt-2">
                  Os pseudo-códigos aparecerão aqui em tempo real
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {submissions.map((sub, index) => (
                <Card 
                  key={sub.id} 
                  className="bg-black/40 border-violet-500/30 backdrop-blur-sm hover:border-violet-400/50 transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-violet-300 text-lg flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </span>
                        {sub.group_name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900/80 rounded-lg p-4 border border-violet-500/20 max-h-64 overflow-y-auto">
                      <pre 
                        className="font-mono text-sm text-violet-200 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: highlightKeywords(sub.pseudo_code) }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
