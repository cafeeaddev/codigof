
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwaveMountains } from './VaporwaveMountains';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { useRef } from 'react';
import * as THREE from 'three';

// Enhanced camera controller for mountain perspective
const MountainCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame(() => {
    // Optimized camera positioning for mountain view
    const baseHeight = 4;
    const scrollHeight = scrollProgress * 3;
    const height = baseHeight + scrollHeight;
    
    const baseDistance = 8;
    const scrollDistance = scrollProgress * 6;
    const distance = baseDistance + scrollDistance;
    
    // Slight angle for better mountain perspective
    const angle = Math.sin(scrollProgress * Math.PI) * 0.3;
    
    camera.position.set(
      Math.sin(angle) * 2,
      height,
      distance
    );
    
    // Look at point that moves with scroll
    const lookAtZ = scrollProgress * 4 - 2;
    camera.lookAt(0, 0, lookAtZ);
    
    // Debug every 2 seconds
    if (Math.floor(Date.now() / 2000) % 2 === 0) {
      console.log('Mountain Camera - Scroll:', scrollProgress.toFixed(2), 
                 'Height:', height.toFixed(1), 'Distance:', distance.toFixed(1));
    }
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Rendering with mountain terrain...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 4, 8],
          fov: 60,
          near: 0.1,
          far: 200,
        }}
        className="w-full h-full"
        onCreated={({ gl, scene, camera }) => {
          console.log('Mountain Canvas created successfully!');
          console.log('Camera FOV:', camera.fov, 'Position:', camera.position);
          
          // Enhanced renderer settings for better visual quality
          gl.setClearColor('#000011');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        onError={(error) => {
          console.error('Mountain Canvas error:', error);
        }}
      >
        {/* Coordinate system for debugging */}
        <primitive 
          object={new THREE.AxesHelper(3)} 
          position={[0, 0, 0]} 
        />
        
        {/* Mountain-optimized camera controller */}
        <MountainCamera />
        
        {/* Enhanced background for mountain scene */}
        <VaporwaveBackground />
        
        {/* Atmospheric stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={1000} 
          factor={3} 
          saturation={0.5} 
          fade={true}
        />
        
        {/* Enhanced lighting for mountains */}
        <ambientLight intensity={0.2} color="#4a0e4e" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          color="#ff00ff"
          castShadow={false}
        />
        <directionalLight
          position={[-5, 6, 3]}
          intensity={0.8}
          color="#00ffff"
        />
        
        {/* Atmospheric fog for depth */}
        <fog attach="fog" args={['#000033', 15, 80]} />
        
        {/* Main mountain terrain */}
        <VaporwaveMountains />
      </Canvas>
    </div>
  );
};
