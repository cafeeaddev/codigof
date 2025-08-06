
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { CustomStars } from './CustomStars';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.8, -4], // Position to see more sky than terrain
          fov: 75, // Normal field of view
          near: 0.01,
          far: 200, // Increased to render stars at full distance
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        
        {/* Custom stars positioned only in the sky */}
        <CustomStars />
        
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
