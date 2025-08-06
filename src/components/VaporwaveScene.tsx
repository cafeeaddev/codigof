
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.6, 2], // Slightly higher for better wireframe view
          fov: 85, // Wider field of view
          near: 0.01,
          far: 25,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        <Stars 
          radius={120} 
          depth={60} 
          count={4000} 
          factor={5} 
          saturation={0} 
          fade={true}
        />
        
        {/* Enhanced lighting for wireframe visibility */}
        <ambientLight intensity={0.3} color="#004466" />
        <directionalLight
          position={[0, 3, 2]}
          intensity={1.2}
          color="#00ffff"
        />
        <pointLight
          position={[-5, 2, 0]}
          intensity={0.8}
          color="#00aaff"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[5, 2, 0]}
          intensity={0.8}
          color="#0088ff"
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
