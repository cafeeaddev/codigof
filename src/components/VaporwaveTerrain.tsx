
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { getVaporwaveColor, getEmissiveIntensity } from '../utils/vaporwaveColors';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8); // Mais repetições para terreno maior
  }, [texture]);
  
  // Create expanded terrain geometry with better displacement
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 12, 64, 64); // Terreno muito maior
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    // Add terrain displacement with more organic variations
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Calculate distance from center line
      const distanceFromCenter = Math.abs(x);
      
      // Create mountains on the sides with smoother transitions
      let height = 0;
      if (distanceFromCenter > 1.5) {
        height = Math.pow((distanceFromCenter - 1.5) * 0.8, 1.8) * 0.4;
      }
      
      // Add multiple layers of noise for more organic terrain
      const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 0.05;
      const noise2 = Math.sin(x * 8) * Math.cos(z * 12) * 0.02;
      const noise3 = Math.sin(x * 15) * Math.cos(z * 20) * 0.01;
      
      // Create valley in the center with gentle slopes
      const centerEffect = Math.max(0, 1 - (distanceFromCenter / 2));
      const valleyDepth = centerEffect * 0.1;
      
      height += noise1 + noise2 + noise3 - valleyDepth;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, height);
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Animation and color updates
  useFrame(() => {
    if (meshRef.current && materialRef.current) {
      // Move terrain based on scroll instead of time
      meshRef.current.position.z = (scrollProgress * 10) % 12 - 6;
      
      // Get average height for color calculation (simplified)
      const avgHeight = maxHeight * 0.3;
      
      // Update material colors based on scroll
      const newColor = getVaporwaveColor(scrollProgress, avgHeight);
      const newEmissive = getVaporwaveColor(scrollProgress * 0.5, avgHeight * 0.5);
      const emissiveIntensity = getEmissiveIntensity(scrollProgress, avgHeight);
      
      materialRef.current.color = newColor;
      materialRef.current.emissive = newEmissive;
      materialRef.current.emissiveIntensity = emissiveIntensity;
      
      // Vary metalness and roughness for different material feel
      materialRef.current.metalness = 0.6 + (scrollProgress * 0.3);
      materialRef.current.roughness = 0.4 - (scrollProgress * 0.2);
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        ref={materialRef}
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
