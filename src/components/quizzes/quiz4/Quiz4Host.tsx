import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { useQuiz4 } from './useQuiz4';
import { Lightbulb, Target, Wrench, Heart, Users, Layers } from 'lucide-react';

export const Quiz4Host = () => {
  const { submissions, uniqueGroupsCount, isLoading } = useQuiz4();
  
  const participantUrl = `${window.location.origin}/quiz/canvas`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <p className="text-2xl">Carregando canvas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Lightbulb className="w-16 h-16 text-yellow-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Canvas de Ideias
            </h1>
          </div>
          <p className="text-2xl text-gray-300">
            Estruturando soluções inovadoras
          </p>
        </div>

        {/* QR Code Highlight Section */}
        <Card className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-4 border-violet-400/50 rounded-3xl p-12 mb-8 shadow-2xl shadow-violet-500/30">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <QRCodeSVG
                value={participantUrl}
                size={280}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-4xl font-bold text-violet-400 mb-4 drop-shadow-[0_0_20px_rgba(167,139,250,0.8)]">
                🎨 Escaneie o QR Code
              </p>
              <p className="text-2xl text-gray-200 mb-2">
                Crie seu canvas colaborativo
              </p>
              <p className="text-xl text-gray-300">
                em 4 perguntas estruturadas
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#1a1a2e] border-2 border-violet-500/30 rounded-2xl p-8 text-center hover:border-violet-500/50 transition-colors shadow-lg shadow-violet-500/10">
            <Users className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <p className="text-5xl font-bold text-white mb-2">{uniqueGroupsCount}</p>
            <p className="text-xl text-gray-300">Grupos Únicos</p>
          </Card>

          <Card className="bg-[#1a1a2e] border-2 border-fuchsia-500/30 rounded-2xl p-8 text-center hover:border-fuchsia-500/50 transition-colors shadow-lg shadow-fuchsia-500/10">
            <Layers className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
            <p className="text-5xl font-bold text-white mb-2">{submissions.length}</p>
            <p className="text-xl text-gray-300">Canvas Criados</p>
          </Card>
        </div>

        {/* Canvas Grid */}
        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {submissions.map((submission, index) => (
              <Card 
                key={submission.id}
                className="bg-[#1a1a2e] border-2 border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20"
                style={{
                  animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s both`
                }}
              >
                {/* Header do Canvas */}
                <div className="mb-6 pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-violet-400" />
                    <h3 className="text-2xl font-bold text-white">
                      {submission.group_name}
                    </h3>
                  </div>
                  {submission.group_members && (
                    <p className="text-sm text-gray-400 ml-9">
                      {submission.group_members}
                    </p>
                  )}
                </div>

                {/* Perguntas do Canvas */}
                <div className="space-y-4">
                  {/* Problema */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-400 mb-1">
                          Qual é o problema?
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {submission.problem}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Solução */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-400 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-400 mb-1">
                          Qual é a solução?
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {submission.solution}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tecnologia */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-400 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-400 mb-1">
                          Que tecnologia apoia?
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {submission.technology}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Impacto Humano */}
                  <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-l-4 border-pink-400 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-pink-400 mb-1">
                          Que impacto humano gera?
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {submission.human_impact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-right">
                    {new Date(submission.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1a1a2e] border-2 border-gray-700 rounded-2xl p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-2xl text-gray-400">
              Aguardando os primeiros canvas...
            </p>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
