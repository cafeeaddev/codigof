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
    const forwardMovement = scrollProgress * 8; // Reduced movement for better visibility
    targetPosition.current.set(0, 1.2, forwardMovement + 3); // Higher camera position
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.08);
    
    // Keep camera looking forward and down at the terrain
    camera.lookAt(0, 0, forwardMovement + 8);
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene rendering...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 1.2, 3],
          fov: 75,
          near: 0.1,
          far: 50,
        }}
        className="w-full h-full"
        onCreated={({ gl }) => {
          console.log('Canvas created, WebGL context:', gl.getContext());
        }}
      >
        {/* Scroll-based camera controller */}
        <ScrollCamera />
        
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
        
        {/* Simplified lighting setup */}
        <ambientLight intensity={0.1} color="#ff00ff" />
        <directionalLight
          position={[0, 5, 0]}
          intensity={0.5}
          color="#ff0080"
        />
        <pointLight
          position={[0, 3, -3]}
          intensity={1.0}
          color="#00ffff"
          distance={15}
          decay={1}
        />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000011', 5, 25]} />
        
        {/* Main terrain */}
        <VaporwaveTerrain />
      </Canvas>
    </div>
  );
};
