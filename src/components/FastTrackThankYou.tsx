import { ScrollArea } from './ui/scroll-area';

interface FastTrackThankYouProps {
  userName: string;
  onBack: () => void;
  onResponseSubmitted?: () => void;
}

export const FastTrackThankYou = ({ userName, onBack, onResponseSubmitted }: FastTrackThankYouProps) => {
  return (
    <div className="w-full h-screen relative flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 md:p-6 pb-safe-area space-y-6">
          {/* 🔥 Conteúdo extra para forçar scroll em telas pequenas */}
          <div className="h-4 opacity-0" aria-hidden="true"></div>
          <div className="mb-4 md:mb-8">
            <div className="relative overflow-hidden animate-epic-entry bg-background/95 backdrop-blur-sm border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-xl">
              <div className="relative p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 relative z-10">
                  
                  {/* Avatar do Cody */}
                  <div className="flex-shrink-0 text-center lg:text-left">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow mx-auto lg:mx-0">
                        <div className="w-full h-full rounded-full bg-background/20 backdrop-blur-xl overflow-hidden relative">
                          <video 
                            className="w-full h-full object-cover rounded-full"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                          >
                            <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem de agradecimento */}
                  <div className="flex-1 text-center lg:text-left space-y-4 w-full">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r opacity-10 blur-sm rounded-lg"
                        style={{ 
                          background: 'linear-gradient(45deg, hsl(var(--primary))20, transparent, hsl(var(--primary))20)' 
                        }}
                      />
                      <div className="relative text-foreground/90 leading-relaxed p-4 md:p-6 rounded-lg border border-border/50 bg-background/30 text-center">
                        <div className="space-y-4">
                          <h3 className="text-xl md:text-3xl font-bold text-cyan-300">🎉 Parabéns por se inscrever no Fast Track!</h3>
                          <div className="space-y-4">
                            <p className="text-sm md:text-lg">
                              Sua jornada de aceleração está apenas começando. Nos próximos dias, você receberá todas as informações sobre o programa.
                            </p>
                            <p className="text-sm md:text-lg">
                              Enquanto isso, conheça o Espaço de Tecnologia da UM, um ambiente 100% dedicado aos treinamentos de tecnologia.
                            </p>
                            <p className="text-sm md:text-lg">
                              A Cody vai guiá-lo(a) em um tour virtual pela plataforma, mostrando tudo que você pode explorar e aproveitar.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 🔥 Espaçamento extra para garantir scroll no mobile */}
          <div className="h-48 opacity-0" aria-hidden="true"></div>
          <div className="h-48 opacity-0" aria-hidden="true"></div>
          <div className="h-48 opacity-0" aria-hidden="true"></div>
        </div>
      </div>

      {/* Botões fixos na parte inferior */}
      <div className="bg-background border-t p-4 safe-area-inset-bottom">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onResponseSubmitted?.();
              onBack();
            }}
            className="w-full px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-medium transition-colors min-h-[48px] text-base"
          >
            Ver Resultados Finais
          </button>
          <a
            href="https://mazars.cafeead.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors text-center min-h-[48px] text-base flex items-center justify-center"
          >
            Entrar na UM
          </a>
        </div>
      </div>
    </div>
  );
};