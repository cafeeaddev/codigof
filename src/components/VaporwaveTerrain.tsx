
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
  
  // Create expanded terrain geometry with central path
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 16, 128, 128);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create central path effect - wider and deeper
      const distanceFromCenter = Math.abs(x);
      const pathWidth = 3.5; // Increased width for more visible path
      const pathDepth = 0.8; // Increased depth for more pronounced depression
      
      // Path effect - creates a depression in the center
      let pathEffect = 0;
      if (distanceFromCenter < pathWidth) {
        const pathFactor = 1 - (distanceFromCenter / pathWidth);
        pathEffect = -pathDepth * Math.pow(pathFactor, 3); // More pronounced curve
      }
      
      // Multiple wave layers for terrain variation
      const wave1 = Math.sin(x * 0.8) * Math.cos(z * 0.6) * 0.8;
      const wave2 = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 0.4;
      const wave3 = Math.sin(x * 3) * Math.cos(z * 2.5) * 0.2;
      const wave4 = Math.sin(x * 6) * Math.cos(z * 4) * 0.1;
      
      // Distance-based elevation
      const distanceFromCenterTotal = Math.sqrt(x * x * 0.1 + z * z * 0.05);
      const distanceEffect = Math.sin(distanceFromCenterTotal) * 0.3;
      
      // Combine all effects - path effect reduces the overall height in the center
      const height = (wave1 + wave2 + wave3 + wave4 + distanceEffect) + pathEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Get dynamic cyan color based on scroll
  const getCyanColor = (progress: number) => {
    const hue = 180 + (progress * 20); // 180-200 range (cyan to blue-cyan)
    const saturation = 95 + (progress * 5); // 95-100%
    const lightness = 50 + (progress * 30); // 50-80%
    
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
      materialRef.current.emissiveIntensity = 1.5 + (scrollProgress * 0.8);
      
      // Wireframe properties
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
        emissive="#0088ff"
        emissiveIntensity={2.0}
        metalness={0.1}
        roughness={0.9}
        wireframe={true}
        transparent={true}
        opacity={0.95}
      />
    </mesh>
  );
};
