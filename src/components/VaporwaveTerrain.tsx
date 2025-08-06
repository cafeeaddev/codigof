import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    emissive: string;
    background: string[];
    light: string;
  };
}

interface VaporwaveTerrainProps {
  theme: Theme;
}

export const VaporwaveTerrain = ({ theme }: VaporwaveTerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the grid texture
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties for infinite effect
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 8);
  }, [texture]);
  
  // Create larger terrain geometry for infinite effect
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4, 8, 64, 64);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Add terrain displacement - create a filled valley without center depression
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Calculate distance from center line
      const distanceFromCenter = Math.abs(x);
      
      // Create gradual elevation from center to edges - no valley in center
      const baseHeight = 0.05; // Base floor level
      const sideHeight = Math.pow(distanceFromCenter * 1.8, 1.5) * 0.25;
      positions[i + 2] = baseHeight + sideHeight;
      
      // Add some noise for more interesting terrain
      const noise = (Math.sin(x * 10) * Math.cos(z * 8)) * 0.015;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Infinite animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Infinite smooth movement
      const speed = 0.4;
      meshRef.current.position.z = ((state.clock.elapsedTime * speed) % 12) - 2;
      
      // Infinite texture animation
      if (texture) {
        texture.offset.y = (state.clock.elapsedTime * 0.15) % 1;
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, 0, 0.15]}
    >
      <meshStandardMaterial
        map={texture}
        color={theme.colors.primary}
        emissive={theme.colors.emissive}
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
        wireframe={false}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};