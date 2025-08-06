import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

interface VaporwaveSceneProps {
  scrollProgress: number;
}

export const VaporwaveScene = ({ scrollProgress }: VaporwaveSceneProps) => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.3, 0.6],
          fov: 75,
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground scrollProgress={scrollProgress} />
        <Stars 
          radius={100} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={scrollProgress} 
          fade={true}
        />
        
        {/* Dynamic lighting setup */}
        <ambientLight intensity={0.1 + scrollProgress * 0.2} color={`hsl(${scrollProgress * 360}, 100%, 50%)`} />
        <directionalLight
          position={[0, 0, 1]}
          intensity={0.5 + scrollProgress * 0.3}
          color={`hsl(${scrollProgress * 360 + 60}, 80%, 60%)`}
        />
        <pointLight
          position={[0, 1, -2]}
          intensity={0.8 + scrollProgress * 0.4}
          color={`hsl(${scrollProgress * 360 + 180}, 100%, 70%)`}
          distance={10}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain scrollProgress={scrollProgress} />
        
        {/* Development controls */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={0.5}
          maxDistance={5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8">
          <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent">
            VAPORWAVE
          </h1>
          <p className="text-neon-cyan mt-2 font-mono">
            Three.js • React Three Fiber
          </p>
        </div>
        
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-neon-pink font-mono text-sm">
            Drag to explore
          </p>
          <p className="text-neon-cyan font-mono text-sm">
            Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};