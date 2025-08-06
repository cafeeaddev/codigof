
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { VaporwaveRoad } from './VaporwaveRoad';
import { VaporwaveMountains } from './VaporwaveMountains';
import { VaporwaveBackground } from './VaporwaveBackground';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

// Câmera que caminha SOBRE o terreno seguindo as elevações
const TerrainWalkingCamera = () => {
  const scrollProgress = useScrollTerrain();
  const { camera } = useThree();
  
  useFrame(() => {
    const walkingHeight = 1.8; // Altura de caminhada
    const forwardDistance = scrollProgress * 50; // Movimento baseado no scroll
    
    // Simular caminhada sobre o terreno com pequenas variações de altura
    const terrainHeight = Math.sin(forwardDistance * 0.1) * 0.1 + 
                         Math.cos(forwardDistance * 0.15) * 0.05;
    
    // Posição da câmera - seguindo o terreno
    camera.position.set(
      Math.sin(forwardDistance * 0.05) * 0.3, // Pequeno balanço lateral
      walkingHeight + terrainHeight, // Altura seguindo terreno
      forwardDistance + 3 // Posição Z baseada no scroll
    );
    
    // Olhar para frente com pequeno movimento natural
    const lookAheadDistance = 15;
    const lookHeight = walkingHeight + terrainHeight * 0.7;
    camera.lookAt(
      Math.sin(forwardDistance * 0.03) * 0.2,
      lookHeight,
      forwardDistance + lookAheadDistance
    );
  });
  
  return null;
};

export const VaporwaveScene = () => {
  console.log('VaporwaveScene: Renderizando cena vaporwave com montanhas...');
  
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{
          position: [0, 1.8, 3],
          fov: 85,
          near: 0.1,
          far: 200,
        }}
        className="w-full h-full"
        onCreated={({ gl }) => {
          console.log('Vaporwave Scene com montanhas criado!');
          gl.setClearColor('#0a0015');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        {/* Câmera que caminha sobre o terreno */}
        <TerrainWalkingCamera />
        
        {/* Background vaporwave clássico */}
        <VaporwaveBackground />
        
        {/* Estrelas distantes */}
        <Stars 
          radius={150} 
          depth={50} 
          count={800} 
          factor={2} 
          saturation={0.3} 
          fade={true}
        />
        
        {/* Iluminação da estrada */}
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
        
        {/* Neblina atmosférica */}
        <fog attach="fog" args={['#0a0015', 30, 80]} />
        
        {/* Estrada principal */}
        <VaporwaveRoad />
        
        {/* Montanhas vaporwave ao lado */}
        <VaporwaveMountains />
      </Canvas>
    </div>
  );
};
