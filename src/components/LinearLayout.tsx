import { VaporwaveScene } from './VaporwaveScene';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';

export const LinearLayout = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed vaporwave background */}
      <div className="fixed inset-0 z-0">
        <VaporwaveScene />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        <Navigation />
        <main className="relative">
          <HeroSection />
        </main>
      </div>
    </div>
  );
};