import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

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