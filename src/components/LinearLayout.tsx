
import { useState } from 'react';
import { VaporwaveScene } from './VaporwaveScene';
import { CameraControls } from './CameraControls';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { CompaniesSection } from './CompaniesSection';
import { Footer } from './Footer';
import { Navigation } from './Navigation';

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
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 3, 5]);
  const [cameraFov, setCameraFov] = useState(75);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      
      {/* Fixed vaporwave background */}
      <div className="fixed inset-0 z-0">
        <VaporwaveScene 
          cameraPosition={cameraPosition}
          cameraFov={cameraFov}
        />
      </div>

      {/* Camera Controls */}
      <CameraControls
        position={cameraPosition}
        fov={cameraFov}
        onPositionChange={setCameraPosition}
        onFovChange={setCameraFov}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {/* Navigation */}
        <Navigation />
        
        <main className="relative">
          <HeroSection />
          
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.id}
              {...feature}
              index={index}
            />
          ))}
          
          <Footer />
        </main>
      </div>
    </div>
  );
};
