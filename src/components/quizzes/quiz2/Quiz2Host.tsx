import { WordCloud } from './WordCloud';
import { useQuiz2 } from './useQuiz2';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Cloud, Users, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const Quiz2Host = () => {
  const { wordCloudData, uniqueGroupsCount, uniqueWordsCount, isLoading } = useQuiz2();
  const participantUrl = `${window.location.origin}/quiz/nuvem-tags`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Cloud className="w-16 h-16 text-cyan-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
              NUVEM DE DESAFIOS
            </h1>
            <Cloud className="w-16 h-16 text-cyan-400" />
          </div>
          <p className="text-2xl text-gray-300">
            Qual o maior desafio do seu cotidiano?
          </p>
        </div>

        {/* Word Cloud Card */}
        <Card className="bg-[#1a1a2e] border-2 border-blue-500/30 rounded-3xl p-12 mb-8 shadow-lg shadow-blue-500/10">
          <WordCloud data={wordCloudData} />
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Card */}
          <Card className="bg-[#1a1a2e] border-2 border-cyan-500/30 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition-colors shadow-lg shadow-cyan-500/10">
            <div className="bg-white p-6 rounded-xl mb-4 mx-auto w-fit">
              <QRCodeSVG
                value={participantUrl}
                size={150}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xl font-semibold text-cyan-400">
              Escaneie para contribuir
            </p>
          </Card>

          {/* Groups Card */}
          <Card className="bg-[#1a1a2e] border-2 border-fuchsia-500/30 rounded-2xl p-8 text-center hover:border-fuchsia-500/50 transition-colors shadow-lg shadow-fuchsia-500/10">
            <Users className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
            <div className="text-6xl font-bold text-fuchsia-400 mb-2">
              {uniqueGroupsCount}
            </div>
            <p className="text-xl text-gray-300">
              Grupos
            </p>
          </Card>

          {/* Unique Words Card */}
          <Card className="bg-[#1a1a2e] border-2 border-blue-500/30 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors shadow-lg shadow-blue-500/10">
            <Hash className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <div className="text-6xl font-bold text-blue-400 mb-2">
              {uniqueWordsCount}
            </div>
            <p className="text-xl text-gray-300">
              Palavras Únicas
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
