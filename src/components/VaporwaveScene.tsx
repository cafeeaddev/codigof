import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';

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
        gl={{ alpha: false, depth: true }}
        className="w-full h-full"
        onCreated={({ scene, gl }) => {
          // Fundo sólido cinza-chumbo e fog neutro
          gl.setClearColor('#2b2b31', 1);
          scene.fog = new THREE.Fog(0x2b2b31, 80, 200);
        }}
      >
        {/* Fundo sólido via clearColor - sem gradiente */}

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
        
        {/* Luzes coloridas removidas para manter cenário neutro */}
        
        
        {/* Fundo azul suave atrás do terreno para preencher o “vazado” */}
        <mesh position={[0, -10, -150]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[220, 220]} />
          <meshBasicMaterial 
            color="#2b2b31" 
            transparent={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Terrain background - dark plane behind the terrain */}
        <mesh position={[0, -8, -60]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[180, 150]} />
          <meshBasicMaterial 
            color="#2b2b31" 
            transparent={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
        
      </Canvas>
    </div>
  );
};