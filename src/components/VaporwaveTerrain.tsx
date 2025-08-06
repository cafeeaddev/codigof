
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const backgroundMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 16); // Increased repetition for denser grid
  }, [texture]);
  
  // Create expanded terrain geometry with central path - much more detailed
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 48, 256, 512); // Much longer terrain
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create natural terrain without central path
      const distanceFromCenter = Math.abs(x);
      
      // Generate natural mountain terrain
      let terrainHeight = 0;
      
      // Create varied elevation based on distance from center
      if (distanceFromCenter < 3.0) {
        // Lower central area
        const centralFactor = distanceFromCenter / 3.0;
        terrainHeight = Math.sin(centralFactor * Math.PI) * 0.3;
      } else if (distanceFromCenter < 6.0) {
        // Mountain ranges
        const mountainFactor = (distanceFromCenter - 3.0) / 3.0;
        terrainHeight = Math.sin(mountainFactor * Math.PI) * 0.5;
      } else {
        // Distant peaks
        const distantFactor = Math.min((distanceFromCenter - 6.0) / 2.0, 1.0);
        terrainHeight = Math.sin(distantFactor * Math.PI * 0.5) * 0.8;
      }
      
      // Multiple wave layers for more complex terrain like in reference
      const wave1 = Math.sin(x * 0.5) * Math.cos(z * 0.4) * 0.6; // Smaller primary waves
      const wave2 = Math.sin(x * 1.2) * Math.cos(z * 0.8) * 0.4; // Reduced medium waves
      const wave3 = Math.sin(x * 2.4) * Math.cos(z * 1.6) * 0.2; // Small waves
      const wave4 = Math.sin(x * 4.8) * Math.cos(z * 3.2) * 0.1; // Fine detail
      const wave5 = Math.sin(x * 9.6) * Math.cos(z * 6.4) * 0.05; // Very fine detail
      
      // Distance-based elevation with more variation
      const distanceFromCenterTotal = Math.sqrt(x * x * 0.08 + z * z * 0.03);
      const distanceEffect = Math.sin(distanceFromCenterTotal) * 0.4;
      
      // Add some randomness for more organic look
      const noise = (Math.sin(x * 15) * Math.cos(z * 15)) * 0.05;
      
      // Combine all effects
      const height = (wave1 + wave2 + wave3 + wave4 + wave5 + distanceEffect + noise) + terrainHeight;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Enhanced color system similar to reference image
  const getEnhancedColor = (progress: number) => {
    // Colors inspired by the reference: blue to orange/gold gradient
    if (progress < 0.5) {
      // Blue to cyan range
      const hue = 200 - (progress * 40); // 200 to 180 (blue to cyan)
      const saturation = 90 + (progress * 10); // 90-100%
      const lightness = 60 + (progress * 20); // 60-80%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    } else {
      // Cyan to orange/gold range
      const localProgress = (progress - 0.5) * 2;
      const hue = 180 - (localProgress * 150); // 180 to 30 (cyan to orange)
      const saturation = 95 + (localProgress * 5); // 95-100%
      const lightness = 70 + (localProgress * 10); // 70-80%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    }
  };
  
  // Animation and color updates
  useFrame((state) => {
    if (meshRef.current && materialRef.current && backgroundMeshRef.current && backgroundMaterialRef.current) {
      // Continuous terrain movement + inverted scroll influence - longer cycle
      const timeMovement = state.clock.elapsedTime * 0.2;
      const scrollMovement = -scrollProgress * 12;
      const zPosition = ((timeMovement + scrollMovement) % 48) - 24; // Much longer cycle
      
      meshRef.current.position.z = zPosition;
      backgroundMeshRef.current.position.z = zPosition;
      
      // Update material colors with enhanced gradient
      const baseColor = getEnhancedColor(scrollProgress);
      const emissiveColor = getEnhancedColor(scrollProgress * 0.8);
      
      materialRef.current.color = baseColor;
      materialRef.current.emissive = emissiveColor;
      materialRef.current.emissiveIntensity = 2.0 + (scrollProgress * 1.0);
      
      // Enhanced wireframe properties
      materialRef.current.metalness = 0.2;
      materialRef.current.roughness = 0.8;
      
      // Update background material - darker, subtle
      backgroundMaterialRef.current.color = new THREE.Color(0x0a0a1a);
      backgroundMaterialRef.current.opacity = 0.6;
    }
  });
  
  return (
    <group>
      {/* Background terrain - solid dark surface */}
      <mesh
        ref={backgroundMeshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.01, -2]}
      >
        <meshStandardMaterial
          ref={backgroundMaterialRef}
          color="#0a0a1a"
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wireframe terrain - on top */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, -2]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#0088ff"
          emissive="#0066cc"
          emissiveIntensity={2.5}
          metalness={0.2}
          roughness={0.8}
          wireframe={true}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};
