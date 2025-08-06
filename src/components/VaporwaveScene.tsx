
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveMountains } from './VaporwaveMountains';
import { VaporwaveParallaxBackground } from './VaporwaveParallaxBackground';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 75,
          near: 0.1,
          far: 100,
        }}
        className="w-full h-full"
      >
        {/* Animated gradient background */}
        <VaporwaveParallaxBackground />
        
        {/* Stars for atmosphere */}
        <Stars 
          radius={80} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0.3} 
          fade={true}
        />
        
        {/* Parallax mountain layers */}
        <VaporwaveMountains />
        
        {/* Development controls - can be removed in production */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};
