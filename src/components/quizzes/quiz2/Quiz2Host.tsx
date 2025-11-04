import { WordCloud } from './WordCloud';
import { useQuiz2 } from './useQuiz2';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';

export const Quiz2Host = () => {
  const { wordCloudData, uniqueGroupsCount, uniqueWordsCount, isLoading } = useQuiz2();
  const participantUrl = `${window.location.origin}/quiz/nuvem-tags`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            ☁️ NUVEM DE DESAFIOS ☁️
          </h1>
          <p className="text-3xl text-white/90">
            Qual o maior desafio do seu cotidiano?
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 mb-8">
          <WordCloud data={wordCloudData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="bg-white p-6 rounded-xl mb-4 mx-auto w-fit">
              <QRCodeSVG
                value={participantUrl}
                size={150}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xl font-semibold">
              Escaneie para contribuir
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="text-6xl font-bold mb-2">
              {uniqueGroupsCount}
            </div>
            <p className="text-2xl">
              Grupos
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="text-6xl font-bold mb-2">
              {uniqueWordsCount}
            </div>
            <p className="text-2xl">
              Palavras Únicas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
