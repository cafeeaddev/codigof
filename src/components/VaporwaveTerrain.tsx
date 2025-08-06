
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
  }, [texture]);
  
  // Create expanded terrain geometry with more pronounced undulations
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 16, 128, 128); // Increased resolution for better wireframe
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    // Create more dramatic terrain with multiple wave patterns
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Multiple wave layers for more complex terrain
      const wave1 = Math.sin(x * 0.8) * Math.cos(z * 0.6) * 0.8;
      const wave2 = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 0.4;
      const wave3 = Math.sin(x * 3) * Math.cos(z * 2.5) * 0.2;
      const wave4 = Math.sin(x * 6) * Math.cos(z * 4) * 0.1;
      
      // Create distance-based elevation
      const distanceFromCenter = Math.sqrt(x * x * 0.1 + z * z * 0.05);
      const distanceEffect = Math.sin(distanceFromCenter) * 0.3;
      
      const height = wave1 + wave2 + wave3 + wave4 + distanceEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Get dynamic cyan color based on scroll
  const getCyanColor = (progress: number) => {
    // Bright cyan with slight variations
    const hue = 180 + (progress * 20); // 180-200 range (cyan to blue-cyan)
    const saturation = 95 + (progress * 5); // 95-100%
    const lightness = 50 + (progress * 20); // 50-70%
    
    return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
  };
  
  // Animation and color updates
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Continuous terrain movement + inverted scroll influence
      const timeMovement = state.clock.elapsedTime * 0.3;
      const scrollMovement = -scrollProgress * 4;
      meshRef.current.position.z = ((timeMovement + scrollMovement) % 16) - 8;
      
      // Update material colors with bright cyan
      const baseColor = getCyanColor(scrollProgress);
      const emissiveColor = getCyanColor(scrollProgress * 0.7);
      
      materialRef.current.color = baseColor;
      materialRef.current.emissive = emissiveColor;
      materialRef.current.emissiveIntensity = 0.8 + (scrollProgress * 0.4); // Much brighter emission
      
      // Adjust material properties for wireframe glow
      materialRef.current.metalness = 0.1;
      materialRef.current.roughness = 0.9;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, 0, -1]}
    >
      <meshStandardMaterial
        ref={materialRef}
        color="#00ffff"
        emissive="#0088aa"
        emissiveIntensity={1.2}
        metalness={0.1}
        roughness={0.9}
        wireframe={true}
        transparent={true}
        opacity={0.95}
      />
    </mesh>
  );
};
