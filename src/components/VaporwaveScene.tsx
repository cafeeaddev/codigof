
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwavePath } from './VaporwavePath';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import * as THREE from 'three';

// Enhanced camera controller for continuous path movement
const PathCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame((state) => {
    // Continuous camera movement independent of scroll
    const continuousMovement = state.clock.elapsedTime * 2;
    const scrollDistance = scrollProgress * 15;
    
    // Camera follows the path like walking/driving continuously
    const pathHeight = 2.2; // Slightly higher to see over path elevations
    const totalDistance = continuousMovement + scrollDistance;
    
    // Smooth camera movement along the path with gentle swaying
    camera.position.set(
      Math.sin(state.clock.elapsedTime * 0.3) * 0.8, // Side-to-side movement
      pathHeight + Math.sin(state.clock.elapsedTime * 0.5) * 0.3, // Gentle vertical bob
      8 + totalDistance
    );
    
    // Look ahead down the path
    const lookAtZ = totalDistance - 3;
    const lookAtX = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    camera.lookAt(lookAtX, pathHeight * 0.5, lookAtZ);
    
    // Debug path movement every 2 seconds
    if (Math.floor(state.clock.elapsedTime) % 2 === 0 && state.clock.elapsedTime % 1 < 0.016) {
      console.log('Continuous Path Camera - Time:', state.clock.elapsedTime.toFixed(1), 
                 'Total Distance:', totalDistance.toFixed(1), 'Height:', pathHeight);
    }
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Rendering continuous vaporwave path...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 2.2, 8],
          fov: 75,
          near: 0.1,
          far: 300,
        }}
        className="w-full h-full"
        onCreated={({ gl, scene, camera }) => {
          console.log('Continuous Path Canvas created successfully!');
          
          // Enhanced renderer settings for taller mountains
          gl.setClearColor('#000015');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        onError={(error) => {
          console.error('Path Canvas error:', error);
        }}
      >
        {/* Coordinate system for debugging */}
        <primitive 
          object={new THREE.AxesHelper(3)} 
          position={[0, 0, 0]} 
        />
        
        {/* Continuous path-optimized camera controller */}
        <PathCamera />
        
        {/* Enhanced background for path scene */}
        <VaporwaveBackground />
        
        {/* More atmospheric stars for taller mountains */}
        <Stars 
          radius={200} 
          depth={100} 
          count={1200} 
          factor={2.5} 
          saturation={0.4} 
          fade={true}
        />
        
        {/* Enhanced lighting for taller path and mountains */}
        <ambientLight intensity={0.18} color="#2a0845" />
        <directionalLight
          position={[0, 15, 8]}
          intensity={2.0}
          color="#ff00ff"
          castShadow={false}
        />
        <directionalLight
          position={[8, 12, 5]}
          intensity={0.8}
          color="#00ffff"
        />
        <directionalLight
          position={[-8, 12, 5]}
          intensity={0.8}
          color="#00ffff"
        />
        
        {/* Enhanced fog for taller mountain depth */}
        <fog attach="fog" args={['#000025', 25, 150]} />
        
        {/* Main vaporwave path with taller side mountains */}
        <VaporwavePath />
      </Canvas>
    </div>
  );
};
