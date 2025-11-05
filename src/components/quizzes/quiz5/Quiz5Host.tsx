import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuiz5 } from './useQuiz5';

interface PostitCardProps {
  text: string;
  initials: string;
  color: 'sky' | 'green' | 'yellow';
  index: number;
}

const PostitCard = ({ text, initials, color, index }: PostitCardProps) => {
  const colorClasses = {
    sky: 'bg-sky-400/20 border-sky-400 text-sky-100',
    green: 'bg-green-400/20 border-green-400 text-green-100',
    yellow: 'bg-yellow-400/20 border-yellow-400 text-yellow-100'
  };

  const initialsColorClasses = {
    sky: 'text-sky-300',
    green: 'text-green-300',
    yellow: 'text-yellow-300'
  };

  return (
    <div 
      className={`
        ${colorClasses[color]}
        border-2 
        rounded-lg 
        p-4 
        shadow-lg 
        relative
        hover:scale-105
        transition-all
        duration-200
        animate-in
        fade-in
        slide-in-from-top-4
      `}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <p className="text-sm leading-relaxed mb-6 pr-8">
        {text}
      </p>
      <p className={`text-xs font-semibold absolute bottom-2 right-3 ${initialsColorClasses[color]}`}>
        {initials}
      </p>
    </div>
  );
};

export const Quiz5Host = () => {
  const { submissions, totalParticipants, totalPostits, isLoading } = useQuiz5();
  const participantUrl = `${window.location.origin}/quiz/mapa`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-sky-100 flex items-center justify-center gap-4">
            <span className="text-6xl">🧭</span>
            Mapa da Alfabetização Tecnológica
          </h1>
          <p className="text-2xl text-purple-200">Forvis Mazars</p>
        </div>

        {/* QR Code Section */}
        <Card className="bg-sky-950/50 border-sky-500/30 backdrop-blur">
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
            <div className="bg-white p-6 rounded-xl">
              <QRCodeSVG value={participantUrl} size={200} />
            </div>
            <div className="text-center md:text-left space-y-2">
              <p className="text-2xl text-sky-100 font-semibold">
                📝 Escaneie e adicione seus 3 post-its
              </p>
              <p className="text-sky-300 text-lg">
                ou acesse: <span className="font-mono">{participantUrl}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-purple-950/50 border-purple-500/30 backdrop-blur">
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-bold text-purple-200">{totalParticipants}</p>
              <p className="text-xl text-purple-300 mt-2">Participantes</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/50 border-purple-500/30 backdrop-blur">
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-bold text-purple-200">{totalPostits}</p>
              <p className="text-xl text-purple-300 mt-2">Post-its no Mural</p>
            </CardContent>
          </Card>
        </div>

        {/* Mural - 3 Colunas */}
        {isLoading ? (
          <div className="text-center text-sky-200 text-xl">Carregando mural...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center text-sky-300 text-xl py-12">
            Aguardando as primeiras contribuições...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Mentalidade */}
            <div className="space-y-4">
              <div className="bg-sky-950/70 rounded-lg p-4 border-2 border-sky-500/50">
                <h3 className="text-2xl font-bold text-sky-100 flex items-center gap-3">
                  <span className="text-3xl">💡</span>
                  Mentalidade que mudei
                </h3>
              </div>
              <div className="space-y-4">
                {submissions.map((sub, idx) => (
                  <PostitCard 
                    key={`mindset-${sub.id}`}
                    text={sub.mindset_change}
                    initials={sub.initials}
                    color="sky"
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Coluna 2: Ideia Digital */}
            <div className="space-y-4">
              <div className="bg-green-950/70 rounded-lg p-4 border-2 border-green-500/50">
                <h3 className="text-2xl font-bold text-green-100 flex items-center gap-3">
                  <span className="text-3xl">🔧</span>
                  Ideia Digital
                </h3>
              </div>
              <div className="space-y-4">
                {submissions.map((sub, idx) => (
                  <PostitCard 
                    key={`idea-${sub.id}`}
                    text={sub.digital_idea}
                    initials={sub.initials}
                    color="green"
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Coluna 3: Hábito Digital */}
            <div className="space-y-4">
              <div className="bg-yellow-950/70 rounded-lg p-4 border-2 border-yellow-500/50">
                <h3 className="text-2xl font-bold text-yellow-100 flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  Hábito Digital
                </h3>
              </div>
              <div className="space-y-4">
                {submissions.map((sub, idx) => (
                  <PostitCard 
                    key={`habit-${sub.id}`}
                    text={sub.digital_habit}
                    initials={sub.initials}
                    color="yellow"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-2xl text-sky-200 leading-relaxed max-w-4xl mx-auto italic">
            "Transformação digital é sobre pessoas curiosas,<br />
            colaborativas e corajosas."
          </p>
        </div>
      </div>
    </div>
  );
};
