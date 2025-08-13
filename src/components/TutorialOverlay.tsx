import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { X, Volume2, VolumeX, RotateCcw, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { narrator } from "@/utils/tutorialNarrator";

interface TutorialOverlayProps {
  stage: "prelogin" | "ingame";
  onClose: () => void;
  onDontShowAgain: () => void;
}

interface Slide {
  title: string;
  description: string;
  narration: string;
  customAudioUrl?: string;
}

const useSlides = (stage: "prelogin" | "ingame") => {
  return useMemo<Slide[]>(() => {
    if (stage === "ingame") {
      return [
        {
          title: "Bem-vindo (a) à sua spaceship 🛸!",
          description:
            "Aqui você conquista XPs, coleciona medalhas e vê qual missão está ativa. Progrida para liberar novos desafios e avançar mais um passo rumo ao Código F.",
          narration:
            "Aqui você conquista XPs, coleciona medalhas e vê qual missão está ativa. Progrida para liberar novos desafios e avançar mais um passo rumo ao Código F.",
          customAudioUrl: "https://meta.cafeeadhost.com.br/Cody/audio01.MP3",
        },
        {
          title: "Missões e Progresso",
          description:
            "Cada missão vale 25 XPs. Seu progresso inicia em 0% e avança conforme você responde. Complete cada missão e conquiste uma nova medalha.",
          narration:
            "Cada missão vale 25 XPs. Seu progresso inicia em 0% e avança conforme você responde. Complete cada missão e conquiste uma nova medalha.",
          customAudioUrl: "https://meta.cafeeadhost.com.br/Cody/audio02.mp3",
        },
        {
          title: "Como Navegar",
          description:
            "Use os botões Próximo e Voltar para navegar pelas missões. Você pode sair e retornar quando quiser: seu progresso será salvo automaticamente.",
          narration:
            "Use os botões Próximo e Voltar para navegar pelas missões. Você pode sair e retornar quando quiser: seu progresso será salvo automaticamente.",
          customAudioUrl: "https://meta.cafeeadhost.com.br/Cody/audio03.mp3",
        },
      ];
    }

    // prelogin
    return [
      {
        title: "Tour Rápido",
        description:
          "Sou a Cody, sua IA mentora. Em poucos passos você vai descobrir seu perfil digital e encarar 4 missões.",
        narration:
          "Oi, eu sou a Cody, sua mentora. Em poucos passos você descobre seu perfil digital e encara quatro missões divertidas.",
        customAudioUrl: "https://meta.cafeeadhost.com.br/Cody/audio01.MP3",
      },
      {
        title: "Como Funciona",
        description:
          "Role a página para ver as áreas. Faça login para começar o jogo e acompanhar seu XP e medalhas.",
        narration:
          "Role a página para explorar as áreas. Faça login para começar a jogar e acompanhar seu XP e medalhas.",
      },
      {
        title: "Missões",
        description:
          "São 4 missões curtas. Responda para avançar. Cada missão concluída rende 25 XP e uma medalha.",
        narration:
          "Você terá quatro missões curtas. Responda para avançar. Cada missão concluída rende vinte e cinco XP e uma medalha.",
      },
    ];
  }, [stage]);
};

export const TutorialOverlay = ({ stage, onClose, onDontShowAgain }: TutorialOverlayProps) => {
  const slides = useSlides(stage);
  const [index, setIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Prepare narrator silently
      narrator.init().catch(() => {});
      // Optional: load custom avatar video URL stored by admin
      try {
        const url = localStorage.getItem('codyAvatarUrl');
        if (url) {
          setVideoUrl(url);
        } else {
          setVideoUrl('https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4');
        }
      } catch {
        setVideoUrl('https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4');
      }
    }

    // Cleanup audio when component unmounts
    return () => {
      console.log('[TutorialOverlay] Component unmounting, stopping audio');
      narrator.stop();
    };
  }, []);
  const play = async (overrideText?: string, slideIndex?: number) => {
    try {
      // Stop any current audio before playing new one
      narrator.stop();
      
      setIsSpeaking(true);
      const currentSlide = slides[slideIndex ?? index];
      const text = overrideText ?? currentSlide.narration;
      await narrator.speak(text, () => setIsSpeaking(false), currentSlide.customAudioUrl);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const handleEnableAudio = async () => {
    try {
      await narrator.activate();
      setAudioEnabled(true);
      await play();
    } catch (e) {
      setAudioEnabled(false);
    }
  };

  const handleNext = async () => {
    const next = Math.min(index + 1, slides.length - 1);
    setIndex(next);
    if (audioEnabled) await play(slides[next].narration, next);
  };

  const handlePrev = async () => {
    const prev = Math.max(index - 1, 0);
    setIndex(prev);
    if (audioEnabled) await play(slides[prev].narration, prev);
  };

  const handleReplay = async () => {
    if (audioEnabled) await play();
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled && narrator.isSpeaking()) {
      // Para o áudio atual se estiver falando
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <article className="relative z-[81] w-full max-w-xl md:max-w-2xl bg-card/95 border border-secondary/50 rounded-xl shadow-neon overflow-hidden animate-fade-in">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-secondary" />
            <h1 className="text-base md:text-lg font-semibold text-secondary">
              {stage === "prelogin" ? "Tutorial: Visão Geral" : "Tutorial"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!audioEnabled ? (
              <Button size="sm" variant="secondary" onClick={handleEnableAudio}>
                <Volume2 className="w-4 h-4 mr-1" /> Ativar Áudio
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleReplay}>
                  {isSpeaking ? <Volume2 className="w-4 h-4 mr-1 animate-pulse" /> : <RotateCcw className="w-4 h-4 mr-1" />} Repetir
                </Button>
                <Button size="icon" variant="outline" onClick={handleToggleAudio} aria-label="Desativar áudio">
                  <VolumeX className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button size="icon" variant="outline" onClick={onClose} aria-label="Fechar">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="px-5 md:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,136px] gap-4 items-start">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-primary">{slides[index].title}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{slides[index].description}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Passo {index + 1} de {slides.length}
                </span>
              </div>
            </div>

            <aside className="hidden md:block">
              <div className="relative w-[136px] h-[136px] rounded-xl overflow-hidden border border-accent/50 shadow-neon bg-background/40">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    aria-label="Avatar de IA"
                  />
                ) : (
                  <div className="flex items-end justify-center h-full gap-1 p-4" aria-label="Visual da IA">
                    {[0,1,2,3,4].map((i) => (
                      <span
                        key={i}
                        className={`w-2 rounded bg-accent ${isSpeaking ? 'h-16 animate-pulse' : 'h-8'}`}
                        style={{ transition: 'height 200ms ease' }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">Cody, IA mentora</p>
            </aside>
          </div>
        </main>

        <footer className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              // Stop audio when closing tutorial
              narrator.stop();
              onClose();
            }}>
              Pular
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              // Stop audio when closing tutorial
              narrator.stop();
              onDontShowAgain();
            }}>
              Não mostrar de novo
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={index === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button variant="default" size="sm" onClick={handleNext} disabled={index === slides.length - 1}>
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default TutorialOverlay;
