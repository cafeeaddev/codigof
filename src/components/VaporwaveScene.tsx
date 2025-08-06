
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwaveRoad } from './VaporwaveRoad';
import { VaporwaveDistantMountains } from './VaporwaveDistantMountains';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

// First person camera on the road - movement based ONLY on scroll
const RoadCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame(() => {
    // First person view on the road - low height like walking
    const roadHeight = 1.5;
    const forwardDistance = scrollProgress * 50; // Move forward only with scroll
    
    // Camera position - always on the road, moving forward with scroll
    camera.position.set(
      0, // Center of road
      roadHeight, // Walking height
      forwardDistance + 5 // Forward position based on scroll
    );
    
    // Always look ahead down the road
    camera.lookAt(0, roadHeight * 0.7, forwardDistance - 10);
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Rendering scroll-controlled vaporwave highway...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 1.5, 5],
          fov: 85,
          near: 0.1,
          far: 200,
        }}
        className="w-full h-full"
        onCreated={({ gl }) => {
          console.log('Vaporwave Highway Canvas created!');
          gl.setClearColor('#0a0015');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        {/* Scroll-controlled first person camera */}
        <RoadCamera />
        
        {/* Classic vaporwave background */}
        <VaporwaveBackground />
        
        {/* Distant stars */}
        <Stars 
          radius={150} 
          depth={50} 
          count={800} 
          factor={2} 
          saturation={0.3} 
          fade={true}
        />
        
        {/* Highway lighting */}
        <ambientLight intensity={0.15} color="#1a0033" />
        <directionalLight
          position={[0, 10, 5]}
          intensity={1.5}
          color="#ff007f"
        />
        <directionalLight
          position={[0, 8, -5]}
          intensity={0.8}
          color="#00ffff"
        />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#0a0015', 30, 80]} />
        
        {/* Main highway road */}
        <VaporwaveRoad />
        
        {/* Distant mountain silhouettes with parallax */}
        <VaporwaveDistantMountains />
      </Canvas>
    </div>
  );
};
