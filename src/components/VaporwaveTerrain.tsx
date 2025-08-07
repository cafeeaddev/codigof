
// Terrain component with infinite 2-plane system
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface VaporwaveTerrainProps {
  cameraPosition?: [number, number, number];
}

export const VaporwaveTerrain = ({ cameraPosition = [0, 3, 5] }: VaporwaveTerrainProps) => {
  const terrainRefs = useRef<THREE.Group[]>([]);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Configurações do sistema de múltiplos terrenos infinitos
  const TERRAIN_SIZE = 40; // Tamanho de cada terreno
  const NUM_TERRAINS = 6; // Número de terrenos para garantir cobertura total
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties for wireframe
  const wireframeTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8); // Square grid repetition
    return tex;
  }, [texture]);
  
  // Configure texture for background (stone-like appearance)
  const backgroundTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4); // Less repetition for better visibility
    tex.offset.set(0, 0);
    // Increase contrast and brightness
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [texture]);
  
  // Create normal map from the same texture for depth
  const normalTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, [texture]);
  
  // Helper function to calculate height at any point (matches terrain generation)
  const calculateHeightAtPoint = (x: number, z: number) => {
    const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
    const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
    const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
    const wave4 = Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.1;
    const distanceEffect = Math.sin(Math.sqrt(x * x + z * z) * 0.2) * 0.3;
    return wave1 + wave2 + wave3 + wave4 + distanceEffect;
  };

  // Create square terrain geometry for background
  const { backgroundGeometry, maxHeight } = useMemo(() => {
    // Background terrain geometry - aumentando o tamanho para cobrir mais área
    const bgGeo = new THREE.PlaneGeometry(80, 80, 120, 120);
    const positionAttribute = bgGeo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create smooth wave terrain like in reference image
      const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
      const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
      const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
      const wave4 = Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.1;
      
      // Distance-based variation for more dynamic terrain
      const distanceEffect = Math.sin(Math.sqrt(x * x + z * z) * 0.2) * 0.3;
      
      // Combine waves for natural undulating terrain
      const height = wave1 + wave2 + wave3 + wave4 + distanceEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    bgGeo.computeVertexNormals();
    
    return { backgroundGeometry: bgGeo, maxHeight };
  }, []);
  
  
  // Enhanced color calculation with custom blue color #2A689D
  const getEnhancedColor = (progress: number): string => {
    // Use #2A689D color for neon lines
    const customBlue = [42, 104, 157]; // #2A689D
    
    const r = customBlue[0];
    const g = customBlue[1];
    const b = customBlue[2];
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Sistema de animação com múltiplos terrenos infinitos
  useFrame((state) => {
    const timeMovement = state.clock.elapsedTime * 1.2; // Movimento automático mais rápido
    const scrollMovement = scrollProgress * 8; // Mais responsivo ao scroll
    const totalMovement = timeMovement + scrollMovement;
    
    // Posição base: comece no meio da tela (posição da câmera)
    const baseCameraZ = cameraPosition[2];
    
    // Atualizar posições de todos os terrenos
    terrainRefs.current.forEach((terrain, index) => {
      if (terrain) {
        // Cada terreno fica posicionado em sequência, começando do meio da tela
        const basePosition = baseCameraZ - TERRAIN_SIZE + (index * TERRAIN_SIZE);
        terrain.position.z = basePosition - (totalMovement % (NUM_TERRAINS * TERRAIN_SIZE));
        
        // Sistema de teleporting: quando um terreno sai muito da frente da câmera,
        // reposiciona ele atrás de todos os outros
        const totalDistance = NUM_TERRAINS * TERRAIN_SIZE;
        if (terrain.position.z < baseCameraZ - (totalDistance + TERRAIN_SIZE)) {
          terrain.position.z += totalDistance;
        }
      }
    });
  });
  
  return (
    <group>
      {/* Sistema de múltiplos terrenos infinitos */}
      {Array.from({ length: NUM_TERRAINS }, (_, index) => (
        <group 
          key={index}
          ref={(el) => {
            if (el) {
              terrainRefs.current[index] = el;
            }
          }}
          position={[0, 0, cameraPosition[2] - TERRAIN_SIZE + (index * TERRAIN_SIZE)]}
        >
          {/* Neon terrain with grid pattern and depth */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -1, 0]}
          >
            <meshStandardMaterial
              ref={index === 0 ? backgroundMaterialRef : undefined}
              map={wireframeTexture}
              normalMap={normalTexture}
              color="#0D0825"
              emissive="#0D0825"
              emissiveIntensity={0.8}
              roughness={0.1}
              metalness={0.9}
              transparent={true}
              opacity={0.97}
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>
          
          {/* Wireframe overlay for neon grid effect */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -0.98, 0]}
          >
            <meshBasicMaterial
              color="#00FFFF"
              transparent={true}
              opacity={0.9}
              wireframe={true}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
