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
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 2);
  }, [texture]);
  
  // Create terrain geometry with displacement
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 2, 24, 24);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Add terrain displacement (mountains on the sides)
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Calculate distance from center line
      const distanceFromCenter = Math.abs(x);
      
      // Create steep mountains on the sides
      if (distanceFromCenter > 0.2) {
        const height = Math.pow(distanceFromCenter * 2, 2) * 0.3;
        positions[i + 2] = height;
      }
      
      // Add some noise for more interesting terrain
      const noise = (Math.sin(x * 10) * Math.cos(z * 8)) * 0.02;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Continuous movement towards viewer without jumps
      meshRef.current.position.z = state.clock.elapsedTime * 0.5;
      
      // Animate texture offset for seamless flow
      if (texture) {
        texture.offset.y = state.clock.elapsedTime * 0.3;
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