import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { CustomStars } from './CustomStars';
import * as THREE from 'three';

interface VaporwaveSceneProps {
  cameraPosition: [number, number, number];
  cameraFov: number;
}

export const VaporwaveScene = ({ cameraPosition, cameraFov }: VaporwaveSceneProps) => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.01,
          far: 300,
        }}
        gl={{ alpha: true }}
        className="w-full h-full"
        onCreated={({ scene }) => {
          // Add dark fog for atmosphere
          scene.fog = new THREE.Fog(0x0a0a0a, 15, 80);
        }}
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        
        {/* Custom stars positioned only in the sky */}
        <CustomStars />
        
        {/* Darker ambient lighting for dramatic effect */}
        <ambientLight intensity={0.2} color="#ffffff" />
        
        {/* Main directional light */}
        <directionalLight
          position={[0, 5, 3]}
          intensity={0.4}
          color="#ffffff"
        />
        
        {/* Blue lighting from center/below */}
        <pointLight
          position={[0, -2, 0]}
          intensity={8}
          color="#0080ff"
          distance={50}
          decay={2}
        />
        
        {/* Additional blue spot light for more dramatic effect */}
        <spotLight
          position={[0, -5, 5]}
          target-position={[0, 0, 0]}
          intensity={4}
          color="#0099ff"
          distance={40}
          angle={Math.PI / 3}
          penumbra={0.5}
          decay={2}
        />
        
        {/* Side accent lights with blue tint */}
        <pointLight
          position={[-8, 1, 0]}
          intensity={0.8}
          color="#0066cc"
          distance={25}
          decay={2}
        />
        <pointLight
          position={[8, 1, 0]}
          intensity={0.8}
          color="#0080ff"
          distance={25}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
        
      </Canvas>
    </div>
  );
};