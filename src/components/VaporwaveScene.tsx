import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { useRef } from 'react';
import * as THREE from 'three';

// Camera controller component
const ScrollCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  
  useFrame(() => {
    // Calculate target position based on scroll
    const forwardMovement = scrollProgress * 15; // Move 15 units forward
    targetPosition.current.set(0, 0.5, forwardMovement + 2);
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.05);
    
    // Keep camera looking forward and slightly down
    camera.lookAt(0, -0.2, forwardMovement + 10);
  });
  
  return null;
};

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.5, 2],
          fov: 85,
          near: 0.01,
          far: 100,
        }}
        className="w-full h-full"
      >
        {/* Scroll-based camera controller */}
        <ScrollCamera />
        
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        <Stars 
          radius={200} 
          depth={100} 
          count={3000} 
          factor={6} 
          saturation={0} 
          fade={true}
        />
        
        {/* Enhanced lighting setup for neon effect */}
        <ambientLight intensity={0.05} color="#ff00ff" />
        <directionalLight
          position={[0, 5, 0]}
          intensity={0.3}
          color="#ff0080"
        />
        <pointLight
          position={[0, 2, -5]}
          intensity={1.2}
          color="#00ffff"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[-5, 1, 0]}
          intensity={0.8}
          color="#ff00ff"
          distance={15}
          decay={2}
        />
        <pointLight
          position={[5, 1, 0]}
          intensity={0.8}
          color="#00ffff"
          distance={15}
          decay={2}
        />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000011', 10, 50]} />
        
        {/* Main terrain */}
        <VaporwaveTerrain />
      </Canvas>
    </div>
  );
};
