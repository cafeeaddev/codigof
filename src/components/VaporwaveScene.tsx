
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { useRef } from 'react';
import * as THREE from 'three';

// Simplified camera controller
const ScrollCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame(() => {
    // Much simpler camera positioning
    const height = 3 + scrollProgress * 2;
    const forward = scrollProgress * 3;
    
    camera.position.set(0, height, forward + 5);
    camera.lookAt(0, 0, forward);
    
    console.log('Camera - Scroll:', scrollProgress.toFixed(2), 
               'Position:', `[${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}]`);
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Component rendering...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 3, 5],
          fov: 75,
          near: 0.1,
          far: 100,
        }}
        className="w-full h-full"
        onCreated={({ gl, scene, camera }) => {
          console.log('Canvas created successfully!');
          console.log('WebGL Renderer:', gl.getContext().getParameter(gl.getContext().VERSION));
          console.log('Camera position:', camera.position);
          console.log('Scene children count:', scene.children.length);
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
      >
        {/* Debug info */}
        <primitive 
          object={new THREE.AxesHelper(2)} 
          position={[0, 0, 0]} 
        />
        
        {/* Scroll-based camera controller */}
        <ScrollCamera />
        
        {/* Simplified background */}
        <VaporwaveBackground />
        
        {/* Reduced stars for performance */}
        <Stars 
          radius={50} 
          depth={20} 
          count={500} 
          factor={2} 
          saturation={0} 
          fade={true}
        />
        
        {/* Simplified lighting */}
        <ambientLight intensity={0.3} color="#ffffff" />
        <directionalLight
          position={[2, 5, 2]}
          intensity={0.8}
          color="#ff00ff"
        />
        
        {/* Reduced fog for debugging */}
        <fog attach="fog" args={['#000033', 10, 50]} />
        
        {/* Main terrain component */}
        <VaporwaveTerrain />
      </Canvas>
    </div>
  );
};
