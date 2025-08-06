import { VaporwaveScene } from './VaporwaveScene';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { CompaniesSection } from './CompaniesSection';
import { Footer } from './Footer';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

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
  console.log('LinearLayout: Rendering with scroll progress:', scrollProgress.toFixed(3));
  
  return (
    <div className="relative">
      {/* Fixed vaporwave mountain scene background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-purple-900 via-black to-black">
        <VaporwaveScene />
      </div>

      {/* Content layer with enhanced backdrop */}
      <div className="relative z-10">
        <main className="relative">
          {/* Extended scroll area for mountain exploration */}
          <div className="min-h-[500vh] bg-gradient-to-b from-black/10 via-black/30 to-black/50 backdrop-blur-[1px]">
            <HeroSection />
            
            {/* Enhanced scroll indicator with mountain theme */}
            <div className="fixed top-4 left-4 z-50 bg-purple-900/80 text-neon-pink p-3 rounded-lg text-sm font-mono border border-neon-pink/30 backdrop-blur-sm">
              <div>🏔️ Mountain Progress: {Math.round(scrollProgress * 100)}%</div>
              <div className="text-xs text-neon-cyan mt-1">Scroll to explore the peaks</div>
            </div>
            
            {/* Mountain height indicator */}
            <div className="fixed top-4 right-4 z-50 bg-purple-900/80 text-neon-cyan p-2 rounded text-xs font-mono border border-neon-cyan/30 backdrop-blur-sm">
              Altitude: {Math.round(scrollProgress * 3000)}m
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
