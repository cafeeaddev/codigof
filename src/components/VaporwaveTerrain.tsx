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
  const mesh1Ref = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mesh3Ref = useRef<THREE.Mesh>(null);
  
  // Load the grid texture
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties for infinite effect
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 8);
  }, [texture]);
  
  // Create terrain geometry
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
  
  // Infinite terrain system
  useFrame((state) => {
    const speed = 0.4;
    const terrainLength = 8; // Length of each terrain segment
    const totalLength = terrainLength * 3; // Total cycle length
    
    // Calculate base movement
    const baseOffset = (state.clock.elapsedTime * speed) % totalLength;
    
    // Position each terrain segment
    if (mesh1Ref.current) {
      mesh1Ref.current.position.z = baseOffset - terrainLength;
    }
    if (mesh2Ref.current) {
      mesh2Ref.current.position.z = baseOffset;
    }
    if (mesh3Ref.current) {
      mesh3Ref.current.position.z = baseOffset + terrainLength;
    }
    
    // Animate texture offset for seamless flow
    if (texture) {
      texture.offset.y = (state.clock.elapsedTime * 0.15) % 1;
    }
  });
  
  // Material configuration
  const materialProps = {
    map: texture,
    color: theme.colors.primary,
    emissive: theme.colors.emissive,
    emissiveIntensity: 0.2,
    metalness: 0.8,
    roughness: 0.2,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
  };
  
  return (
    <group>
      {/* First terrain segment */}
      <mesh
        ref={mesh1Ref}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      >
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Second terrain segment */}
      <mesh
        ref={mesh2Ref}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      >
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* Third terrain segment */}
      <mesh
        ref={mesh3Ref}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      >
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  );
};