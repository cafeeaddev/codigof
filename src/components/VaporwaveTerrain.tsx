
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const groupRefs = useRef<THREE.Group[]>([]);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
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
  
  
  // Enhanced color calculation with reference-matched palette
  const getEnhancedColor = (progress: number): string => {
    // Reference colors: deep blue to vibrant purple
    const deepBlue = [15, 15, 35];    // #0F0F23
    const vibrantPurple = [102, 0, 255]; // #6600ff
    
    const r = Math.round(deepBlue[0] + (vibrantPurple[0] - deepBlue[0]) * progress);
    const g = Math.round(deepBlue[1] + (vibrantPurple[1] - deepBlue[1]) * progress);
    const b = Math.round(deepBlue[2] + (vibrantPurple[2] - deepBlue[2]) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Animation and color updates
  useFrame((state) => {
    // Movimento automático contínuo + efeito do scroll
    const timeMovement = state.clock.elapsedTime * 0.5; // Movimento automático
    const scrollMovement = scrollProgress * 4; // Acelera com o scroll
    
    // Combina os dois movimentos
    const totalMovement = timeMovement + scrollMovement;
    
    // Move cada grupo de terreno individualmente
    groupRefs.current.forEach((group, index) => {
      if (group) {
        // Calcula posição com loop infinito
        const basePosition = 15 + (index * 60);
        group.position.z = basePosition + (totalMovement % 180);
        
        // Reset position quando passa muito longe para criar loop infinito
        if (group.position.z > 100) {
          group.position.z -= 180;
        }
      }
    });
  });
  
  return (
    <group>
      {/* Múltiplos terrenos para loop infinito perfeito */}
      {[0, 1, 2].map((index) => (
        <group 
          key={index}
          ref={(el) => {
            if (el) {
              groupRefs.current[index] = el;
            }
          }}
          position={[0, 0, 15 + (index * 60)]}
        >
          {/* Neon terrain with grid pattern and depth */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -1.2, 0]}
          >
            <meshStandardMaterial
              ref={index === 0 ? backgroundMaterialRef : undefined}
              map={wireframeTexture}
              normalMap={normalTexture}
              color="#1a1a2e"
              emissive={getEnhancedColor(scrollProgress)}
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.8}
              transparent={true}
              opacity={0.95}
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>
          
          {/* Wireframe overlay for neon grid effect */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -1.18, 0]}
          >
            <meshBasicMaterial
              color="#06C4ef"
              transparent={true}
              opacity={0.8}
              wireframe={true}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
