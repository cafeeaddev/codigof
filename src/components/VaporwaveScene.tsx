
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.2, -1], // Start inside the terrain/mountains
          fov: 85, // Wider field of view
          near: 0.01,
          far: 25,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        <Stars 
          radius={15} 
          depth={10} 
          count={2000} 
          factor={8} 
          saturation={1} 
          fade={false}
          speed={0.3}
        />
        
        {/* Neutral lighting to avoid color contamination */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight
          position={[0, 3, 2]}
          intensity={0.8}
          color="#ffffff"
        />
        <pointLight
          position={[-5, 2, 0]}
          intensity={0.6}
          color="#ffaa00"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[5, 2, 0]}
          intensity={0.6}
          color="#ffdd00"
          distance={20}
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
          maxPolarAngle={Math.PI / 2.1}
          minDistance={1.5}
          maxDistance={10}
          target={[0, 0, -2]}
        />
      </Canvas>
    </div>
  );
};
