
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

  // Create dramatic terrain geometry for realistic mountains
  const { backgroundGeometry, maxHeight } = useMemo(() => {
    // High-resolution terrain geometry for dramatic mountains
    const bgGeo = new THREE.PlaneGeometry(100, 100, 200, 200);
    const positionAttribute = bgGeo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create dramatic mountain terrain with peaks and valleys
      const wave1 = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 2.5;
      const wave2 = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 1.8;
      const wave3 = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 1.2;
      const wave4 = Math.sin(x * 1.6) * Math.cos(z * 1.6) * 0.8;
      const wave5 = Math.sin(x * 3.2) * Math.cos(z * 3.2) * 0.4;
      
      // Ridge-like formations for more realistic mountains
      const ridgeEffect = Math.abs(Math.sin(x * 0.1)) * Math.abs(Math.cos(z * 0.1)) * 1.5;
      
      // Distance-based variation for depth
      const distance = Math.sqrt(x * x + z * z);
      const distanceEffect = Math.sin(distance * 0.15) * Math.cos(distance * 0.1) * 0.8;
      
      // Combine all effects for dramatic terrain
      const height = wave1 + wave2 + wave3 + wave4 + wave5 + ridgeEffect + distanceEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    bgGeo.computeVertexNormals();
    
    return { backgroundGeometry: bgGeo, maxHeight };
  }, []);
  
  
  // Enhanced color calculation with cyan/blue neon
  const getEnhancedColor = (progress: number): string => {
    // Use cyan/blue color for neon lines like in reference image
    const neonCyan = [0, 255, 255]; // #00ffff
    
    const r = neonCyan[0];
    const g = neonCyan[1];
    const b = neonCyan[2];
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Animation and color updates with pulsating effect
  useFrame((state) => {
    // Movimento automático contínuo + efeito do scroll + posição da câmera
    const timeMovement = state.clock.elapsedTime * 0.7; // Movimento mais lento e dramático
    const scrollMovement = scrollProgress * 6; // Acelera mais com o scroll
    const cameraZOffset = cameraPosition[2] * 0.2; // Ajusta baseado na posição Z da câmera
    
    // Combina os três movimentos - INVERTIDO para ir para frente
    const totalMovement = -(timeMovement + scrollMovement + cameraZOffset);
    
    // Pulsating effect for wireframe material
    const pulseIntensity = 2.0 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    
    // Move cada grupo de terreno individualmente
    groupRefs.current.forEach((group, index) => {
      if (group) {
        // Calcula posição com loop infinito, ajustando pela câmera - MOVIMENTO PARA FRENTE
        const basePosition = -20 + (index * -80);
        group.position.z = basePosition + (totalMovement % 240);
        
        // Reset position quando passa muito longe para criar loop infinito
        if (group.position.z < -120) {
          group.position.z += 240;
        }
        
        // Apply pulsating effect to wireframe materials
        const wireframeMesh = group.children[1] as THREE.Mesh;
        if (wireframeMesh && wireframeMesh.material) {
          const material = wireframeMesh.material as THREE.MeshBasicMaterial;
          material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
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
          position={[0, 0, -25 + (index * -60)]}
        >
          {/* Dark terrain base with gradient effect */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -3.0, 0]}
          >
            <meshStandardMaterial
              ref={index === 0 ? backgroundMaterialRef : undefined}
              map={backgroundTexture}
              normalMap={normalTexture}
              displacementMap={wireframeTexture}
              displacementScale={0.8}
              color="#0a0a1a"
              emissive="#050a1a"
              emissiveIntensity={0.4}
              roughness={0.7}
              metalness={0.3}
              transparent={true}
              opacity={0.95}
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>
          
          {/* Cyan/blue neon wireframe overlay */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -2.94, 0]}
          >
            <meshBasicMaterial
              color="#00ffff"
              transparent={true}
              opacity={0.95}
              wireframe={true}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
