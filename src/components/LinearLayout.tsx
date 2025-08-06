
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
  
  console.log('LinearLayout: Progresso do scroll nas montanhas:', (scrollProgress * 100).toFixed(1) + '%');
  
  return (
    <div className="relative">
      {/* Background vaporwave fixo com montanhas */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-purple-900 via-black to-black">
        <VaporwaveScene />
      </div>

      {/* Camada de conteúdo */}
      <div className="relative z-10">
        <main className="relative">
          {/* Área de scroll estendida para jornada nas montanhas */}
          <div className="min-h-[500vh] bg-gradient-to-b from-black/5 via-black/15 to-black/30 backdrop-blur-[0.5px]">
            <HeroSection />
            
            {/* Indicadores da jornada nas montanhas */}
            <div className="fixed top-4 left-4 z-50 bg-purple-900/95 text-cyan-300 p-3 rounded-lg text-sm font-mono border border-cyan-300/40 backdrop-blur-sm">
              <div>🏔️ Montanhas: {Math.round(scrollProgress * 100)}%</div>
              <div className="text-xs text-pink-300 mt-1">Caminhando sobre o terreno</div>
              <div className="text-xs text-gray-300">Altitude: {Math.round(scrollProgress * 3000)}m</div>
            </div>
            
            {/* Indicador de elevação */}
            <div className="fixed top-4 right-4 z-50 bg-pink-900/95 text-pink-300 p-2 rounded text-xs font-mono border border-pink-300/40 backdrop-blur-sm">
              <div>⛰️ Terreno Vaporwave</div>
              <div>Grid Status: ATIVO</div>
              <div className="text-cyan-300">Neon: LIGADO</div>
            </div>
            
            {/* Status da caminhada */}
            <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-cyan-300 p-2 rounded text-xs font-mono border border-cyan-300/30">
              🚶 {scrollProgress < 0.3 ? 'Subindo Montanhas' : 
                    scrollProgress < 0.7 ? 'Explorando Picos' : 
                    'Descendo Vale'}
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
