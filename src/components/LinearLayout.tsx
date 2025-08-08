
import { useState, useEffect } from 'react';
import { VaporwaveScene } from './VaporwaveScene';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { Footer } from './Footer';
import { Navigation } from './Navigation';
import { SectionContainer } from './SectionContainer';
import { ScrollProgress } from './ScrollProgress';
import { useInternalScroll } from '@/hooks/useInternalScroll';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';

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
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 1, -8]);
  const [cameraFov, setCameraFov] = useState(65);
  const { user, profile, isLoading, signOut } = useAuth();
  const { updatePosition, currentPosition, totalPlayTime, formatPlayTime } = useGameProgress();
  
  const {
    containerRef,
    currentSection,
    totalSections,
    scrollToSection,
    registerSection,
    unregisterSection
  } = useInternalScroll();

  // Update position when section changes
  useEffect(() => {
    if (user && currentSection !== undefined) {
      const sectionNames = ['hero', 'features', 'footer'];
      const sectionName = sectionNames[currentSection] || 'hero';
      updatePosition(sectionName);
    }
  }, [currentSection, user, updatePosition]);

  const handleLogout = async () => {
    await signOut();
    setShowWelcome(false);
  };

  // Show welcome screen if authenticated
  if (user && profile && showWelcome) {
    return <WelcomeScreen user={profile} onLogout={handleLogout} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // If user is authenticated but not showing welcome, show welcome
  if (user && profile && !showWelcome) {
    setShowWelcome(true);
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
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
        
        {/* Internal scroll container */}
        <div 
          ref={containerRef}
          className="h-screen w-full overflow-y-auto overflow-x-hidden scrollbar-hide"
          data-internal-scroll="true"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'y mandatory'
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
            <HeroSection />
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
            />
          </SectionContainer>

          {/* Footer Section */}
          <SectionContainer
            sectionId="footer"
            sectionIndex={2}
            registerSection={registerSection}
            unregisterSection={unregisterSection}
            className="scroll-snap-start bg-transparent"
          >
            <Footer />
          </SectionContainer>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <ScrollProgress
        currentSection={currentSection}
        totalSections={totalSections}
        onSectionClick={scrollToSection}
      />
    </div>
  );
};
