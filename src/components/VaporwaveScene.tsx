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
          near: 0.1,
          far: 300,
        }}
        gl={{ alpha: true, depth: true }}
        className="w-full h-full"
        onCreated={({ scene }) => {
          // Fog mais suave e mais distante para não interferir
          scene.fog = new THREE.Fog(0x0a0a0a, 80, 200);
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
        
        
        {/* FUNDO AMARELO PARA DEBUG - posição bem atrás */}
        <mesh position={[0, -10, -150]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Terrain background - dark plane behind the terrain */}
        <mesh position={[0, -8, -60]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[180, 150]} />
          <meshBasicMaterial 
            color="#1a0a2e" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
        
      </Canvas>
    </div>
  );
};