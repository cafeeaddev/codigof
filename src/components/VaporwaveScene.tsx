import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { CustomStars } from './CustomStars';

interface VaporwaveSceneProps {
  cameraPosition: [number, number, number];
  cameraFov: number;
}

export const VaporwaveScene = ({ cameraPosition, cameraFov }: VaporwaveSceneProps) => {
  // Ajustar a posição da câmera para uma perspectiva mais elevada
  const adjustedCameraPosition: [number, number, number] = [
    cameraPosition[0], 
    Math.max(cameraPosition[1], 5), // Mínimo Y = 5 para perspectiva elevada
    cameraPosition[2]
  ];
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: adjustedCameraPosition,
          fov: Math.min(cameraFov, 60), // Limitar FOV para perspectiva mais focada
          near: 0.01,
          far: 200,
        }}
        gl={{ alpha: true }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        
        {/* Custom stars positioned only in the sky */}
        <CustomStars />
        
        {/* Neutral lighting to avoid color contamination */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight
          position={[0, 3, 2]}
          intensity={0.8}
          color="#ffffff"
        />
        <pointLight
          position={[-5, 2, 0]}
          intensity={0.6}
          color="#ffaa00"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[5, 2, 0]}
          intensity={0.6}
          color="#ffdd00"
          distance={20}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain cameraPosition={cameraPosition} />
        
      </Canvas>
    </div>
  );
};