
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { CustomStars } from './CustomStars';
import { useRef } from 'react';

const CameraController = () => {
  useFrame((state) => {
    // Move camera forward automatically
    const speed = 0.8;
    state.camera.position.z += speed * 0.016; // Forward movement
    
    // Reset position when too far to create infinite loop
    if (state.camera.position.z > 15) {
      state.camera.position.z = -8;
    }
  });

  return (
    <OrbitControls 
      enableDamping={true}
      dampingFactor={0.05}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 0, 0]}
    />
  );
};

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 4, -8], // Elevated aerial view for flying over terrain
          fov: 65, // Slightly tighter for more cinematic feel
          near: 0.01,
          far: 25,
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
        
        {/* Camera controller for forward movement */}
        <CameraController />
      </Canvas>
    </div>
  );
};
