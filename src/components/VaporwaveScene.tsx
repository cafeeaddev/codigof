
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { Button } from './ui/button';
import { Play } from 'lucide-react';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.06, 1.1],
          fov: 75,
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        <Stars 
          radius={100} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0} 
          fade={true}
        />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.1} color="#ff00ff" />
        <directionalLight
          position={[0, 0, 1]}
          intensity={0.5}
          color="#ff0080"
        />
        <pointLight
          position={[0, 1, -2]}
          intensity={0.8}
          color="#00ffff"
          distance={10}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain />
        
        {/* Development controls - hidden for production */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={0.5}
          maxDistance={5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        {/* Top text */}
        <div className="mb-8">
          <p className="text-white/80 text-sm font-mono mb-2 tracking-widest">
            SUA JORNADA DIGITAL COMEÇA AQUI!
          </p>
        </div>
        
        {/* Main title */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text mb-4">
            CÓDIGO F
          </h1>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-3"
          >
            Sistema de Diagnóstico Ativado
          </Button>
          
          <Button 
            size="lg"
            className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white px-8 py-3 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            INICIAR
          </Button>
        </div>
        
        {/* Bottom arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-6 border-r-2 border-b-2 border-white/60 transform rotate-45"></div>
        </div>
      </div>
      
      {/* Decorative geometric elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Top left geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-neon-cyan/30 transform rotate-45"></div>
        <div className="absolute top-40 left-40 w-16 h-16 border border-neon-pink/40 transform rotate-12"></div>
        
        {/* Top right geometric shapes */}
        <div className="absolute top-20 right-20 w-24 h-24 border border-neon-purple/30 transform -rotate-45"></div>
        <div className="absolute top-32 right-32 w-20 h-20 border border-neon-yellow/40 transform rotate-30"></div>
        
        {/* Bottom decorative lines */}
        <div className="absolute bottom-40 left-10 w-40 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
        <div className="absolute bottom-44 right-10 w-32 h-px bg-gradient-to-r from-transparent via-neon-pink/50 to-transparent transform rotate-12"></div>
      </div>
    </div>
  );
};
