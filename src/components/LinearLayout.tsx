
import { VaporwaveScene } from './VaporwaveScene';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { CompaniesSection } from './CompaniesSection';
import { Footer } from './Footer';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { useEffect, useState } from 'react';

const features = [
  {
    id: 'timeline',
    title: 'Timeline',
    subtitle: 'Plan visually with live predictions',
    description: 'A roadmap that stays in sync. View and update projects from one simple interface. We calculate when projects will complete based on issue data and historical velocity so you\'re always a step ahead.',
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
  const scrollProgress = useScrollTerrain();
  const [continuousDistance, setContinuousDistance] = useState(0);
  
  // Track continuous movement
  useEffect(() => {
    const interval = setInterval(() => {
      setContinuousDistance(prev => prev + 0.1);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  console.log('LinearLayout: Rendering with continuous path movement:', continuousDistance.toFixed(1));
  
  return (
    <div className="relative">
      {/* Fixed vaporwave path scene background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-purple-900 via-black to-black">
        <VaporwaveScene />
      </div>

      {/* Content layer with path-themed backdrop */}
      <div className="relative z-10">
        <main className="relative">
          {/* Extended scroll area for path journey */}
          <div className="min-h-[600vh] bg-gradient-to-b from-black/5 via-black/20 to-black/40 backdrop-blur-[0.5px]">
            <HeroSection />
            
            {/* Enhanced path journey indicator with continuous movement */}
            <div className="fixed top-4 left-4 z-50 bg-purple-900/90 text-neon-cyan p-3 rounded-lg text-sm font-mono border border-neon-cyan/40 backdrop-blur-sm">
              <div>🛣️ Jornada Contínua: {Math.round(scrollProgress * 100)}%</div>
              <div className="text-xs text-neon-pink mt-1">Andando pelo vale vaporwave</div>
              <div className="text-xs text-gray-300">Distância: {Math.round(continuousDistance + scrollProgress * 15)}km</div>
              <div className="text-xs text-green-400">● Sempre em movimento</div>
            </div>
            
            {/* Path elevation indicator for taller mountains */}
            <div className="fixed top-4 right-4 z-50 bg-purple-900/90 text-neon-pink p-2 rounded text-xs font-mono border border-neon-pink/40 backdrop-blur-sm">
              <div>🏔️ Montanhas Altas</div>
              <div>Elevação: {Math.round(scrollProgress * 80 + continuousDistance * 2)}m</div>
              <div className="text-neon-cyan">Picos: {Math.round(scrollProgress * 200 + 500)}m</div>
            </div>
            
            {/* Continuous movement status */}
            <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-neon-cyan p-2 rounded text-xs font-mono border border-neon-cyan/30">
              Status: {continuousDistance < 5 ? 'Começando Caminhada' : 
                      continuousDistance < 15 ? 'Atravessando Vale' : 
                      'Subindo Montanhas'} - Movimento Contínuo
            </div>
            
            {/* Speed indicator */}
            <div className="fixed bottom-4 right-4 z-50 bg-purple-800/80 text-yellow-300 p-2 rounded text-xs font-mono border border-yellow-300/30">
              🚶‍♂️ Velocidade: 2km/s
            </div>
          </div>
          
          <CompaniesSection />
          
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
