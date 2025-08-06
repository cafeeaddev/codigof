
import { VaporwaveScene } from './VaporwaveScene';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { CompaniesSection } from './CompaniesSection';
import { Footer } from './Footer';

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
  console.log('LinearLayout: Component rendering...');
  
  return (
    <div className="relative">
      {/* Fixed vaporwave background - ensure it's behind content */}
      <div className="fixed inset-0 z-0 bg-black">
        <VaporwaveScene />
      </div>

      {/* Content layer with proper z-index and background for readability */}
      <div className="relative z-10">
        <main className="relative">
          {/* Increased height for scroll testing - add semi-transparent background */}
          <div className="min-h-[400vh] bg-black/20 backdrop-blur-sm">
            <HeroSection />
            
            {/* Debug scroll indicator */}
            <div className="fixed top-4 left-4 z-50 bg-black/70 text-white p-2 rounded text-sm font-mono">
              Scroll to see terrain movement
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
