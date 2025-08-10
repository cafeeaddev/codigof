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
          // Fog mais suave para não esconder as estrelas
          scene.fog = new THREE.Fog(0x0a0a0a, 25, 120);
        }}
      >
        {/* Background gradient */}
        <VaporwaveBackground />
        
        {/* Custom stars positioned only in the sky - renderizar depois do background */}
        <CustomStars />
        
        {/* Darker ambient lighting for dramatic effect */}
        <ambientLight intensity={0.4} color="#ffffff" />
        
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
        
        
        {/* Terrain background - dark plane behind the terrain */}
        <mesh position={[0, -2, -30]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 100]} />
          <meshBasicMaterial 
            color="#0a0a1a" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
        
      </Canvas>
    </div>
  );
};