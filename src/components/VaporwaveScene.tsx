import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import * as THREE from 'three';
import { SkyGradient } from './SkyGradient';
import { ShootingStarsOverlay } from './ShootingStarsOverlay';

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
          // Céu preto sólido e neblina preta para combinar
          gl.setClearColor('#000000', 1);
          scene.fog = new THREE.Fog(0x000000, 80, 200);
        }}
      >
        {/* Background sky gradient */}
        <SkyGradient />

        <ambientLight intensity={0.4} color="#ffffff" />

        {/* Main directional light */}
        <directionalLight position={[0, 5, 3]} intensity={0.4} color="#ffffff" />

        {/* Large ground plane to ensure no "glass floor" */}
        <mesh position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial color="#2b2b31" transparent={false} side={THREE.DoubleSide} />
        </mesh>

        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
      </Canvas>

      {/* 2D canvas overlay with twinkling stars and shooting stars */}
      <ShootingStarsOverlay starDensity={2.0} maxStars={1000} shootingStarRate={1.2} maxShooting={6} />
    </div>
  );
};
