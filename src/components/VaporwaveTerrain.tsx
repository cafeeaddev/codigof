
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
  const plane1Ref = useRef<THREE.Group>(null);
  const plane2Ref = useRef<THREE.Group>(null);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Configurações do sistema de 2 planos
  const PLANE_SIZE = 60; // Tamanho de cada plano
  const PLANE_DISTANCE = PLANE_SIZE * 0.8; // Distância entre os planos
  
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
  
  // Sistema de animação com 2 planos infinitos
  useFrame((state) => {
    const timeMovement = state.clock.elapsedTime * 0.8;
    const scrollMovement = scrollProgress * 6;
    const totalMovement = timeMovement + scrollMovement;
    
    // Posição base da câmera no eixo Z
    const cameraZ = cameraPosition[2];
    
    // Atualizar posições dos planos
    if (plane1Ref.current && plane2Ref.current) {
      // Plane 1 - sempre à frente
      const plane1Z = cameraZ + 10 + (totalMovement % PLANE_DISTANCE);
      plane1Ref.current.position.z = plane1Z;
      
      // Plane 2 - sempre atrás do Plane 1
      const plane2Z = plane1Z + PLANE_DISTANCE;
      plane2Ref.current.position.z = plane2Z;
      
      // Sistema de teleporting: quando um plano fica muito atrás da câmera,
      // teleporta ele para frente do outro plano
      if (plane1Ref.current.position.z < cameraZ - 20) {
        plane1Ref.current.position.z = plane2Ref.current.position.z + PLANE_DISTANCE;
      }
      if (plane2Ref.current.position.z < cameraZ - 20) {
        plane2Ref.current.position.z = plane1Ref.current.position.z + PLANE_DISTANCE;
      }
    }
  });
  
  return (
    <group>
      {/* Plane 1 - Sistema de 2 planos infinitos */}
      <group 
        ref={plane1Ref}
        position={[0, 0, cameraPosition[2] + 10]}
      >
        {/* Neon terrain with grid pattern and depth */}
        <mesh
          geometry={backgroundGeometry}
          rotation={[-Math.PI * 0.5, 0, 0]}
          position={[0, -1, 0]}
        >
          <meshStandardMaterial
            ref={backgroundMaterialRef}
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
            color="#2A689D"
            transparent={true}
            opacity={0.9}
            wireframe={true}
          />
        </mesh>
      </group>

      {/* Plane 2 - Sistema de 2 planos infinitos */}
      <group 
        ref={plane2Ref}
        position={[0, 0, cameraPosition[2] + 10 + PLANE_DISTANCE]}
      >
        {/* Neon terrain with grid pattern and depth */}
        <mesh
          geometry={backgroundGeometry}
          rotation={[-Math.PI * 0.5, 0, 0]}
          position={[0, -1, 0]}
        >
          <meshStandardMaterial
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
            color="#2A689D"
            transparent={true}
            opacity={0.9}
            wireframe={true}
          />
        </mesh>
      </group>
    </group>
  );
};
