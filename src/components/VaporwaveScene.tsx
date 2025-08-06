
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';
import { CustomStars } from './CustomStars';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 4, 3], // Altura e distância ajustadas para perspectiva equilibrada
          fov: 80, // Campo de visão ampliado para capturar mais da cena
          near: 0.01,
          far: 200,
        }}
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
        <VaporwaveTerrain />
        
        {/* Development controls */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2} // Permite olhar mais para baixo mantendo equilíbrio
          minPolarAngle={Math.PI / 6}   // Perspectiva natural, não muito inclinada
          minDistance={3}
          maxDistance={6}
          target={[0, -0.5, -3]} // Foco equilibrado entre céu e terreno
        />
      </Canvas>
    </div>
  );
};
