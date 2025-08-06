

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the grid texture
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties for longer path
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 8); // Increased repetition for longer path feel
  }, [texture]);
  
  // Create terrain geometry with displacement - making it much longer
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 6, 24, 72); // Made depth 6x longer with more segments
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
      
      // Add some noise for more interesting terrain variation along the longer path
      const noise = (Math.sin(x * 10) * Math.cos(z * 4)) * 0.02;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Animation loop - slower movement for longer path sensation
  useFrame((state) => {
    if (meshRef.current) {
      // Start from inside the terrain and move forward continuously
      meshRef.current.position.z = (state.clock.elapsedTime * 0.3) % 6 - 1;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, 0, -1.5]} // Moved the terrain closer to start inside it
    >
      <meshStandardMaterial
        map={texture}
        color="#ff00ff"
        emissive="#440044"
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

