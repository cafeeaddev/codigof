
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

export const VaporwaveScene = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0.4, 2], // Câmera mais baixa e mais próxima
          fov: 80, // Campo de visão mais amplo
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground />
        <Stars 
          radius={100} 
          depth={50} 
          count={3000} 
          factor={4} 
          saturation={0} 
          fade={true}
        />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.15} color="#ff00ff" />
        <directionalLight
          position={[0, 2, 1]}
          intensity={0.6}
          color="#ff0080"
        />
        <pointLight
          position={[-3, 1, -1]}
          intensity={0.4}
          color="#00ffff"
          distance={15}
          decay={2}
        />
        <pointLight
          position={[3, 1, -1]}
          intensity={0.4}
          color="#ff00ff"
          distance={15}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain />
        
        {/* Adjusted development controls */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2} // Limita o ângulo para manter perspectiva de caminhada
          minDistance={1}
          maxDistance={8}
          target={[0, 0, -2]} // Olhar um pouco à frente no terreno
        />
      </Canvas>
    </div>
  );
};
