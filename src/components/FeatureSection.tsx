import { useEffect, useRef, useState } from 'react';
import SecretFAQDialog from './SecretFAQDialog';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Flag, ArrowUpCircle, Trophy } from 'lucide-react';

interface FeatureSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  index: number;
  hideInlineSecret?: boolean;
}

export const FeatureSection = ({ 
  id, 
  title, 
  subtitle, 
  description, 
  image, 
  index,
  hideInlineSecret
}: FeatureSectionProps) => {
  // Scroll reveal hooks with proper animations
  const titleReveal = useScrollReveal({ 
    direction: 'left',
    delay: 0,
    distance: 100
  });
  const videoReveal = useScrollReveal({ 
    direction: 'right',
    delay: 200,
    distance: 100
  });
  const cardsReveal = useScrollReveal({ 
    direction: 'up', 
    delay: 400, 
    distance: 80
  });

  // Only show the first feature section as our missions/xp/medals section
  if (index !== 0) return null;

 

  return (
    <section 
      id={id}
      className="min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main content section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 mb-16">
          {/* Left side - Content */}
          <div 
            ref={titleReveal.elementRef}
            style={titleReveal.style}
            className="flex-1"
          >
            <div className="mb-4 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(var(--heading-readable))]">
                Sou a <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">Cody</span>, sua IA mentora.
              </h2>
              <p className="text-[hsl(var(--lavender))] text-sm sm:text-base">
                Pronto(a) para ativar seu modo <span className="text-[hsl(var(--neon-cyan))] font-semibold">Ninja digital</span>?
              </p>
              <p className="text-[hsl(var(--lavender))] text-sm sm:text-base flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-[hsl(var(--neon-purple))]" aria-hidden></span>
                Descubra seu estilo digital e desbloqueie a trilha feita para você.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Card: Missões */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] p-[1px]">
                <article className="rounded-2xl h-full bg-[hsl(var(--background)/0.6)] backdrop-blur-md border border-border/60 p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.03] shadow-md hover:shadow-glow" aria-label="4 MISSÕES — Desafios interativos">
                  <div className="flex flex-col items-start gap-3">
                    <Flag
                      size={28}
                      className="text-[hsl(var(--neon-cyan))]"
                      style={{ filter: 'drop-shadow(0 0 12px hsl(var(--neon-cyan)))' }}
                      aria-hidden
                    />
                    <h3 className="text-[hsl(var(--heading-readable))] text-sm sm:text-base font-extrabold tracking-wide uppercase">4 Missões</h3>
                    <p className="text-[hsl(var(--body-readable))] text-xs sm:text-sm">Desafios interativos</p>
                  </div>
                </article>
              </div>

              {/* Card: XP & Levels */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] p-[1px]">
                <article className="rounded-2xl h-full bg-[hsl(var(--background)/0.6)] backdrop-blur-md border border-border/60 p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.03] shadow-md hover:shadow-glow" aria-label="XP & LEVELS — Pontuação e progresso">
                  <div className="flex flex-col items-start gap-3">
                    <ArrowUpCircle
                      size={28}
                      className="text-[hsl(var(--neon-cyan))]"
                      style={{ filter: 'drop-shadow(0 0 12px hsl(var(--neon-cyan)))' }}
                      aria-hidden
                    />
                    <h3 className="text-[hsl(var(--heading-readable))] text-sm sm:text-base font-extrabold tracking-wide uppercase">XP & Levels</h3>
                    <p className="text-[hsl(var(--body-readable))] text-xs sm:text-sm">Pontuação e progresso</p>
                  </div>
                </article>
              </div>

              {/* Card: Medalhas */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] p-[1px]">
                <article className="rounded-2xl h-full bg-[hsl(var(--background)/0.6)] backdrop-blur-md border border-border/60 p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.03] shadow-md hover:shadow-glow" aria-label="MEDALHAS — Perfis de habilidade">
                  <div className="flex flex-col items-start gap-3">
                    <Trophy
                      size={28}
                      className="text-[hsl(var(--neon-cyan))]"
                      style={{ filter: 'drop-shadow(0 0 12px hsl(var(--neon-cyan)))' }}
                      aria-hidden
                    />
                    <h3 className="text-[hsl(var(--heading-readable))] text-sm sm:text-base font-extrabold tracking-wide uppercase">Medalhas</h3>
                    <p className="text-[hsl(var(--body-readable))] text-xs sm:text-sm">Perfis de habilidade</p>
                  </div>
                </article>
              </div>
            </div>

          </div>

          {/* Right side - Video with circular design */}
          <div 
            ref={videoReveal.elementRef}
            style={videoReveal.style}
            className="flex-shrink-0 relative mt-8 lg:mt-0"
          >
            {/* Glowing circle border */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-neon-purple via-neon-purple to-neon-cyan p-1 shadow-glow">
              <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-xl overflow-hidden relative">
                {videoReveal.isVisible ? (
                  <video 
                    className="w-full h-full object-cover rounded-full"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full rounded-full bg-background/90" aria-hidden />
                )}
                {/* Additional glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-neon-cyan/10"></div>
              </div>
            </div>
            {/* Floating particles effect */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-cyan rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-8 -left-3 w-2 h-2 bg-neon-purple rounded-full opacity-40 animate-pulse delay-500"></div>
            <div className="absolute -bottom-1 left-8 w-3 h-3 bg-neon-purple rounded-full opacity-50 animate-pulse delay-1000"></div>

            {/* Spoiler bubble under Cody */}
            {!hideInlineSecret && (
              <SecretFAQDialog>
                <button
                  type="button"
                  aria-label="Abrir FAQ secreto"
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:-bottom-8 z-50 relative group cursor-pointer select-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover/90 border-l border-t border-border rotate-45" aria-hidden></span>
                  <div className="rounded-xl border border-border bg-popover/90 px-3 py-2 shadow-md backdrop-blur supports-[backdrop-filter]:backdrop-blur-md text-[hsl(var(--near-white))]">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block size-3 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] ring-2 ring-primary/40" aria-hidden></span>
                      <span className="font-medium">Quer um spoiler?</span>
                    </span>
                  </div>
                </button>
              </SecretFAQDialog>
            )}
          </div>
        </div>

{/* Cards removidos conforme solicitação */}
      </div>
    </section>
  );
};