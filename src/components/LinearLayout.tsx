import { useState, useEffect } from 'react';
import { VaporwaveScene } from './VaporwaveScene';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { Footer } from './Footer';

import { Navigation } from './Navigation';
import { SectionContainer } from './SectionContainer';
import { ScrollProgress } from './ScrollProgress';

import { ChevronDown } from 'lucide-react';
import { useInternalScroll } from '@/hooks/useInternalScroll';

import { WelcomeScreen } from './WelcomeScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useScalabilityOptimization } from '@/hooks/useScalabilityOptimization';
import SecretFAQDialog from './SecretFAQDialog';
const features = [
  {
    id: 'timeline',
    title: 'Sou a Cody, sua IA mentora.',
    subtitle: 'Pronto(a) para ativar seu modo Ninja digital?',
    description: 'Descubra seu estilo digital e desbloqueie a trilha feita para você.',
    image: '/placeholder-timeline.jpg'
  },
  {
    id: 'triage',
    title: 'Triage',
    subtitle: 'A simple workflow for requests and bug reports',
    description: 'Triage is your special inbox for managing issues created with integrations or by members outside of your team. New issues go here first.',
    image: '/placeholder-triage.jpg'
  },
  {
    id: 'insights',
    title: 'Insights',
    subtitle: 'Data-driven decisions for your team',
    description: 'Get detailed analytics about your team\'s velocity, cycle time, and productivity. Make informed decisions with comprehensive reporting.',
    image: '/placeholder-insights.jpg'
  }
];

