
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwavePath } from './VaporwavePath';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { useRef } from 'react';
import * as THREE from 'three';

// Enhanced camera controller for path perspective
const PathCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame(() => {
    // Camera follows the path like walking/driving
    const pathHeight = 1.5; // Height above the valley floor
    const scrollDistance = scrollProgress * 20; // Travel distance along path
    
    // Smooth camera movement along the path
    camera.position.set(
      Math.sin(scrollProgress * Math.PI * 0.5) * 0.5, // Slight side-to-side movement
      pathHeight,
      8 + scrollDistance
    );
    
    // Look ahead down the path
    const lookAtZ = scrollDistance - 2;
    camera.lookAt(0, 0, lookAtZ);
    
    // Debug path movement every 2 seconds
    if (Math.floor(Date.now() / 2000) % 2 === 0) {
      console.log('Path Camera - Progress:', scrollProgress.toFixed(2), 
                 'Distance:', scrollDistance.toFixed(1), 'Height:', pathHeight);
    }
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Rendering vaporwave path...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 1.5, 8],
          fov: 70,
          near: 0.1,
          far: 200,
        }}
        className="w-full h-full"
        onCreated={({ gl, scene, camera }) => {
          console.log('Path Canvas created successfully!');
          
          // Type assertion to access fov safely
          if ('fov' in camera) {
            console.log('Camera FOV:', camera.fov, 'Position:', camera.position);
          }
          
          // Enhanced renderer settings for path effect
          gl.setClearColor('#000011');
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
        
        {/* Path-optimized camera controller */}
        <PathCamera />
        
        {/* Enhanced background for path scene */}
        <VaporwaveBackground />
        
        {/* Atmospheric stars */}
        <Stars 
          radius={150} 
          depth={80} 
          count={800} 
          factor={2} 
          saturation={0.3} 
          fade={true}
        />
        
        {/* Enhanced lighting for path and mountains */}
        <ambientLight intensity={0.15} color="#2a0845" />
        <directionalLight
          position={[0, 10, 5]}
          intensity={1.5}
          color="#ff00ff"
          castShadow={false}
        />
        <directionalLight
          position={[5, 8, 3]}
          intensity={0.6}
          color="#00ffff"
        />
        <directionalLight
          position={[-5, 8, 3]}
          intensity={0.6}
          color="#00ffff"
        />
        
        {/* Enhanced fog for path depth */}
        <fog attach="fog" args={['#000022', 20, 100]} />
        
        {/* Main vaporwave path with side mountains */}
        <VaporwavePath />
      </Canvas>
    </div>
  );
};
