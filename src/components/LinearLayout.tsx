import { VaporwaveScene } from './VaporwaveScene';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { CompaniesSection } from './CompaniesSection';
import { Footer } from './Footer';
import { useScrollProgress } from '../hooks/useScrollProgress';

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
  const scrollProgress = useScrollProgress();

  return (
    <div className="relative">
      {/* Fixed vaporwave background */}
      <div className="fixed inset-0 z-0">
        <VaporwaveScene scrollProgress={scrollProgress} />
      </div>

      {/* Content layer with proper scrolling */}
      <div className="relative z-10">
        <Navigation />
        
        {/* Main content with sections that create scroll height */}
        <main className="relative">
          <HeroSection />
          
          {/* Create height for scroll progression */}
          <div className="min-h-screen bg-black/20 backdrop-blur-sm">
            <CompaniesSection />
          </div>
          
          {features.map((feature, index) => (
            <div key={feature.id} className="min-h-screen bg-black/20 backdrop-blur-sm">
              <FeatureSection
                {...feature}
                index={index}
              />
            </div>
          ))}
          
          <div className="min-h-screen bg-black/20 backdrop-blur-sm">
            <Footer />
          </div>
          
          {/* Extra height to ensure full scroll range */}
          <div className="h-screen"></div>
        </main>
      </div>
    </div>
  );
};