export const LinearLayout = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  // Camera configuration for vaporwave scene
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 1, -8]);
  const [cameraFov, setCameraFov] = useState(65);
  const { user, profile, isLoading, signOut } = useAuth();
  const { starCount, isOptimized, status } = useScalabilityOptimization();
  
  console.log('[LinearLayout] Auth state:', { 
    user: user ? { id: user.id, email: user.email } : undefined, 
    profile: profile ? { nome: profile.nome, email: profile.email } : undefined, 
    isLoading,
    userExists: !!user,
    profileExists: !!profile 
  });
  
  // Log escalabilidade quando necessário
  if (isOptimized) {
    console.info(`[LinearLayout] Modo otimizado ativo - ${starCount} estrelas, status: ${status}`);
  }
  
  // Only initialize game progress when user is fully authenticated
  const gameProgressEnabled = !isLoading && !!user?.id;
  const { updatePosition, currentPosition, totalPlayTime, formatPlayTime } = useGameProgress();
  
  const {
    containerRef,
    currentSection,
    totalSections,
    isScrolling,
    scrollToSection,
    nextSection,
    registerSection,
    unregisterSection
  } = useInternalScroll();
  // Update position when section changes - only if user is authenticated and game progress is enabled
  useEffect(() => {
    if (gameProgressEnabled && user && currentSection !== undefined) {
      console.log('[LinearLayout] Updating position for section:', currentSection, 'user:', user.id);
      const sectionNames = ['hero', 'features', 'footer'];
      const sectionName = sectionNames[currentSection] || 'hero';
      updatePosition(sectionName);
    }
  }, [currentSection, user, updatePosition, gameProgressEnabled]);

  const handleLogout = async () => {
    await signOut();
    setShowWelcome(false);
  };

  // Show welcome screen if authenticated - ensure both user and profile are ready
  useEffect(() => {
    console.log('[LinearLayout] Auth state check:', { 
      user: !!user, 
      userId: user?.id,
      userEmail: user?.email,
      profile: !!profile, 
      profileName: profile?.nome,
      profileEmail: profile?.email,
      showWelcome, 
      isLoading 
    });
    
    if (!isLoading && user && profile && !showWelcome) {
      console.log('[LinearLayout] Setting showWelcome to true for user:', user.id, 'profile:', profile.nome);
      setShowWelcome(true);
    } else if (!isLoading && user && profile && showWelcome) {
      console.log('[LinearLayout] Welcome already showing for user:', user.id);
    } else if (!isLoading && (!user || !profile)) {
      console.log('[LinearLayout] Not showing welcome - user:', !!user, 'profile:', !!profile);
    }
  }, [user, profile, showWelcome, isLoading]);

  // Log when Secret FAQ link becomes visible
  useEffect(() => {
    if (typeof currentSection === 'number' && currentSection > 0) {
      console.log('[LinearLayout] Secret FAQ link visible at section:', currentSection);
    }
  }, [currentSection]);

  // Show loading state
  if (isLoading) {
    console.log('[LinearLayout] Showing loading state');
    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Show welcome screen if authenticated with profile - pass userId explicitly
  if (user && profile && showWelcome) {
    console.log('[LinearLayout] Rendering WelcomeScreen for user:', profile.nome, 'userId:', user.id);
    return <WelcomeScreen user={profile} userId={user.id} onLogout={handleLogout} />;
  }


  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {/* Fixed vaporwave background - positioned behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <VaporwaveScene 
          cameraPosition={cameraPosition}
          cameraFov={cameraFov}
        />
      </div>

      {/* Content layer with internal scroll */}
      <div className="relative z-10">
        {/* Fixed Navigation */}
        <div className="fixed top-0 left-0 right-0 z-30">
          <Navigation />
        </div>

        {/* Secret FAQ link moved outside content layer */}
        {/* Internal scroll container */}
        <div 
          ref={containerRef}
          className="h-[100svh] w-full overflow-y-auto overflow-x-hidden"
          data-internal-scroll="true"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'y proximity'
          }}
        >
          {/* Hero Section */}
          <SectionContainer
            sectionId="hero"
            sectionIndex={0}
            registerSection={registerSection}
            unregisterSection={unregisterSection}
            className="scroll-snap-start bg-transparent"
          >
            <HeroSection onContinueClick={nextSection} />
          </SectionContainer>

          {/* Feature Section */}
          <SectionContainer
            sectionId="features"
            sectionIndex={1}
            registerSection={registerSection}
            unregisterSection={unregisterSection}
            className="scroll-snap-start bg-transparent"
          >
            <FeatureSection
              {...features[0]}
              index={0}
              hideInlineSecret={true}
            />
          </SectionContainer>

          {/* Footer Section */}
          <SectionContainer
            sectionId="footer"
            sectionIndex={2}
            registerSection={registerSection}
            unregisterSection={unregisterSection}
            className="scroll-snap-start bg-transparent pb-28 sm:pb-48"
          >
            <Footer />
          </SectionContainer>
        </div>
      </div>

      {/* Floating Continue Button */}
      {totalSections > 0 && currentSection > 0 && currentSection < totalSections - 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => nextSection()}
            aria-label="Rolar para a próxima seção"
            className="flex flex-col items-center text-foreground/70 hover:text-foreground transition-colors duration-300"
          >
            <span className="text-xs sm:text-sm font-medium tracking-wider mb-1 sm:mb-2 uppercase">CONTINUE</span>
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
          </button>
        </div>
      )}
      {typeof currentSection === 'number' && currentSection > 0 && (
        <div className="pointer-events-none fixed right-6 sm:right-8 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-[70]">
          <SecretFAQDialog>
            <button
              type="button"
              aria-label="Abrir FAQ secreto"
              className="pointer-events-auto bg-transparent p-0 m-0 text-secondary hover:underline underline-offset-4 text-xs sm:text-sm font-medium inline-flex items-center"
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-flex items-center justify-center rounded-full shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 pulse"
                style={{
                  background: 'var(--gradient-neon-ring)'
                }}
              >
                <span className="w-[65%] h-[65%] rounded-full bg-background" />
              </span>
              Você quer um spoiler?
            </button>
          </SecretFAQDialog>
        </div>
      )}

      {/* Scroll Progress Indicator */}
      <ScrollProgress
        currentSection={currentSection}
        totalSections={totalSections}
        onSectionClick={scrollToSection}
      />

    </div>
  );
};
