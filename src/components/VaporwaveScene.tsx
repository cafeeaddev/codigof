import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { Suspense } from 'react';

import { CustomStars } from './CustomStars';
import { GalaxySky } from './GalaxySky';
import { Meteors } from './Meteors';
import * as THREE from 'three';

interface VaporwaveSceneProps {
  cameraPosition: [number, number, number];
  cameraFov: number;
}

export const VaporwaveScene = ({ cameraPosition, cameraFov }: VaporwaveSceneProps) => {
  return (
    <div className="w-full h-[100svh] relative overflow-hidden">
      <Canvas
        dpr={[1, 1]}
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.1,
          far: 300,
        }}
        gl={{ alpha: false, depth: true, antialias: false, powerPreference: 'low-power' }}
        className="w-full h-full"
        onCreated={({ scene, gl }) => {
          // Reduce pixel ratio for performance on all devices
          gl.setPixelRatio(1);
          // Céu preto sólido e neblina preta para combinar
          gl.setClearColor('#000000', 1);
          scene.fog = new THREE.Fog(0x000000, 80, 200);
        }}
      >
        <Suspense fallback={null}>
          {/* Galaxy background + horizon stars */}
          <GalaxySky />
          <CustomStars />
          <Meteors />
          
          <ambientLight intensity={0.35} color="#ffffff" />
          
          {/* Main directional light */}
          <directionalLight
            position={[0, 5, 3]}
            intensity={0.35}
            color="#ffffff"
          />
          
          {/* Large ground plane to ensure no "glass floor" */}
          <mesh position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <meshBasicMaterial 
              color="#2b2b31" 
              transparent={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Main terrain */}
          <VaporwaveTerrain cameraPosition={cameraPosition} />
        </Suspense>
      </Canvas>
    </div>
  );
};