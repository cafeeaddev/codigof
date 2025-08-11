import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { X, Volume2, VolumeX, SkipForward, RotateCcw, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
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
}

const useSlides = (stage: "prelogin" | "ingame") => {
  return useMemo<Slide[]>(() => {
    if (stage === "ingame") {
      return [
        {
          title: "Bem-vindo(a) à sua Base",
          description:
            "Aqui você vê seu XP, medalhas e qual missão está ativa agora. Avance missão a missão para liberar a próxima.",
          narration:
            "Bem vindo à sua base. Aqui você acompanha seu progresso em tempo real, suas medalhas e a missão ativa. Complete uma missão para liberar a próxima.",
        },
        {
          title: "Missões e Progresso",
          description:
            "Cada missão vale 25 XP. O progresso começa em 0% e só avança quando você responde. Concluiu? Ganha medalha.",
          narration:
            "Cada missão vale vinte e cinco pontos de experiência. O progresso só aumenta quando você responde. Ao concluir, você recebe uma medalha.",
        },
        {
          title: "Como Navegar",
          description:
            "Use Próximo e Voltar dentro das missões. Você pode sair e voltar depois — seu progresso fica salvo.",
          narration:
            "Use próximo e voltar para navegar nas perguntas. Você pode sair e voltar depois. O seu progresso fica salvo.",
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
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Prepare narrator silently
      narrator.init().catch(() => {});
    }
  }, []);

  const play = async () => {
    try {
      setIsSpeaking(true);
      await narrator.speak(slides[index].narration, () => setIsSpeaking(false));
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
    if (audioEnabled) await play();
  };

  const handlePrev = async () => {
    const prev = Math.max(index - 1, 0);
    setIndex(prev);
    if (audioEnabled) await play();
  };

  const handleReplay = async () => {
    if (audioEnabled) await play();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <article className="relative z-[81] w-full max-w-xl md:max-w-2xl bg-card/95 border border-secondary/50 rounded-xl shadow-neon overflow-hidden animate-fade-in">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-secondary" />
            <h1 className="text-base md:text-lg font-semibold text-secondary">
              {stage === "prelogin" ? "Tutorial: Visão Geral" : "Tutorial: Dentro do Jogo"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!audioEnabled ? (
              <Button size="sm" variant="secondary" onClick={handleEnableAudio}>
                <Volume2 className="w-4 h-4 mr-1" /> Ativar Áudio
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleReplay}>
                {isSpeaking ? <Volume2 className="w-4 h-4 mr-1 animate-pulse" /> : <RotateCcw className="w-4 h-4 mr-1" />} Repetir
              </Button>
            )}
            <Button size="icon" variant="outline" onClick={onClose} aria-label="Fechar">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="px-5 md:px-6 py-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-primary">{slides[index].title}</h2>
            <p className="text-sm md:text-base text-muted-foreground">{slides[index].description}</p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Passo {index + 1} de {slides.length}
            </span>
          </div>
        </main>

        <footer className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Pular
            </Button>
            <Button variant="outline" size="sm" onClick={onDontShowAgain}>
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
