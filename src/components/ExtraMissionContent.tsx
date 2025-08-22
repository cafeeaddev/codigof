import { ScrollArea } from './ui/scroll-area';
import { ProfileHeroCard } from './EpicGameSummary/ProfileHeroCard';
import { Button } from './ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface ExtraMissionContentProps {
  userName: string;
  onBack: () => void;
}

export const ExtraMissionContent = ({ userName, onBack }: ExtraMissionContentProps) => {
  // Dados específicos para a missão extra
  const extraMissionData = {
    profile: "Aliança",
    sublevel: "Missão Especial",
    phrase: "Prepare-se para uma nova aventura digital!",
    medals: [
      { id: 'extra-1', title: 'Explorador da Aliança', done: false },
      { id: 'extra-2', title: 'Pioneiro Digital', done: false },
      { id: 'extra-3', title: 'Inovador Conectado', done: false }
    ],
    xp: 0, // Começará zerado
    totalScore: 0,
    timeBonus: 0
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Botão de voltar */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="bg-card/80 backdrop-blur-md border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Layout principal com ScrollArea */}
      <ScrollArea className="h-full w-full">
        <div className="p-6 pt-16">
          {/* Hero Card da Missão Extra */}
          <div className="mb-8">
            <ProfileHeroCard
              profile={extraMissionData.profile}
              sublevel={extraMissionData.sublevel}
              phrase={extraMissionData.phrase}
              userName={userName}
              medals={extraMissionData.medals}
              xp={extraMissionData.xp}
              totalScore={extraMissionData.totalScore}
              timeBonus={extraMissionData.timeBonus}
              className="border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-600/10"
            />
          </div>

          {/* Área de conteúdo vazia (para futuras implementações) */}
          <div className="min-h-[400px] bg-card/50 backdrop-blur-sm rounded-xl border border-cyan-400/20 p-8 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-cyan-400/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-cyan-300">
                Missão Extra em Desenvolvimento
              </h3>
              <p className="text-muted-foreground max-w-md">
                Esta missão especial está sendo preparada exclusivamente para você. 
                Em breve, novas aventuras digitais estarão disponíveis!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
              {/* Placeholders para futuro conteúdo */}
              <div className="p-4 bg-card/30 rounded-lg border border-cyan-400/20 text-center">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-cyan-400/40 rounded"></div>
                </div>
                <h4 className="font-semibold text-cyan-300 mb-2">Módulo 1</h4>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </div>

              <div className="p-4 bg-card/30 rounded-lg border border-purple-400/20 text-center">
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-400/40 rounded"></div>
                </div>
                <h4 className="font-semibold text-purple-300 mb-2">Módulo 2</h4>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </div>

              <div className="p-4 bg-card/30 rounded-lg border border-blue-400/20 text-center">
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-400/40 rounded"></div>
                </div>
                <h4 className="font-semibold text-blue-300 mb-2">Módulo 3</h4>
                <p className="text-sm text-muted-foreground">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};